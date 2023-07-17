//! Superstream is a protocol and a collection of libraries for real-time money streaming on Solana. It allows anyone to
//! continuously stream money to anyone else transparently and efficiently.
//!
//! Superstream protocol is completely open-source. View it on
//! [GitHub](https://github.com/gpahal/superstream).
//!
//! Learn more about Superstream on [superstream.finance](https://superstream.finance/).
//!
//! ## Usage in CPI (Cross-Program Invocation)
//!
//! > **NOTE:** For a complete example, see
//! > [superstream-cpi-example](https://github.com/gpahal/superstream/tree/main/program/programs/superstream-cpi-example)
//!
//! - Add the dependency in your program's Cargo.toml
//!
//! ```toml ignore
//! superstream = { version = "0.3.1", features = ["cpi"] }
//! ```
//!
//! - Invoke Superstream's instruction. In the example below, we are calling Superstream's cancel instruction.
//!
//! ```rust ignore
//! #[program]
//! pub mod superstream_cpi_example {
//!     /// Cancel a stream.
//!     pub fn cancel(ctx: Context<Cancel>, seed: u64, name: String, recipient: Pubkey) -> Result<()> {
//!         let cpi_program = ctx.accounts.superstream_program.to_account_info();
//!         let cpi_accounts = superstream::cpi::accounts::Cancel {
//!             stream: ctx.accounts.stream.to_account_info(),
//!             signer: ctx.accounts.signer.to_account_info(),
//!             sender: ctx.accounts.sender.to_account_info(),
//!             mint: ctx.accounts.sender.to_account_info(),
//!             signer_token: ctx.accounts.signer_token.to_account_info(),
//!             sender_token: ctx.accounts.sender_token.to_account_info(),
//!             recipient_token: ctx.accounts.recipient_token.to_account_info(),
//!             escrow_token: ctx.accounts.escrow_token.to_account_info(),
//!             token_program: ctx.accounts.token_program.to_account_info(),
//!         };
//!         let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
//!
//!         superstream::cpi::cancel(cpi_ctx, seed, name, recipient)
//!     }
//!
//!     // ... other stuff
//! }
//!
//! /// Accounts struct for cancelling a stream.
//! #[derive(Accounts)]
//! pub struct Cancel<'info> {
//!     /// Stream PDA account.
//!     #[account(mut)]
//!     pub stream: AccountInfo<'info>,
//!
//!     /// Signer wallet.
//!     pub signer: Signer<'info>,
//!
//!     /// Stream sender account.
//!     pub sender: AccountInfo<'info>,
//!     /// SPL token mint account.
//!     pub mint: Box<Account<'info, Mint>>,
//!
//!     /// Associated token account of the signer.
//!     #[account(mut)]
//!     pub signer_token: Box<Account<'info, TokenAccount>>,
//!     /// Associated token account of the sender.
//!     #[account(mut)]
//!     pub sender_token: Box<Account<'info, TokenAccount>>,
//!     /// Associated token account of the recipient.
//!     #[account(mut)]
//!     pub recipient_token: Box<Account<'info, TokenAccount>>,
//!     /// Associated token escrow account holding the funds for this stream.
//!     #[account(mut)]
//!     pub escrow_token: Box<Account<'info, TokenAccount>>,
//!
//!     /// SPL token program.
//!     pub token_program: Program<'info, Token>,
//!
//!     /// Superstream program.
//!     pub superstream_program: Program<'info, superstream::program::Superstream>,
//! }
//!
//! // ... other stuff
//! ```

mod transfer;
mod utils;

pub mod error;
pub mod state;

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{
    error::StreamError,
    state::Stream,
    transfer::{transfer_from_escrow, transfer_to_escrow},
    utils::is_token_account_rent_exempt,
};

declare_id!("4WLNkJ6RKt54sv85iTgJPLgoaxfrxAasZWBxAPLUfuVG");

/// PDA account seed to create new stream PDA accounts.
pub const STREAM_ACCOUNT_SEED: &[u8] = b"stream";

#[program]
pub mod superstream {
    //! Module for superstream cpi methods and other utilities.

    use super::*;

