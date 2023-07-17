# Superstream typescript client SDK

[![License](https://img.shields.io/npm/l/@superstream/client)](https://www.npmjs.com/package/@superstream/client)
[![npm](https://img.shields.io/npm/v/@superstream/client.svg)](https://www.npmjs.com/package/@superstream/client)

## What is Superstream?

Superstream is a protocol and a collection of SDKs for real-time money streaming on Solana. It allows anyone to
continuously send money to anyone else at any interval upto a second.

Superstream protocol is completely open-source. View it on [GitHub](https://github.com/gpahal/superstream).

Learn more about Superstream on [superstream.finance](https://superstream.finance/).

## What is Superstream typescript client SDK?

A typescript SDK to interact with on-chain Superstream program. Developers would use this typically when they want to
create a typescript app and integrate streams into that. It's compatible with browsers and native environments (like
React Native).

## Installation

```sh
# npm
npm install @superstream/client

# pnpm
pnpm install @superstream/client

# yarn
yarn add @superstream/client
```

## Usage

- Create a `SuperstreamClient`. For complete API documentation, click
  [here](https://superstream.finance/references/client-sdks/ts/functions/createSuperstreamClient.html)

```typescript
import { createSuperstreamClient } from '@superstream/client'

const client = createSuperstreamClient('devnet', wallet)

// For mainnet-beta, use:
// const client = createSuperstreamClient("mainnet-beta", wallet)

// If you don't need to execute instructions (like creating or cancelling a stream), you can omit the wallet
// const client = createSuperstreamClient("devnet")
```

- Fetch streams and do other operations using the client. For complete API documentation, click
  [here](https://superstream.finance/references/client-sdks/ts/interfaces/SuperstreamClient.html)

```typescript
const streams = await client.getAllStreams({ isPrepaid: true, recipient: new PublicKey('public-key-base-58') })
```

- Do operations on streams. For complete API documentation, click
  [here](https://superstream.finance/references/client-sdks/ts/classes/Stream.html)

```typescript
const stream = streams[0]

// Get stream public key
stream.getStreamPublicKey()
// Check is current wallet is this stream's sender
stream.isSender()
// ... and other operations

// Get current on-chain time to do even more operations on streams
const currentTime = await client.mustGetCurrentTime()

// Check if stream has stopped
stream.hasStopped()
// Check if stream is solvent
stream.isSolvent()
// Cancel stream
await stream.cancel()
// ... and other operations
```
