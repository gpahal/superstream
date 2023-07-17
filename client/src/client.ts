import { AnchorProvider, BN, web3 } from '@coral-xyz/anchor'

import { SuperstreamClientInternal } from '@/client-internal'
import { StreamFilters } from '@/filters'
import { StreamPagination } from '@/pagination'
import { Stream } from '@/stream'
import { Wallet } from '@/utils/wallet'

/**
 * Superstream client is a client used to interact with on-chain Superstream stream data - fetch streams, create new
 * streams and do operations on those streams. Look at the class methods for more information.
 */
export type SuperstreamClient = {
  /**
   * Get the Anchor provider used by the Superstream client.
   *
   * @returns The Anchor provider
   */
  readonly getProvider: () => AnchorProvider

  /**
   * Get the Solana connection used by the Superstream client.
   *
   * @returns The Solana connection
   */
  readonly getConnection: () => web3.Connection

  /**
   * Get the public key of the Solana wallet used by the Superstream client. If no wallet was provided while creating
   * the client, a default public key will be returned by this method.
   *
   * @returns The public key of the Solana wallet
   */
  readonly getWalletPublicKey: () => web3.PublicKey

  /**
   * Get the current Solana on-chain time in seconds. If there is an issue fetching the time, undefined is returned.
   *
   * @returns The current Solana on-chain time in seconds or undefined if there was an issue
   */
  readonly getCurrentTime: () => Promise<BN | undefined>

  /**
   * Get the current Solana on-chain time in seconds. If there is an issue fetching the time, an error is thrown.
   *
   * @returns The current Solana on-chain time in seconds
   *
   * @throws An error is thrown if there is an issue fetching the time
   */
  readonly mustGetCurrentTime: () => Promise<BN>

  /**
   * Get a stream by public key. If such a stream doesn't exist, undefined is returned. If there is a Solana RPC issue,
   * an error is thrown.
   *
   * @returns The stream with the given public key or undefined if not found
   *
   * @throws An error is thrown if there is a Solana RPC issue
   */
  readonly maybeGetStream: (publicKey: web3.PublicKey) => Promise<Stream | undefined>

  /**
   * Get a stream by public key. If such a stream doesn't exist or there is a Solana RPC issue, an error is thrown.
   *
   * @returns The stream with the given public key
   *
   * @throws An error is thrown if a stream with the given public key doesn't exist or there is a Solana RPC issue.
   */
  readonly getStream: (publicKey: web3.PublicKey) => Promise<Stream>

  /**
   * Get multiple streams by public key. If some public keys don't exist, they are excluded from the return list. If
   * there is a Solana RPC issue, an error is thrown.
   *
   * @returns The streams with the given public keys
   *
   * @throws An error is thrown if there is a Solana RPC issue
   */
  readonly getMultipleStreams: (publicKeys: web3.PublicKey[]) => Promise<(Stream | undefined)[]>

  /**
   * Get all streams that satisfy the given filters. If there is a Solana RPC issue, an error is thrown.
   *
   * @param filters The stream filters
   *
   * @returns The streams that satisfy the given filters
   *
   * @throws An error is thrown if there is a Solana RPC issue
   */
  readonly getAllStreams: (filters?: StreamFilters) => Promise<Stream[]>

  /**
   * Get all streams with pagination that satisfy the given filters. If there is a Solana RPC issue, an error is thrown.
   *
   * @param filters The stream filters
   *
   * @returns The StreamPagination object which returns all streams that satisfy the given filters
   *
   * @throws An error is thrown if there is a Solana RPC issue
   */
  readonly getAllStreamsPagination: (filters?: StreamFilters) => StreamPagination

  /**
   * Get the prepaid amount needed to create a new prepaid stream with the given parameters.
   *
   * @param at     The on-chain time at which the prepaid amount calculation is needed
   * @param params For more information on the parameters, look at the {@link Stream} class documentation
   *
   * @returns The prepaid amount needed to create a new prepaid stream with the given parameters
   */
  readonly getPrepaidAmountNeeded: (
    at: BN,
    params: {
      startsAt: BN
      endsAt: BN
      initialAmount: BN
      flowInterval: BN
      flowRate: BN
    },
  ) => BN

  /**
   * Get the deposit amount needed to create a new non-prepaid stream with the given parameters. For more information on
   * the deposit needed, look at the {@link DEPOSIT_AMOUNT_PERIOD_IN_SECS} documentation.
   *
   * @param at     The on-chain time at which the deposit amount calculation is needed
   * @param params For more information on the parameters, look at the {@link Stream} class documentation
   *
   * @returns The deposit amount needed to create a new non-prepaid stream with the given parameters
   */
  readonly getNonPrepaidDepositNeeded: (
    at: BN,
    params: { startsAt: BN; endsAt: BN; flowInterval: BN; flowRate: BN },
  ) => BN

  /**
   * Validate the parameters to create a new prepaid stream.
   *
   * @param at     The on-chain time at which the validation is needed
   * @param params For more information on the parameters, look at the {@link Stream} class documentation
   *
   * @throws An error is thrown is a prepaid stream cannot be created with the given parameters
   */
  readonly validateCreatePrepaidStream: (
    at: BN,
    params: {
      recipient: web3.PublicKey
      name: string
      startsAt: BN
      endsAt: BN
      initialAmount: BN
      flowRate: BN
    },
  ) => void

  /**
   * Validate the parameters to create a new non-prepaid stream.
   *
   * @param at     The on-chain time at which the validation is needed
   * @param params The `topupAmount` field is the amount that the stream would be topped up with. It should be >= amount
   *               returned by {@link SuperstreamClient.getNonPrepaidDepositNeeded}. For more information on the other
   *               parameters, look at the {@link Stream} class documentation
   *
   * @throws An error is thrown is a non-prepaid stream cannot be created with the given parameters
   */
  readonly validateCreateNonPrepaidStream: (
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
  ) => void

  /**
   * Create a new prepaid stream.
   *
   * @param params For more information on the parameters, look at the {@link Stream} class documentation
   *
   * @throws An error is thrown is a prepaid stream cannot be created with the given parameters or a user wallet wasn't
   *         provided to the Superstream client or there is a Solana RPC issue
   */
  readonly createPrepaidStream: (params: {
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
  }) => Promise<Stream>

  /**
   * Create a new non-prepaid stream.
   *
   * @param params The `topupAmount` field is the amount that the stream would be topped up with. It should be >= amount
   *               returned by {@link SuperstreamClient.getNonPrepaidDepositNeeded}. For more information on the other
   *               parameters, look at the {@link Stream} class documentation
   *
   * @throws An error is thrown is a non-prepaid stream cannot be created with the given parameters or a user wallet
   *         wasn't provided to the Superstream client or there is a Solana RPC issue
   */
  readonly createNonPrepaidStream: (params: {
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
  }) => Promise<Stream>
}

/**
 * Create a new Superstream client.
 *
 * @param cluster The Solana cluster to create a client for. Possible values - "mainnet-beta", "devnet", "testnet" or
 *                a custom URL.
 * @param wallet  The user wallet which will be used to create streams and do other operations. This is optional. If
 *                not provided, the operations requiring a payer will throw an error.
 *
 * @returns A new superstream client
 */
export function createSuperstreamClient(cluster: web3.Cluster | URL, wallet?: Wallet): SuperstreamClient {
  return new SuperstreamClientInternal(cluster, wallet)
}
