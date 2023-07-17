# Superstream

[![License](https://img.shields.io/github/license/gpahal/superstream)](https://opensource.org/licenses/MIT)

Superstream is a protocol and a collection of SDKs for real-time money streaming on Solana. It allows anyone to
continuously send money to anyone else at any interval upto a second.

Superstream protocol is completely open-source.

Learn more about Superstream on [superstream.finance](https://superstream.finance/).

## Use cases

- Payroll
- RSU/ESOP/Token distribution/Vesting
- Subscriptions
- SIPs
- EMIs
- Sponsorships like Patreon, GitHub Sponsors, etc

## Features

- **Prepaid and unbounded streams:** Some streams like ESOPs would need to be prepaid because employees would need
  assurance that some set of tokens are locked up in an escrow that will be given to them on the vesting schedule. Other
  streams like payroll, subscriptions will be unbounded - senders can top up the escrow to keep them running. Both these
  use cases are supported. Read more about these [here](https://superstream.finance/docs/resources/types-of-streams).

- **Support for cliffs:** Vesting of RSUs/ESOPs/Tokens involving cliffs is supported.

- **Cancellable streams**: Streams are cancellable. Various different options are available to configure who is allowed
  to cancel and when.

- **Pausable streams**: Streams can be paused and resumed. This is useful for payroll software which require employees
  to check in and check out. Options are available to configure who can pause and when.

- **Unbounded streams solvency detection:** Unbounded streams may become insolvent if not topped up timely. There needs
  to be a way to identify them as quickly as possible and penalize the sender of that stream somehow. Read more about
  insolvency [here](https://superstream.finance/docs/resources/insolvency).

## Protocol

### [**Superstream program**](https://superstream.finance/docs/protocol/program)

A Solana on-chain program that maintains the state of all the streams on-chain. Other Solana on-chain programs can
interact with it directly using Cross-Program Invocation (CPI for short).

### [**Superstream Inspector**](https://superstream.finance/docs/protocol/inspector)

An off-chain software that monitors the on-chain program and cancels streams when they become
[insolvent](https://superstream.finance/docs/resources/insolvency). Anyone can run this software and earn rewards for
finding insolvent streams and penalizing bad actors in the ecosystem.

## Client SDKs

### [**Typescript client SDK**](https://superstream.finance/docs/client-sdks/ts)

A typescript SDK to interact with on-chain Superstream program. Developers would use this typically when they want to
create a typescript app and integrate streams into that. It's compatible with browsers and native environments (like
React Native).

## Dashboard

[Dashboard](https://superstream.finance/dashboard/streams) is a web interface maintained by Superstream where you can
create and manage all of your payment streams. Just connect your wallet and start sending and receiving money real-time.
Dashboard is built using the [typescript client SDK](https://superstream.finance/docs/client-sdks/ts).

You can [create a stream](https://superstream.finance/dashboard/create-stream) on the dashboard to understand the
various parameters needed when creating a stream.

## License

Licensed under MIT license ([LICENSE](LICENSE) or [opensource.org/licenses/MIT](https://opensource.org/licenses/MIT))
