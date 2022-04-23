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

declare_id!("GTfyzwZX2vRFcqbTWqiv2k7vNgd6yWq269USRWYbHSB8");

pub const STREAM_ACCOUNT_SEED: &[u8] = b"stream";

#[program]
pub mod streaming {
    use super::*;

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
            seed,
        )?;

        let stream = &mut ctx.accounts.stream;
        let prepaid_amount_needed = stream.initialize_prepaid()?;
        ctx.accounts.transfer_to_escrow(prepaid_amount_needed)
    }

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
            seed,
        )?;

        let stream = &mut ctx.accounts.stream;
        stream.initialize_non_prepaid(topup_amount)?;
        ctx.accounts.transfer_to_escrow(topup_amount)
    }

    pub fn cancel(ctx: Context<Cancel>, seed: u64, name: String, recipient: Pubkey) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        let stream_key = stream.to_account_info().key;
        let res = stream.cancel(*stream_key, &ctx.accounts.signer, recipient)?;
        if let Some(params) = res {
            let bump = stream.bump;
            if params.transfer_to_sender {
                ctx.accounts.transfer_from_escrow_to_sender(
                    seed,
                    &name,
                    bump,
                    params.transfer_amount,
                )?;
            } else {
                ctx.accounts.transfer_from_escrow_to_signer(
                    seed,
                    &name,
                    bump,
                    params.transfer_amount,
                )?;
            }
        }

        Ok(())
    }

    pub fn withdraw_excess_topup_non_prepaid_ended(
        ctx: Context<WithdrawExcessTopupNonPrepaidEnded>,
        seed: u64,
        name: String,
    ) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        let amount = stream.withdraw_excess_topup_non_prepaid_ended()?;
        if amount > 0 {
            let bump = stream.bump;
            ctx.accounts
                .transfer_from_escrow(seed, &name, bump, amount)?;
        }
        Ok(())
    }

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

    pub fn change_sender_non_prepaid(
        ctx: Context<ChangeSenderNonPrepaid>,
        _seed: u64,
        _name: String,
        new_sender: Pubkey,
    ) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        stream.change_sender_non_prepaid(&ctx.accounts.sender, new_sender)
    }

    pub fn withdraw(
        ctx: Context<WithdrawOrChangeRecipient>,
        seed: u64,
        name: String,
        recipient: Pubkey,
    ) -> Result<()> {
        withdraw_and_change_recipient(ctx, seed, name, recipient, Pubkey::default())
    }

    pub fn withdraw_and_change_recipient(
        ctx: Context<WithdrawOrChangeRecipient>,
        seed: u64,
        name: String,
        recipient: Pubkey,
        new_recipient: Pubkey,
    ) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        let amount_available_to_withdraw =
            stream.withdraw_and_change_recipient(recipient, new_recipient)?;
        let bump = stream.bump;
        ctx.accounts
            .transfer_from_escrow(seed, &name, bump, amount_available_to_withdraw)
    }

    pub fn pause_non_prepaid(
        ctx: Context<PauseNonPrepaid>,
        _seed: u64,
        _name: String,
    ) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        stream.pause_non_prepaid(&ctx.accounts.signer)
    }

    pub fn resume_non_prepaid(
        ctx: Context<ResumeNonPrepaid>,
        _seed: u64,
        _name: String,
    ) -> Result<()> {
        let stream = &mut ctx.accounts.stream;
        stream.resume_non_prepaid(&ctx.accounts.signer)
    }
}

pub fn create(
    ctx: &mut Context<Create>,
    prepaid: bool,
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
    seed: u64,
) -> Result<()> {
    let escrow_token_account = &ctx.accounts.escrow_token;
    require!(
        is_token_account_rent_exempt(escrow_token_account)?,
        StreamError::EscrowNotRentExempt,
    );

    let stream = &mut ctx.accounts.stream;
    stream.initialize(
        prepaid,
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
        seed,
        *ctx.bumps.get("stream").unwrap(),
    )
}

