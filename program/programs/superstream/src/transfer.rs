use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};

use crate::{error::StreamError, Stream, STREAM_ACCOUNT_SEED};

pub(crate) fn transfer_to_escrow<'info>(
    sender: &Signer<'info>,
    sender_token: &Account<'info, TokenAccount>,
    escrow_token: &Account<'info, TokenAccount>,
    token_program: &Program<'info, Token>,
    amount: u64,
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }

    require!(sender_token.amount >= amount, StreamError::SenderInsufficientFunds,);

    let cpi_program = token_program.to_account_info();
    let cpi_accounts = Transfer {
        from: sender_token.to_account_info(),
        to: escrow_token.to_account_info(),
        authority: sender.to_account_info(),
    };
    transfer(CpiContext::new(cpi_program, cpi_accounts), amount)
}

pub(crate) fn transfer_from_escrow<'info>(
    stream: &Account<'info, Stream>,
    destination_token: &Account<'info, TokenAccount>,
    escrow_token: &Account<'info, TokenAccount>,
    token_program: &Program<'info, Token>,
    seed: u64,
    mint: &Pubkey,
    name: &str,
    bump: u8,
    amount: u64,
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }

    require!(escrow_token.amount >= amount, StreamError::EscrowInsufficientFunds,);
    let cpi_program = token_program.to_account_info();
    let cpi_accounts = Transfer {
        from: escrow_token.to_account_info(),
        to: destination_token.to_account_info(),
        authority: stream.to_account_info(),
    };

    transfer(
        CpiContext::new_with_signer(
            cpi_program,
            cpi_accounts,
            &[&[
                STREAM_ACCOUNT_SEED,
                seed.to_le_bytes().as_ref(),
                mint.as_ref(),
                name.as_bytes(),
                &[bump],
            ]],
        ),
        amount,
    )
}