    /// Create a new prepaid stream.
    ///
    /// # Arguments
    ///
    /// For more information on the arguments, see fields of the [`Stream`] struct.
    pub fn create_prepaid(
        mut ctx: Context<Create>,
        seed: u64,
        name: String,
        recipient: Pubkey,
        starts_at: u64,
        ends_at: u64,
        initial_amount: u64,
        flow_interval: u64,
        flow_rate: u64,
        sender_can_cancel: bool,
        sender_can_cancel_at: u64,
        sender_can_change_sender: bool,
        sender_can_change_sender_at: u64,
        sender_can_pause: bool,
        sender_can_pause_at: u64,
        recipient_can_resume_pause_by_sender: bool,
        recipient_can_resume_pause_by_sender_at: u64,
        anyone_can_withdraw_for_recipient: bool,
        anyone_can_withdraw_for_recipient_at: u64,
    ) -> Result<()> {
        create(
            &mut ctx,
            true,
            recipient,
            name,
            starts_at,
            ends_at,
            initial_amount,
            flow_interval,
            flow_rate,
            sender_can_cancel,
            sender_can_cancel_at,
            sender_can_change_sender,
            sender_can_change_sender_at,
            sender_can_pause,
            sender_can_pause_at,
            recipient_can_resume_pause_by_sender,
            recipient_can_resume_pause_by_sender_at,
            anyone_can_withdraw_for_recipient,
            anyone_can_withdraw_for_recipient_at,
            seed,
        )?;

        let stream = &mut ctx.accounts.stream;
        let prepaid_amount_needed = stream.initialize_prepaid()?;
        ctx.accounts.transfer_to_escrow(prepaid_amount_needed)
    }

    /// Create a new non-prepaid stream.
    ///
    /// # Arguments
    ///
    /// * `topup_amount` - Initial topup amount for the stream. The topup amount should be >= minimum deposit required.
    ///   See [`DEPOSIT_AMOUNT_PERIOD_IN_SECS`](crate::state::DEPOSIT_AMOUNT_PERIOD_IN_SECS) for more information.
    ///
    /// For more information on the other arguments, see fields of the [`Stream`] struct.
    pub fn create_non_prepaid(
        mut ctx: Context<Create>,
        seed: u64,
        name: String,
        recipient: Pubkey,
        starts_at: u64,
        ends_at: u64,
        initial_amount: u64,
        flow_interval: u64,
        flow_rate: u64,
        sender_can_cancel: bool,
        sender_can_cancel_at: u64,
        sender_can_change_sender: bool,
        sender_can_change_sender_at: u64,
        sender_can_pause: bool,
        sender_can_pause_at: u64,
        recipient_can_resume_pause_by_sender: bool,
        recipient_can_resume_pause_by_sender_at: u64,
        anyone_can_withdraw_for_recipient: bool,
        anyone_can_withdraw_for_recipient_at: u64,
        topup_amount: u64,
    ) -> Result<()> {
        create(
            &mut ctx,
            false,
            recipient,
            name,
            starts_at,
            ends_at,
            initial_amount,
            flow_interval,
            flow_rate,
            sender_can_cancel,
            sender_can_cancel_at,
            sender_can_change_sender,
            sender_can_change_sender_at,
            sender_can_pause,
            sender_can_pause_at,
            recipient_can_resume_pause_by_sender,
            recipient_can_resume_pause_by_sender_at,
            anyone_can_withdraw_for_recipient,
            anyone_can_withdraw_for_recipient_at,
            seed,
        )?;

        let stream = &mut ctx.accounts.stream;
        stream.initialize_non_prepaid(topup_amount)?;
        ctx.accounts.transfer_to_escrow(topup_amount)
    }

    /// Cancel a stream.
    ///
    /// # Arguments
    ///
    /// For more information on the arguments, see fields of the [`Stream`] struct.
    pub fn cancel(ctx: Context<Cancel>, seed: u64, name: String, recipient: Pubkey) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        let stream_key = stream.to_account_info().key;
        let bump = stream.bump;
        let params = stream.cancel(*stream_key, &ctx.accounts.signer, recipient)?;
        ctx.accounts
            .transfer_from_escrow_to_sender(seed, &name, bump, params.transfer_amount_sender)?;
        ctx.accounts
            .transfer_from_escrow_to_signer(seed, &name, bump, params.transfer_amount_signer)?;
        ctx.accounts
            .transfer_from_escrow_to_recipient(seed, &name, bump, params.transfer_amount_recipient)?;

