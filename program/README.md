# Superstream program

[![License](https://img.shields.io/crates/l/superstream.svg)](https://crates.io/crates/superstream)
[![Crates.io](https://img.shields.io/crates/v/superstream.svg)](https://crates.io/crates/superstream)
[![Docs.rs](https://docs.rs/superstream/badge.svg)](https://docs.rs/superstream/latest/superstream/)

## What is Superstream?

Superstream is a protocol and a collection of SDKs for real-time money streaming on Solana. It allows anyone to
continuously send money to anyone else at any interval upto a second.

Superstream protocol is completely open-source. View it on [GitHub](https://github.com/gpahal/superstream).

Learn more about Superstream on [superstream.finance](https://superstream.finance/).

## What is Superstream program?

A Solana on-chain program that maintains the state of all the streams on-chain. Other Solana on-chain programs can
interact with it directly using Cross-Program Invocation (CPI for short). Read more about it
[here](https://superstream.finance/docs/protocol/program.md).

## Usage in CPI (Cross-Program Invocation)

> For complete API documentation, see
> [Superstream program's API documentation](https://superstream.finance/references/protocol/program)
>
> For a complete example, see
> [superstream-cpi-example](https://github.com/gpahal/superstream/tree/main/program/programs/superstream-cpi-example)

- Add the dependency in your program's Cargo.toml

```toml
superstream = { version = "0.3.1", features = ["cpi"] }
```

- Invoke Superstream's instruction. In the example below, we are calling Superstream's cancel instruction.

```rs
#[program]
pub mod superstream_cpi_example {
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

    // ... other stuff
}

/// Accounts struct for cancelling a stream.
#[derive(Accounts)]
pub struct Cancel<'info> {
    /// Stream PDA account.
    #[account(mut)]
    pub stream: AccountInfo<'info>,

    /// Signer wallet.
    pub signer: Signer<'info>,

    /// Stream sender account.
    pub sender: AccountInfo<'info>,
    /// SPL token mint account.
    pub mint: Box<Account<'info, Mint>>,

    /// Associated token account of the signer.
    #[account(mut)]
    pub signer_token: Box<Account<'info, TokenAccount>>,
    /// Associated token account of the sender.
    #[account(mut)]
    pub sender_token: Box<Account<'info, TokenAccount>>,
    /// Associated token account of the recipient.
    #[account(mut)]
    pub recipient_token: Box<Account<'info, TokenAccount>>,
    /// Associated token escrow account holding the funds for this stream.
    #[account(mut)]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    /// SPL token program.
    pub token_program: Program<'info, Token>,

    /// Superstream program.
    pub superstream_program: Program<'info, superstream::program::Superstream>,
}

// ... other stuff
```

## Deploying and running the program locally

- Install [Anchor](https://book.anchor-lang.com/getting_started/installation.html)

- Build Solana program

```sh
pnpm build
```

- Run Solana test validator

```sh
solana-test-validator
```

- Deploy Solana program to the test validator

```sh
anchor deploy --provider.cluster localnet
```