#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct Create<'info> {
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

    #[account(mut)]
    pub sender: Signer<'info>,
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint =
            sender_token.mint == mint.key()
            && sender_token.owner == sender.key(),
    )]
    pub sender_token: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint =
            escrow_token.mint == mint.key()
            && escrow_token.owner == stream.key(),
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct Cancel<'info> {
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

    /// Either the sender or the receiver can cancel the stream till it's solvent. After insolvency,
    /// anyone can cancel.
    pub signer: Signer<'info>,

    /// CHECK: Only 1 check need which is in the constraint. That is enough to verify that we are
    /// sending the funds to the stream sender.
    #[account(constraint = sender.key() == stream.sender)]
    pub sender: UncheckedAccount<'info>,
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint =
            signer_token.mint == mint.key()
            && signer_token.owner == signer.key(),
    )]
    pub signer_token: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint =
            sender_token.mint == mint.key()
            && sender_token.owner == sender.key(),
    )]
    pub sender_token: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint =
            escrow_token.mint == mint.key()
            && escrow_token.owner == stream.key(),
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct WithdrawExcessTopupNonPrepaidEnded<'info> {
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

    /// Either the sender or the receiver can cancel the stream till it's solvent. After insolvency,
    /// anyone can cancel.
    pub signer: Signer<'info>,

    /// CHECK: Only 1 check need which is in the constraint. That is enough to verify that we are
    /// sending the funds to the stream sender.
    #[account(constraint = sender.key() == stream.sender)]
    pub sender: UncheckedAccount<'info>,
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint =
            sender_token.mint == mint.key()
            && sender_token.owner == sender.key(),
    )]
    pub sender_token: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint =
            escrow_token.mint == mint.key()
            && escrow_token.owner == stream.key(),
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct TopupNonPrepaid<'info> {
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

    /// Anyone can topup a stream. But the refund when the stream gets cancelled will only go to the
    /// stream sender.
    pub signer: Signer<'info>,
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint =
            signer_token.mint == mint.key()
            && signer_token.owner == signer.key(),
    )]
    pub signer_token: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint =
            escrow_token.mint == mint.key()
            && escrow_token.owner == stream.key(),
    )]
    pub escrow_token: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct ChangeSenderNonPrepaid<'info> {
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

    pub sender: Signer<'info>,
    pub mint: Account<'info, Mint>,
}

#[derive(Accounts)]
#[instruction(seed: u64, name: String, recipient: Pubkey)]
pub struct WithdrawOrChangeRecipient<'info> {
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

    /// Anybody can call the withdraw method. The recipient of the withdrawn amount is not related
    /// to the signer. Recipient is passed as an argument, based on which the stream PDA is
    /// accessed, so if a malicious user tries to send themselves as a recipient, but a different
    /// stream account, the constraint for the stream account will fail.
    pub signer: Signer<'info>,
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint =
            recipient_token.mint == mint.key()
            && recipient_token.owner == recipient,
    )]
    pub recipient_token: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint =
            escrow_token.mint == mint.key()
            && escrow_token.owner == stream.key(),
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct PauseNonPrepaid<'info> {
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

    /// Signer needs to be either the sender (if they are allowed to) or the recipient.
    pub signer: Signer<'info>,
    pub mint: Account<'info, Mint>,
}

#[derive(Accounts)]
#[instruction(seed: u64, name: String)]
pub struct ResumeNonPrepaid<'info> {
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

    /// Signer needs to be either the sender (if they are allowed to) or the recipient (exception is
    /// if the stream was paused by the sender and recipient is not allowed to resume a stream
    /// paused by sender).
    pub signer: Signer<'info>,
    pub mint: Account<'info, Mint>,
}

impl<'info> Create<'info> {
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
    pub fn transfer_from_escrow_to_sender(
        &self,
        seed: u64,
        name: &str,
        bump: u8,
        amount: u64,
    ) -> Result<()> {
        self.transfer_from_escrow(&self.sender_token, seed, name, bump, amount)
    }

    pub fn transfer_from_escrow_to_signer(
        &self,
        seed: u64,
        name: &str,
        bump: u8,
        amount: u64,
    ) -> Result<()> {
        self.transfer_from_escrow(&self.signer_token, seed, name, bump, amount)
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

impl<'info> WithdrawOrChangeRecipient<'info> {
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
