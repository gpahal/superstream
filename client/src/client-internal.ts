import { AnchorProvider, BN, Program, web3, type IdlAccounts, type ProgramAccount } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

import { getErrorMessage } from '@gpahal/std/error'

import type { SuperstreamClient } from '@/client'
import {
  DEPOSIT_AMOUNT_PERIOD_IN_SECS_BN,
  MAX_STREAM_NAME_LENGTH,
  MIN_STREAM_NAME_LENGTH,
  STREAM_ACCOUNT_SEED,
  SUPERSTREAM_PROGRAM_ID,
} from '@/constants'
import { streamFiltersToAnchorFilters, type StreamFilters } from '@/filters'
import idl from '@/gen/idl.json'
import type { Superstream } from '@/gen/types'
import { StreamPagination } from '@/pagination'
import { Stream } from '@/stream'
import { BN_ONE, BN_TEN, BN_TWO, BN_ZERO } from '@/utils/bn'
import { getOrCreateAssociatedTokenAccount, mustGetAssociatedTokenAccount } from '@/utils/spl'
import { getCurrentTimeInSecsBN, getCurrentTimeInSecsBNOrUndefined } from '@/utils/time'
import { NO_OP_WALLET, type Wallet } from '@/utils/wallet'

export type StreamAccount = IdlAccounts<Superstream>['stream']

function hasKey<K extends string>(o: unknown, k: K): o is Record<K, unknown> {
  return typeof o === 'object' && o != null && k in o
}

function isStreamAccount(account: unknown): account is StreamAccount {
  return hasKey(account, 'isPrepaid') && typeof account.isPrepaid === 'boolean'
}

const opts: web3.ConfirmOptions = {
  preflightCommitment: 'recent',
  commitment: 'confirmed',
}

export class SuperstreamClientInternal implements SuperstreamClient {
  private readonly isNoOpWallet: boolean
  readonly provider: AnchorProvider
  readonly program: Program<Superstream>

  constructor(cluster: web3.Cluster | URL, wallet?: Wallet | null) {
    this.isNoOpWallet = wallet == null

    const endpoint = cluster instanceof URL ? cluster.toString() : web3.clusterApiUrl(cluster)
    const connection = new web3.Connection(endpoint, 'confirmed')
    this.provider = new AnchorProvider(connection, wallet || NO_OP_WALLET, opts)
    this.program = new Program<Superstream>(idl as Superstream, SUPERSTREAM_PROGRAM_ID, this.provider)
  }

  private readonly checkForValidWallet = (): void => {
    if (this.isNoOpWallet) {
      throw new Error('This operation requires a client with a valid wallet')
    }
  }

  readonly getProvider = (): AnchorProvider => this.provider

  readonly getConnection = (): web3.Connection => this.provider.connection

  readonly getWalletPublicKey = (): web3.PublicKey => this.provider.wallet.publicKey

  readonly getCurrentTime = async (): Promise<BN | undefined> => {
    return getCurrentTimeInSecsBNOrUndefined(this.getConnection())
  }

  readonly mustGetCurrentTime = async (): Promise<BN> => {
    try {
      return getCurrentTimeInSecsBN(this.getConnection())
    } catch (e: unknown) {
      throw new Error(`Error getting current time from Solana node: ${getErrorMessage(e)}`)
    }
  }

  private readonly createSeed = (): BN => {
    return new BN(Date.now())
  }

  readonly getStreamPublicKey = (seed: BN, mint: web3.PublicKey, name: string): [web3.PublicKey, number] => {
    return web3.PublicKey.findProgramAddressSync(
      [Buffer.from(STREAM_ACCOUNT_SEED), seed.toArrayLike(Buffer, 'le', 8), mint.toBuffer(), Buffer.from(name)],
      this.program.programId,
    )
  }

  readonly maybeGetStream = async (publicKey: web3.PublicKey): Promise<Stream | undefined> => {
    const streamAccount: StreamAccount | undefined =
      (await this.program.account.stream.fetchNullable(publicKey)) || undefined
    return streamAccount ? Stream.fromStreamAccount(this, publicKey, streamAccount) : undefined
  }

