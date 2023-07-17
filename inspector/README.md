# Superstream inspector

[![License](https://img.shields.io/npm/l/@superstream/inspector)](https://www.npmjs.com/package/@superstream/inspector)
[![npm](https://img.shields.io/npm/v/@superstream/inspector.svg)](https://www.npmjs.com/package/@superstream/inspector)

## What is Superstream?

Superstream is a protocol and a collection of SDKs for real-time money streaming on Solana. It allows anyone to
continuously send money to anyone else at any interval upto a second.

Superstream protocol is completely open-source. View it on [GitHub](https://github.com/gpahal/superstream).

Learn more about Superstream on [superstream.finance](https://superstream.finance/).

## What is Superstream inspector?

An off-chain software that monitors the on-chain program and cancels streams when they become
[insolvent](https://superstream.finance/docs/resources/insolvency). Anyone can run this software and earn rewards for
finding insolvent streams and penalizing bad actors in the ecosystem.

### Rewards

Senders of [unbounded streams](https://superstream.finance/docs/resources/types-of-streams#unbounded-streams) pay a
deposit amount upfront. If a stream becomes insolvent, this amount is not given back to the stream senders as punishment
and distributed as a reward to whoever found the insolvent stream.

The exact deposit amount is defined in the smart contract. It is currently equal to 8 hrs of the stream value. For
example, if someone creates a stream of $10 per hour, the deposit amount would be $80.

The exact value is defined
[here](https://docs.rs/superstream/latest/superstream/state/constant.DEPOSIT_AMOUNT_PERIOD_IN_SECS.html).

## Installation

```sh
# npm
npm install -g @superstream/inspector

# pnpm
pnpm install -g @superstream/inspector

# yarn
yarn global add @superstream/inspector
```

To check if installation succeeded, run

```sh
inspector -h
```

## Usage

```sh
# Commands supported are listed below
inspector COMMAND [...ARGUMENTS] [FLAGS]

# To get help, run
inspector -h

# To get help for a specific command, run
inspector COMMAND -h
```

## Commands

- [`inspector run`](https://github.com/gpahal/superstream/blob/main/inspector/docs/run.md) - Run inspector process.
- [`inspector stats`](https://github.com/gpahal/superstream/blob/main/inspector/docs/stats.md) - Get stream stats.