        Ok(())
    }

    /// Withdraw excess sender topup from a non-prepaid stream.
    ///
    /// # Arguments
    ///
    /// For more information on the arguments, see fields of the [`Stream`] struct.
    pub fn withdraw_excess_topup_non_prepaid_ended(
        ctx: Context<WithdrawExcessTopupNonPrepaidEnded>,
        seed: u64,
        name: String,
    ) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        let amount = stream.withdraw_excess_topup_non_prepaid_ended()?;
        if amount > 0 {
            let bump = stream.bump;
            ctx.accounts.transfer_from_escrow(seed, &name, bump, amount)?;
        }
        Ok(())
    }

    /// Topup a non-prepaid stream.
    ///
    /// # Arguments
    ///
    /// * `topup_amount` - Topup amount for the stream. The topup amount should be <= maximum acceptable topup amount.
    ///
    /// For more information on the other arguments, see fields of the [`Stream`] struct.
    pub fn topup_non_prepaid(
        ctx: Context<TopupNonPrepaid>,
        _seed: u64,
        _name: String,
        topup_amount: u64,
    ) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        stream.topup_non_prepaid(topup_amount)?;
        ctx.accounts.transfer_to_escrow(topup_amount)
    }

    /// Change sender of a non-prepaid stream.
    ///
    /// # Arguments
    ///
    /// * `new_sender` - The new sender
    ///
    /// For more information on the other arguments, see fields of the [`Stream`] struct.
    pub fn change_sender_non_prepaid(
        ctx: Context<ChangeSenderNonPrepaid>,
        _seed: u64,
        _name: String,
        new_sender: Pubkey,
    ) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        stream.change_sender_non_prepaid(&ctx.accounts.sender, new_sender)
    }

    /// Withdraw recipient funds from a stream.
    ///
    /// # Arguments
    ///
    /// For more information on the arguments, see fields of the [`Stream`] struct.
    pub fn withdraw(
        ctx: Context<WithdrawAndChangeRecipient>,
        seed: u64,
        name: String,
        recipient: Pubkey,
    ) -> Result<()> {
        withdraw_and_change_recipient(ctx, seed, name, recipient, Pubkey::default())
    }

    /// Withdraw recipient funds from a stream and change recipient of a stream.
    ///
    /// # Arguments
    ///
    /// * `new_recipient` - The new recipient
    ///
    /// For more information on the other arguments, see fields of the [`Stream`] struct.
    pub fn withdraw_and_change_recipient(
        ctx: Context<WithdrawAndChangeRecipient>,
        seed: u64,
        name: String,
        recipient: Pubkey,
        new_recipient: Pubkey,
    ) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        let amount_available_to_withdraw =
            stream.withdraw_and_change_recipient(&ctx.accounts.signer, recipient, new_recipient)?;
        let bump = stream.bump;
        ctx.accounts
            .transfer_from_escrow(seed, &name, bump, amount_available_to_withdraw)
    }

    /// Pause a non-prepaid stream.
    ///
    /// # Arguments
    ///
    /// For more information on the arguments, see fields of the [`Stream`] struct.
    pub fn pause_non_prepaid(ctx: Context<PauseNonPrepaid>, _seed: u64, _name: String) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        stream.pause_non_prepaid(&ctx.accounts.signer)
    }

    /// Resume a non-prepaid stream.
    ///
    /// # Arguments
    ///
    /// For more information on the arguments, see fields of the [`Stream`] struct.
    pub fn resume_non_prepaid(ctx: Context<ResumeNonPrepaid>, _seed: u64, _name: String) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        stream.resume_non_prepaid(&ctx.accounts.signer)
    }
}

