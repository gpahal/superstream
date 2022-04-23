# Superstream

> Superstream is a Solana-based streaming primitive. Use it to send recurring payments at any interval upto a second.

## What does it look like?

Have a look - [Screen recording](https://www.loom.com/share/c5dc399a40aa4672bba7c45490ea7e18)

## Use cases

- Payroll
- RSU/ESOP/Token vesting
- Subscriptions
- SIPs
- EMIs
- Sponsorships like Patreon, GitHub Sponsors, etc

## Features

- **Support for cliffs:** Vesting of RSUs/ESOPs/Tokens involving cliffs is supported.
- **Prepaid and unbounded streams:** Some streams like ESOPs would need to be prepaid because employees would need
  assurance that some set of tokens are locked up in an escrow that will be given to them on the vesting schedule. Other
  streams like payroll, subscriptions will be unbounded - senders can top up the escrow to keep them running. Both these
  use cases are supported.
- **Cancellable streams**: Streams are cancellable. Various different options are available to configure who is allowed
  to cancel and when.
- **Pausable streams**: Some jobs require employees to check in and check out. Streams can be paused and resumed to
  track that. Options are available to configure who can pause and when.
- **Solvency detection:** Unbounded streams may become insolvent if not topped up timely. There needs to be a way to
  identify them as quickly as possible and penalize the sender of that stream somehow. Superstream takes some extra
  deposit from the stream sender and if the stream becomes insolvent, anyone can detect and report that. They will be
  rewarded with the deposit amount. The sender will lose the same amount. Currently, that is set at 8 hrs worth of the
  stream.

## Running

### Prerequisites

- [Node](https://nodejs.dev/)
- [Pnpm](https://pnpm.io/)
- [Anchor](https://book.anchor-lang.com/getting_started/installation.html)

### Deploying and running the program

- Build Solana program

```shell
pnpm build
```

- Run Solana test validator

```shell
solana-test-validator
```

- Deploy Solana program to the test validator

```shell
anchor deploy --provider.cluster localnet
```

### Running the web interface

- Get access to the web-app repository and clone it on your local machine

```shell
cd web-app/
pnpm dev
```

- Visit [localhost:3000/app](http://localhost:3000/app)