  readonly getStream = async (publicKey: web3.PublicKey): Promise<Stream> => {
    const streamAccount: StreamAccount = await this.program.account.stream.fetch(publicKey)
    return Stream.fromStreamAccount(this, publicKey, streamAccount)
  }

  readonly getMultipleStreams = async (publicKeys: web3.PublicKey[]): Promise<(Stream | undefined)[]> => {
    const streamAccounts: unknown[] = await this.program.account.stream.fetchMultiple(publicKeys)
    if (!streamAccounts || streamAccounts.length === 0) {
      return []
    }
    return streamAccounts.map((streamAccount, i) =>
      streamAccount && isStreamAccount(streamAccount)
        ? Stream.fromStreamAccount(this, publicKeys[i]!, streamAccount)
        : undefined,
    )
  }

  readonly getAllStreams = async (filters?: StreamFilters): Promise<Stream[]> => {
    const streamAccounts: ProgramAccount<StreamAccount>[] = await this.program.account.stream.all(
      streamFiltersToAnchorFilters(filters),
    )
    if (!streamAccounts || streamAccounts.length === 0) {
      return []
    }
    return streamAccounts.map((streamAccount) =>
      Stream.fromStreamAccount(this, streamAccount.publicKey, streamAccount.account),
    )
  }

  readonly getAllStreamsPublicKeys = async (filters?: StreamFilters): Promise<web3.PublicKey[]> => {
    const streamAccounts: readonly { pubkey: web3.PublicKey }[] = await this.provider.connection.getProgramAccounts(
      this.program.programId,
      {
        commitment: this.provider.connection.commitment,
        filters: [
          {
            memcmp: this.program.account.stream.coder.accounts.memcmp('stream') as web3.MemcmpFilter['memcmp'],
          },
          ...streamFiltersToAnchorFilters(filters),
        ],
        dataSlice: { offset: 0, length: 0 },
      },
    )
    if (!streamAccounts || streamAccounts.length === 0) {
      return []
    }
    return streamAccounts.map((streamAccount) => streamAccount.pubkey)
  }

  readonly getAllStreamsPagination = (filters?: StreamFilters): StreamPagination => {
    return new StreamPagination(this, filters)
  }

  readonly getPrepaidAmountNeeded = (
    at: BN,
    {
      startsAt,
      endsAt,
      initialAmount,
      flowInterval,
      flowRate,
    }: {
      startsAt: BN
      endsAt: BN
      initialAmount: BN
      flowInterval: BN
      flowRate: BN
    },
  ): BN => {
    if (endsAt.lte(BN_ZERO)) {
      return BN_ZERO
    }

    startsAt = at.gt(startsAt) ? at : startsAt
    if (flowRate.lte(BN_ZERO) || endsAt.lte(startsAt) || flowInterval.lte(BN_ZERO)) {
      return initialAmount
    } else {
      return initialAmount.add(endsAt.sub(startsAt).mul(flowRate).div(flowInterval))
    }
  }

  readonly getNonPrepaidDepositNeeded = (
    at: BN,
    {
      startsAt,
      endsAt,
      flowInterval,
      flowRate,
    }: {
      startsAt: BN
      endsAt: BN
      flowInterval: BN
      flowRate: BN
    },
  ): BN => {
    startsAt = at.gt(startsAt) ? at : startsAt
    if (flowRate.lte(BN_ZERO) || (endsAt.gt(BN_ZERO) && endsAt.lte(startsAt)) || flowInterval.lte(BN_ZERO)) {
      return BN_ZERO
    } else {
      const diff = endsAt.sub(startsAt)
      const depositNeeded = flowRate
        .mul(
          endsAt.lte(BN_ZERO) || DEPOSIT_AMOUNT_PERIOD_IN_SECS_BN.lte(diff) ? DEPOSIT_AMOUNT_PERIOD_IN_SECS_BN : diff,
        )
        .div(flowInterval)
      return depositNeeded.gte(BN_TEN) ? depositNeeded : depositNeeded.add(BN_ONE)
    }
  }