pub(crate) fn create(
    ctx: &mut Context<Create>,
    is_prepaid: bool,
    recipient: Pubkey,
    name: String,
    starts_at: u64,
    ends_at: u64,
    initial_amount: u64,
    flow_interval: u64,
    flow_rate: u64,
    sender_can_cancel: bool,
    sender_can_cancel_at: u64,
    sender_can_change_sender: bool,
    sender_can_change_sender_at: u64,
    sender_can_pause: bool,
    sender_can_pause_at: u64,
    recipient_can_resume_pause_by_sender: bool,
    recipient_can_resume_pause_by_sender_at: u64,
    anyone_can_withdraw_for_recipient: bool,
    anyone_can_withdraw_for_recipient_at: u64,
    seed: u64,
) -> Result<()> {
    let escrow_token_account = &ctx.accounts.escrow_token;
    require!(
        is_token_account_rent_exempt(escrow_token_account)?,
        StreamError::EscrowNotRentExempt,
    );

    let stream = &mut ctx.accounts.stream;
    stream.initialize(
        is_prepaid,
        ctx.accounts.mint.key(),
        ctx.accounts.sender.key(),
        recipient,
        name,
        starts_at,
        ends_at,
        initial_amount,
        flow_interval,
        flow_rate,
        sender_can_cancel,
        sender_can_cancel_at,
        sender_can_change_sender,
        sender_can_change_sender_at,
        sender_can_pause,
        sender_can_pause_at,
        recipient_can_resume_pause_by_sender,
        recipient_can_resume_pause_by_sender_at,
        anyone_can_withdraw_for_recipient,
        anyone_can_withdraw_for_recipient_at,
        seed,
        *ctx.bumps.get("stream").unwrap(),
    )
}

/// Accounts struct for creating a new stream.
#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct Create<'info> {
    /// Stream PDA account. This is initialized by the program.
    #[account(
        init,
        seeds = [
            STREAM_ACCOUNT_SEED,
            seed.to_le_bytes().as_ref(),
            mint.key().as_ref(),
            name.as_bytes(),
        ],
        payer = sender,
        space = Stream::space(&name),
        bump,
    )]
    pub stream: Account<'info, Stream>,

    /// Stream sender wallet.
    #[account(mut)]
    pub sender: Signer<'info>,
    /// SPL token mint account.
    pub mint: Box<Account<'info, Mint>>,

    /// Associated token account of the sender.
    #[account(
        mut,
        constraint =
            sender_token.mint == mint.key()
            && sender_token.owner == sender.key(),
    )]
    pub sender_token: Box<Account<'info, TokenAccount>>,
    /// Associated token escrow account holding the funds for this stream.
    #[account(
        mut,
        constraint =
            escrow_token.mint == mint.key()
            && escrow_token.owner == stream.key(),
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    /// SPL token program.
    pub token_program: Program<'info, Token>,
    /// Solana system program.
    pub system_program: Program<'info, System>,
}

/// Accounts struct for cancelling a stream.
#[derive(Accounts)]
#[instruction(seed: u64, name: String, recipient: Pubkey)]
pub struct Cancel<'info> {
    /// Stream PDA account.
    #[account(
        mut,
        seeds = [
            STREAM_ACCOUNT_SEED,
            seed.to_le_bytes().as_ref(),
            mint.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
    )]
    pub stream: Account<'info, Stream>,

    /// Signer wallet. Either the sender or the receiver can cancel the stream till it's solvent. After insolvency,
    /// anyone can cancel.
    pub signer: Signer<'info>,

    /// Stream sender account.
    ///
    /// CHECK: Only 1 check is needed which is in the constraint. That is enough to verify that we are sending the funds
    /// to the stream sender.
    #[account(constraint = sender.key() == stream.sender)]
    pub sender: UncheckedAccount<'info>,
    /// SPL token mint account.
    pub mint: Box<Account<'info, Mint>>,

    /// Associated token account of the signer.
    #[account(
        mut,
        constraint =
            signer_token.mint == mint.key()
            && signer_token.owner == signer.key(),
    )]
    pub signer_token: Box<Account<'info, TokenAccount>>,
    /// Associated token account of the sender.
    #[account(
        mut,
        constraint =
            sender_token.mint == mint.key()
            && sender_token.owner == sender.key(),
    )]
    pub sender_token: Box<Account<'info, TokenAccount>>,
    /// Associated token account of the recipient.
    #[account(
        mut,
        constraint =
            recipient_token.mint == mint.key()
            && recipient_token.owner == recipient,
    )]
    pub recipient_token: Box<Account<'info, TokenAccount>>,
    /// Associated token escrow account holding the funds for this stream.
    #[account(
        mut,
        constraint =
            escrow_token.mint == mint.key()
            && escrow_token.owner == stream.key(),
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    /// SPL token program.
    pub token_program: Program<'info, Token>,
}

