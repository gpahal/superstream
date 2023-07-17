use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod superstream_cpi_example {
    use super::*;

    /// Create a new prepaid stream.
    pub fn create_prepaid(
        ctx: Context<Create>,
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
        let cpi_program = ctx.accounts.superstream_program.to_account_info();
        let cpi_accounts = superstream::cpi::accounts::Create {
            stream: ctx.accounts.stream.to_account_info(),
            sender: ctx.accounts.sender.to_account_info(),
            mint: ctx.accounts.sender.to_account_info(),
            sender_token: ctx.accounts.sender_token.to_account_info(),
            escrow_token: ctx.accounts.escrow_token.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        superstream::cpi::create_prepaid(
            cpi_ctx,
            seed,
            name,
            recipient,
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
        )
    }

    /// Create a new non-prepaid stream.
    pub fn create_non_prepaid(
        ctx: Context<Create>,
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
        let cpi_program = ctx.accounts.superstream_program.to_account_info();
        let cpi_accounts = superstream::cpi::accounts::Create {
            stream: ctx.accounts.stream.to_account_info(),
            sender: ctx.accounts.sender.to_account_info(),
            mint: ctx.accounts.sender.to_account_info(),
            sender_token: ctx.accounts.sender_token.to_account_info(),
            escrow_token: ctx.accounts.escrow_token.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        superstream::cpi::create_non_prepaid(
            cpi_ctx,
            seed,
            name,
            recipient,
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
            topup_amount,
        )
    }

    /// Cancel a stream.
    pub fn cancel(ctx: Context<Cancel>, seed: u64, name: String, recipient: Pubkey) -> Result<()> {
        let cpi_program = ctx.accounts.superstream_program.to_account_info();
        let cpi_accounts = superstream::cpi::accounts::Cancel {
            stream: ctx.accounts.stream.to_account_info(),
            signer: ctx.accounts.signer.to_account_info(),
            sender: ctx.accounts.sender.to_account_info(),
            mint: ctx.accounts.sender.to_account_info(),
            signer_token: ctx.accounts.signer_token.to_account_info(),
            sender_token: ctx.accounts.sender_token.to_account_info(),
            recipient_token: ctx.accounts.recipient_token.to_account_info(),
            escrow_token: ctx.accounts.escrow_token.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        superstream::cpi::cancel(cpi_ctx, seed, name, recipient)
    }
}

/// Accounts struct for creating a new stream.
#[derive(Accounts)]
pub struct Create<'info> {
    /// Stream PDA account. This is initialized by the program.
    #[account(mut)]
    pub stream: Box<Account<'info, superstream::state::Stream>>,

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

    /// Superstream program.
    pub superstream_program: Program<'info, superstream::program::Superstream>,
}

/// Accounts struct for cancelling a stream.
#[derive(Accounts)]
#[instruction(seed: u64, name: String, recipient: Pubkey)]
pub struct Cancel<'info> {
    /// Stream PDA account.
    #[account(mut)]
    pub stream: Box<Account<'info, superstream::state::Stream>>,

    /// Signer wallet. Either the sender or the receiver can cancel the stream till it's solvent.
    /// After insolvency, anyone can cancel.
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

    /// Superstream program.
    pub superstream_program: Program<'info, superstream::program::Superstream>,
}