  private readonly validateCreateStream = (
    at: BN,
    {
      isPrepaid,
      recipient,
      name,
      startsAt,
      endsAt,
      initialAmount,
      flowRate,
    }: {
      isPrepaid: boolean
      recipient: web3.PublicKey
      name: string
      startsAt: BN
      endsAt: BN
      initialAmount: BN
      flowRate: BN
    },
  ) => {
    startsAt = at.gt(startsAt) ? at : startsAt
    if (recipient.equals(web3.PublicKey.default)) {
      throw new Error('Invalid recipient. Recipient has to be a valid address')
    } else if (name.length < MIN_STREAM_NAME_LENGTH) {
      throw new Error(`Min stream name length should be ${MIN_STREAM_NAME_LENGTH}`)
    } else if (name.length > MAX_STREAM_NAME_LENGTH) {
      throw new Error(`Max stream name length can be ${MAX_STREAM_NAME_LENGTH}`)
    } else if (recipient.equals(this.provider.wallet.publicKey)) {
      throw new Error('Sender and recipient of the stream cannot be the same')
    } else if (isPrepaid && endsAt.lt(startsAt)) {
      throw new Error('Invalid ends at. For a prepaid stream, it should be >= starts at')
    } else if (
      initialAmount.lte(BN_ZERO) &&
      (flowRate.lte(BN_ZERO) || (!endsAt.lte(BN_ZERO) && endsAt.sub(startsAt).lte(BN_ZERO)))
    ) {
      throw new Error('Cannot create a zero value stream. This stream will never lead to any payments')
    }
  }

  readonly validateCreatePrepaidStream = (
    at: BN,
    params: {
      recipient: web3.PublicKey
      name: string
      startsAt: BN
      endsAt: BN
      initialAmount: BN
      flowRate: BN
    },
  ) => {
    this.validateCreateStream(at, { isPrepaid: true, ...params })
  }

  readonly validateCreateNonPrepaidStream = (
    at: BN,
    params: {
      recipient: web3.PublicKey
      name: string
      startsAt: BN
      endsAt: BN
      initialAmount: BN
      flowInterval: BN
      flowRate: BN
      topupAmount: BN
    },
  ) => {
    this.validateCreateStream(at, { isPrepaid: false, ...params })

    const { topupAmount } = params
    if (topupAmount.lte(BN_ZERO)) {
      throw new Error('Topup amount should be > 0')
    }

    const deposit = this.getNonPrepaidDepositNeeded(at, { ...params })
    if (deposit.gt(BN_ZERO) && topupAmount.lt(deposit.mul(BN_TWO))) {
      throw new Error(`Minimum topup amount required is ${deposit.mul(BN_TWO).toString()}`)
    }
  }