/// Accounts struct for withdrawing excess sender topup from a non-prepaid stream.
#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct WithdrawExcessTopupNonPrepaidEnded<'info> {
    /// Stream PDA account.
    #[account(
        mut,
        seeds = [
            STREAM_ACCOUNT_SEED,
            seed.to_le_bytes().as_ref(),
            mint.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
    )]
    pub stream: Account<'info, Stream>,

    /// Signer wallet.
    pub signer: Signer<'info>,

    /// Stream sender account.
    ///
    /// CHECK: Only 1 check is needed which is in the constraint. That is enough to verify that we are sending the funds
    /// to the stream sender.
    #[account(constraint = sender.key() == stream.sender)]
    pub sender: UncheckedAccount<'info>,
    /// SPL token mint account.
    pub mint: Box<Account<'info, Mint>>,

    /// Associated token account of the sender.
    #[account(
        mut,
        constraint =
            sender_token.mint == mint.key()
            && sender_token.owner == sender.key(),
    )]
    pub sender_token: Box<Account<'info, TokenAccount>>,
    /// Associated token escrow account holding the funds for this stream.
    #[account(
        mut,
        constraint =
            escrow_token.mint == mint.key()
            && escrow_token.owner == stream.key(),
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    /// SPL token program.
    pub token_program: Program<'info, Token>,
}

/// Accounts struct for topping up a non-prepaid stream.
#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct TopupNonPrepaid<'info> {
    /// Stream PDA account.
    #[account(
        mut,
        seeds = [
            STREAM_ACCOUNT_SEED,
            seed.to_le_bytes().as_ref(),
            mint.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
    )]
    pub stream: Account<'info, Stream>,

    /// Signer wallet. Anyone can topup a stream. But the refund when the stream gets cancelled will only go to the
    /// stream sender.
    pub signer: Signer<'info>,
    /// SPL token mint account.
    pub mint: Account<'info, Mint>,

    /// Associated token account of the signer.
    #[account(
        mut,
        constraint =
            signer_token.mint == mint.key()
            && signer_token.owner == signer.key(),
    )]
    pub signer_token: Account<'info, TokenAccount>,
    /// Associated token escrow account holding the funds for this stream.
    #[account(
        mut,
        constraint =
            escrow_token.mint == mint.key()
            && escrow_token.owner == stream.key(),
    )]
    pub escrow_token: Account<'info, TokenAccount>,

    /// SPL token program.
    pub token_program: Program<'info, Token>,
}

/// Accounts struct for changing the sender of a non-prepaid stream.
#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct ChangeSenderNonPrepaid<'info> {
    /// Stream PDA account.
    #[account(
        mut,
        seeds = [
            STREAM_ACCOUNT_SEED,
            seed.to_le_bytes().as_ref(),
            mint.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
    )]
    pub stream: Account<'info, Stream>,

    // Stream sender wallet.
    pub sender: Signer<'info>,
    /// SPL token mint account.
    pub mint: Account<'info, Mint>,
}

/// Accounts struct for withdrawing recipient funds from a stream and changing recipient of a stream.
#[derive(Accounts)]
#[instruction(seed: u64, name: String, recipient: Pubkey)]
pub struct WithdrawAndChangeRecipient<'info> {
    /// Stream PDA account.
    #[account(
        mut,
        seeds = [
            STREAM_ACCOUNT_SEED,
            seed.to_le_bytes().as_ref(),
            mint.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
    )]
    pub stream: Account<'info, Stream>,

    /// Signer wallet. Anybody can call the withdraw method. The recipient of the withdrawn amount is not related to the
    /// signer. Recipient is passed as an argument, based on which the stream PDA is accessed, so if a malicious user
    /// tries to send themselves as a recipient, but a different stream account, the constraint for the stream account
    /// will fail.
    pub signer: Signer<'info>,
    /// SPL token mint account.
    pub mint: Box<Account<'info, Mint>>,

    /// Associated token account of the recipient.
    #[account(
        mut,
        constraint =
            recipient_token.mint == mint.key()
            && recipient_token.owner == recipient,
    )]
    pub recipient_token: Box<Account<'info, TokenAccount>>,
    /// Associated token escrow account holding the funds for this stream.
    #[account(
        mut,
        constraint =
            escrow_token.mint == mint.key()
            && escrow_token.owner == stream.key(),
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    /// SPL token program.
    pub token_program: Program<'info, Token>,
}

/// Accounts struct for pausing a non-prepaid stream.
#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct PauseNonPrepaid<'info> {
    /// Stream PDA account.
    #[account(
        mut,
        seeds = [
            STREAM_ACCOUNT_SEED,
            seed.to_le_bytes().as_ref(),
            mint.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
    )]
    pub stream: Account<'info, Stream>,

    /// Signer wallet. Signer needs to be either the sender (if they are allowed to) or the recipient.
    pub signer: Signer<'info>,
    /// SPL token mint account.
    pub mint: Account<'info, Mint>,
}

/// Accounts struct for resuming a non-prepaid stream.
#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct ResumeNonPrepaid<'info> {
    /// Stream PDA account.
    #[account(
        mut,
        seeds = [
            STREAM_ACCOUNT_SEED,
            seed.to_le_bytes().as_ref(),
            mint.key().as_ref(),
            name.as_bytes(),
        ],
        bump,
    )]
    pub stream: Account<'info, Stream>,

    /// Signer wallet. Signer needs to be either the sender (if they are allowed to) or the recipient (exception is if
    /// the stream was paused by the sender and recipient is not allowed to resume a stream paused by sender).
    pub signer: Signer<'info>,
    /// SPL token mint account.
    pub mint: Account<'info, Mint>,
}

impl<'info> Create<'info> {
    /// Transfer funds from the associated token account of the sender to associated token escrow account holding the
    /// funds for this stream.
    pub fn transfer_to_escrow(&self, amount: u64) -> Result<()> {
        transfer_to_escrow(
            &self.sender,
            &self.sender_token,
            &self.escrow_token,
            &self.token_program,
            amount,
        )
    }
}

impl<'info> Cancel<'info> {
    /// Transfer funds from the associated token escrow account holding the funds for this stream to the associated
    /// token account of the sender.
    pub fn transfer_from_escrow_to_sender(&self, seed: u64, name: &str, bump: u8, amount: u64) -> Result<()> {
        self.transfer_from_escrow(&self.sender_token, seed, name, bump, amount)
    }

    /// Transfer funds from the associated token escrow account holding the funds for this stream to the associated
    /// token account of the signer.
    pub fn transfer_from_escrow_to_signer(&self, seed: u64, name: &str, bump: u8, amount: u64) -> Result<()> {
        self.transfer_from_escrow(&self.signer_token, seed, name, bump, amount)
    }

    /// Transfer funds from the associated token escrow account holding the funds for this stream to the associated
    /// token account of the recipient.
    pub fn transfer_from_escrow_to_recipient(&self, seed: u64, name: &str, bump: u8, amount: u64) -> Result<()> {
        self.transfer_from_escrow(&self.recipient_token, seed, name, bump, amount)
    }

    fn transfer_from_escrow(
        &self,
        destination_token: &Account<'info, TokenAccount>,
        seed: u64,
        name: &str,
        bump: u8,
        amount: u64,
    ) -> Result<()> {
        transfer_from_escrow(
            &self.stream,
            destination_token,
            &self.escrow_token,
            &self.token_program,
            seed,
            &self.mint.key(),
            name,
            bump,
            amount,
        )
    }
}

impl<'info> WithdrawExcessTopupNonPrepaidEnded<'info> {
    /// Transfer funds from the associated token escrow account holding the funds for this stream to the associated
    /// token account of the sender.
    fn transfer_from_escrow(&self, seed: u64, name: &str, bump: u8, amount: u64) -> Result<()> {
        transfer_from_escrow(
            &self.stream,
            &self.sender_token,
            &self.escrow_token,
            &self.token_program,
            seed,
            &self.mint.key(),
            name,
            bump,
            amount,
        )
    }
}

impl<'info> TopupNonPrepaid<'info> {
    /// Transfer funds from the associated token account of the sender to associated token escrow account holding the
    /// funds for this stream.
    pub fn transfer_to_escrow(&self, amount: u64) -> Result<()> {
        transfer_to_escrow(
            &self.signer,
            &self.signer_token,
            &self.escrow_token,
            &self.token_program,
            amount,
        )
    }
}

impl<'info> WithdrawAndChangeRecipient<'info> {
    /// Transfer funds from the associated token escrow account holding the funds for this stream to the associated
    /// token account of the recipient.
    pub fn transfer_from_escrow(&self, seed: u64, name: &str, bump: u8, amount: u64) -> Result<()> {
        transfer_from_escrow(
            &self.stream,
            &self.recipient_token,
            &self.escrow_token,
            &self.token_program,
            seed,
            &self.mint.key(),
            name,
            bump,
            amount,
        )
    }
}