  readonly createPrepaidStream = async (params: {
    mint: web3.PublicKey
    recipient: web3.PublicKey
    name: string
    startsAt: BN
    endsAt: BN
    initialAmount: BN
    flowInterval: BN
    flowRate: BN
    senderCanCancel: boolean
    senderCanCancelAt: BN
    senderCanChangeSender: boolean
    senderCanChangeSenderAt: BN
    senderCanPause: boolean
    senderCanPauseAt: BN
    recipientCanResumePauseBySender: boolean
    recipientCanResumePauseBySenderAt: BN
    anyoneCanWithdrawForRecipient: boolean
    anyoneCanWithdrawForRecipientAt: BN
  }): Promise<Stream> => {
    this.checkForValidWallet()

    const at = await this.mustGetCurrentTime()
    this.validateCreatePrepaidStream(at, { ...params })

    const {
      mint,
      recipient,
      name,
      startsAt,
      endsAt,
      initialAmount,
      flowInterval,
      flowRate,
      senderCanCancel,
      senderCanCancelAt,
      senderCanChangeSender,
      senderCanChangeSenderAt,
      senderCanPause,
      senderCanPauseAt,
      recipientCanResumePauseBySender,
      recipientCanResumePauseBySenderAt,
      anyoneCanWithdrawForRecipient,
      anyoneCanWithdrawForRecipientAt,
    } = params

    const sender = this.getWalletPublicKey()
    const senderToken = await mustGetAssociatedTokenAccount(this.provider, mint, sender)

    const seed = this.createSeed()
    const [streamKey] = this.getStreamPublicKey(seed, mint, name)
    const escrowToken = await getOrCreateAssociatedTokenAccount(this.provider, mint, streamKey)

    await this.program.methods
      .createPrepaid(
        seed,
        name,
        recipient,
        startsAt,
        endsAt,
        initialAmount,
        flowInterval,
        flowRate,
        senderCanCancel,
        senderCanCancelAt,
        senderCanChangeSender,
        senderCanChangeSenderAt,
        senderCanPause,
        senderCanPauseAt,
        recipientCanResumePauseBySender,
        recipientCanResumePauseBySenderAt,
        anyoneCanWithdrawForRecipient,
        anyoneCanWithdrawForRecipientAt,
      )
      .accounts({
        stream: streamKey,
        sender,
        mint,
        senderToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()

    return this.getStream(streamKey)
  }

  readonly createNonPrepaidStream = async (params: {
    mint: web3.PublicKey
    recipient: web3.PublicKey
    name: string
    startsAt: BN
    endsAt: BN
    initialAmount: BN
    flowInterval: BN
    flowRate: BN
    senderCanCancel: boolean
    senderCanCancelAt: BN
    senderCanChangeSender: boolean
    senderCanChangeSenderAt: BN
    senderCanPause: boolean
    senderCanPauseAt: BN
    recipientCanResumePauseBySender: boolean
    recipientCanResumePauseBySenderAt: BN
    anyoneCanWithdrawForRecipient: boolean
    anyoneCanWithdrawForRecipientAt: BN
    topupAmount: BN
  }): Promise<Stream> => {
    this.checkForValidWallet()

    const at = await this.mustGetCurrentTime()
    this.validateCreateNonPrepaidStream(at, { ...params })

    const {
      mint,
      recipient,
      name,
      startsAt,
      endsAt,
      initialAmount,
      flowInterval,
      flowRate,
      senderCanCancel,
      senderCanCancelAt,
      senderCanChangeSender,
      senderCanChangeSenderAt,
      senderCanPause,
      senderCanPauseAt,
      recipientCanResumePauseBySender,
      recipientCanResumePauseBySenderAt,
      anyoneCanWithdrawForRecipient,
      anyoneCanWithdrawForRecipientAt,
      topupAmount,
    } = params

    const sender = this.getWalletPublicKey()
    const senderToken = await mustGetAssociatedTokenAccount(this.provider, mint, sender)

    const seed = this.createSeed()
    const [streamKey] = this.getStreamPublicKey(seed, mint, name)
    const escrowToken = await getOrCreateAssociatedTokenAccount(this.provider, mint, streamKey)

    await this.program.methods
      .createNonPrepaid(
        seed,
        name,
        recipient,
        startsAt,
        endsAt,
        initialAmount,
        flowInterval,
        flowRate,
        senderCanCancel,
        senderCanCancelAt,
        senderCanChangeSender,
        senderCanChangeSenderAt,
        senderCanPause,
        senderCanPauseAt,
        recipientCanResumePauseBySender,
        recipientCanResumePauseBySenderAt,
        anyoneCanWithdrawForRecipient,
        anyoneCanWithdrawForRecipientAt,
        topupAmount,
      )
      .accounts({
        stream: streamKey,
        sender,
        mint,
        senderToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()

    return this.getStream(streamKey)
  }

  readonly cancelStream = async (stream: Stream) => {
    this.checkForValidWallet()

    const signer = this.getWalletPublicKey()
    const signerToken = await stream.getOrCreateSignerAssociatedTokenAccount()
    const senderToken = await stream.mustGetSenderAssociatedTokenAccount()
    const recipientToken = await stream.getOrCreateRecipientAssociatedTokenAccount()
    const [streamKey] = stream.getStreamPublicKey()
    const escrowToken = await stream.mustGetAssociatedTokenAccount(streamKey)

    await this.program.methods
      .cancel(stream.seed, stream.name, stream.recipient)
      .accounts({
        stream: streamKey,
        sender: stream.sender,
        mint: stream.mint,
        signer,
        signerToken,
        senderToken,
        recipientToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()
  }

  readonly withdrawExcessTopupFromNonPrepaidEndedStream = async (stream: Stream) => {
    this.checkForValidWallet()

    const senderToken = await stream.mustGetSenderAssociatedTokenAccount()
    const signer = this.getWalletPublicKey()
    const [streamKey] = stream.getStreamPublicKey()
    const escrowToken = await stream.mustGetAssociatedTokenAccount(streamKey)

    await this.program.methods
      .withdrawExcessTopupNonPrepaidEnded(stream.seed, stream.name)
      .accounts({
        stream: streamKey,
        sender: stream.sender,
        mint: stream.mint,
        signer,
        senderToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()
  }

  readonly topupNonPrepaidStream = async (stream: Stream, topupAmount: BN) => {
    this.checkForValidWallet()

    const signer = this.getWalletPublicKey()
    const signerToken = await stream.mustGetAssociatedTokenAccount(signer)
    const [streamKey] = stream.getStreamPublicKey()
    const escrowToken = await stream.mustGetAssociatedTokenAccount(streamKey)

    await this.program.methods
      .topupNonPrepaid(stream.seed, stream.name, topupAmount)
      .accounts({
        stream: streamKey,
        mint: stream.mint,
        signer,
        signerToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()
  }

  readonly changeSenderNonPrepaidStream = async (stream: Stream, newSender: web3.PublicKey) => {
    this.checkForValidWallet()

    const sender = this.getWalletPublicKey()
    const [streamKey] = stream.getStreamPublicKey()

    await this.program.methods
      .changeSenderNonPrepaid(stream.seed, stream.name, newSender)
      .accounts({
        stream: streamKey,
        mint: stream.mint,
        sender,
      })
      .rpc()
  }

  readonly withdrawFromStream = async (stream: Stream) => {
    this.checkForValidWallet()

    const signer = this.getWalletPublicKey()
    const recipientToken = await stream.getOrCreateRecipientAssociatedTokenAccount()
    const [streamKey] = stream.getStreamPublicKey()
    const escrowToken = await stream.mustGetAssociatedTokenAccount(streamKey)

    await this.program.methods
      .withdraw(stream.seed, stream.name, stream.recipient)
      .accounts({
        stream: streamKey,
        mint: stream.mint,
        signer,
        recipientToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()
  }

  readonly withdrawFromStreamAndChangeRecipient = async (stream: Stream, newRecipient: web3.PublicKey) => {
    this.checkForValidWallet()

    const signer = this.getWalletPublicKey()
    const recipientToken = await stream.getOrCreateRecipientAssociatedTokenAccount()
    const [streamKey] = stream.getStreamPublicKey()
    const escrowToken = await stream.mustGetAssociatedTokenAccount(streamKey)

    await this.program.methods
      .withdrawAndChangeRecipient(stream.seed, stream.name, stream.recipient, newRecipient)
      .accounts({
        stream: streamKey,
        mint: stream.mint,
        signer,
        recipientToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()
  }

  readonly pauseNonPrepaidStream = async (stream: Stream) => {
    this.checkForValidWallet()

    const signer = this.getWalletPublicKey()
    const [streamKey] = stream.getStreamPublicKey()

    await this.program.methods
      .pauseNonPrepaid(stream.seed, stream.name)
      .accounts({
        stream: streamKey,
        mint: stream.mint,
        signer,
      })
      .rpc()
  }

  readonly resumeNonPrepaidStream = async (stream: Stream) => {
    this.checkForValidWallet()

    const signer = this.getWalletPublicKey()
    const [streamKey] = stream.getStreamPublicKey()

    await this.program.methods
      .resumeNonPrepaid(stream.seed, stream.name)
      .accounts({
        stream: streamKey,
        mint: stream.mint,
        signer,
      })
      .rpc()
  }
}
