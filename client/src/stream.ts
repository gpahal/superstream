import { web3, type BN } from '@coral-xyz/anchor'
import { formatDistanceToNow } from 'date-fns'

import type { StreamAccount, SuperstreamClientInternal } from '@/client-internal'
import { LOW_TOPUP_WARNING_PERIOD_IN_SECS } from '@/constants'
import { StreamPaymentStatus, StreamStatus } from '@/stream-status'
import { BN_ZERO } from '@/utils/bn'
import { getOrCreateAssociatedTokenAccount, mustGetAssociatedTokenAccount } from '@/utils/spl'

/**
 * A payment stream with support for SPL tokens, prepaid and limited upfront payment, unlimited lifetime, cliffs and
 * cancellations.
 *
 * Possible states of a stream:
 * - Not started
 *     - Scheduled
 *     - Cancelled before start
 * - Started but not stopped
 *     - Streaming
 *     - Paused
 * - Stopped
 *     - Cancelled after start
 *     - Ended
 */
export class Stream {
  /** @ignore
   * Reference to the internal Superstream client.
   */
  readonly clientInternal: SuperstreamClientInternal

  /**
   * Stream public key.
   */
  readonly publicKey: web3.PublicKey

  /**
   * If true, the stream is prepaid - all the required amount needs to be deposited on creation. Prepaid streams cannot
   * have unlimited lifetime.
   */
  readonly isPrepaid: boolean

  /**
   * SPL token mint address.
   */
  readonly mint: web3.PublicKey
  /**
   * Sender address.
   */
  readonly sender: web3.PublicKey
  /**
   * Recipient address.
   */
  readonly recipient: web3.PublicKey

  /**
   * Time at which the stream was created.
   */
  readonly createdAt: BN
  /**
   * Start time of the stream.
   *
   * INVARIANT: >= createdAt
   */
  readonly startsAt: BN
  /**
   * End time of the stream. If the stream is unbounded, this can be 0 to indicate no end time.
   *
   * INVARIANT: prepaid: >= startsAt
   * INVARIANT: unbounded: == 0 || >= startsAt
   */
  readonly endsAt: BN

  /**
   * Amount available to the recipient once stream starts.
   */
  readonly initialAmount: BN
  /**
   * Flow interval is the interval in which flow payments are released.
   */
  readonly flowInterval: BN
  /**
   * Flow rate is the number of tokens to stream per interval.
   */
  readonly flowRate: BN

  /**
   * If true, the stream has been cancelled.
   */
  readonly isCancelled: boolean
  /**
   * If true, the stream has been cancelled before start.
   *
   * INVARIANT: !isCancelled => == false
   */
  readonly isCancelledBeforeStart: boolean
  /**
   * If true, the stream has been cancelled by the sender.
   *
   * INVARIANT: !isCancelled || !senderCanCancel => == false
   */
  readonly isCancelledBySender: boolean

  /**
   * Time at which the stream was cancelled. If it is > 0, it means the stream has been cancelled and any funds in the
   * escrow account not available to be withdrawn by the recipient have been retrieved.
   *
   * INVARIANT: cancelledAt > 0 iff isCancelled == true
   */
  readonly cancelledAt: BN

  /**
   * True if a solvent stream can be cancelled by the sender.
   */
  readonly senderCanCancel: boolean
  /**
   * Time at which the sender is allowed to cancel a solvent stream.
   */
  readonly senderCanCancelAt: BN

  /**
   * True if the sender can change the sender of the stream who will do the upcoming topups.
   *
   * INVARIANT: prepaid: false
   */
  readonly senderCanChangeSender: boolean
  /**
   * Time at which the sender is allowed to change the sender.
   *
   * INVARIANT: prepaid: == 0
   */
  readonly senderCanChangeSenderAt: BN

  /**
   * If true, the stream is paused.
   *
   * INVARIANT: prepaid: == false
   */
  readonly isPaused: boolean
  /**
   * If true, the stream is paused by sender.
   *
   * INVARIANT: prepaid: == false
   * INVARIANT: runtime: unbounded: !isPaused || !senderCanPause => == false
   */
  readonly isPausedBySender: boolean

  /**
   * True if a stream can be paused by the sender.
   *
   * INVARIANT: prepaid: false
   */
  readonly senderCanPause: boolean
  /**
   * Time at which the sender is allowed to pause a stream.
   *
   * INVARIANT: prepaid: == 0
   */
  readonly senderCanPauseAt: BN

  /**
   * True if a stream can be resumed by the recipient if it was paused by the sender.
   *
   * INVARIANT: prepaid: false
   */
  readonly recipientCanResumePauseBySender: boolean
  /**
   * Time at which the recipient is allowed to resume a stream which was paused by the sender.
   *
   * INVARIANT: prepaid: == 0
   */
  readonly recipientCanResumePauseBySenderAt: BN

  /**
   * True if anyone can withdraw on behalf of the recipient. The amount will go in recipients' account.
   */
  readonly anyoneCanWithdrawForRecipient: boolean
  /**
   * Time at which anyone can withdraw on behalf of the recipient.
   */
  readonly anyoneCanWithdrawForRecipientAt: BN

  /**
   * Time at which the stream was last resumed.
   *
   * INVARIANT: prepaid: == 0
   * INVARIANT: unbounded: (== 0 || >= startsAt) && (endsAt == 0 || < endsAt)
   */
  readonly lastResumedAt: BN
  /**
   * Total accumulated active (!isPaused) time since startsAt. This does not include (currentTime - lastResumedAt)
   * time if the stream is not paused.
   *
   * INVARIANT: prepaid: == 0
   * INVARIANT: unbounded: == 0 || (currentTime > startsAt && == currentTime - startsAt - totalPausedTime)
   */
  readonly accumulatedActiveTime: BN

  /**
   * Total amount withdrawn by the recipient.
   *
   * INVARIANT: runtime: prepaid: <= amountOwed && <= prepaidAmountNeeded
   * INVARIANT: runtime: unbounded: <= amountOwed && <= totalTopupAmount
   */
  readonly totalWithdrawnAmount: BN
  /**
   * Last time at which recipient withdrew any amount.
   */
  readonly lastWithdrawnAt: BN
  /**
   * Last amount which recipient withdrew.
   */
  readonly lastWithdrawnAmount: BN

  /**
   * Total topup amount added for the stream.
   *
   * INVARIANT: prepaid: == totalPrepaidAmount
   * INVARIANT: unbounded: >= initialAmount + streamingAmountOwed
   */
  readonly totalTopupAmount: BN
  /**
   * Last time at which sender topped up the stream.
   */
  readonly lastTopupAt: BN
  /**
   * Last topup amount.
   */
  readonly lastTopupAmount: BN

  /**
   * Total deposit amount needed for the non-prepaid stream. These are needed in case the sender does not topup the
   * stream in time and the amount owed becomes > total topup amount. When that happens, anyone can cancel the
   * stream. The deposit amount will be distributed as a reward to whoever finds the insolvency and cancels the
   * stream.
   *
   * INVARIANT: prepaid: == 0
   * INVARIANT: unbounded: == DEPOSIT_AMOUNT_PERIOD_IN_SECS of streaming payments
   */
  readonly depositNeeded: BN

  /**
   * Seed of the stream PDA. It's upto the client how they choose the seed. Each tuple (seed, mint, name) corresponds
   * to a unique stream.
   */
  readonly seed: BN
  /**
   * The PDA bump.
   */
  readonly bump: number

  /**
   * Name of the stream. Should be unique for a particular set of (seed, mint).
   *
   * INVARIANT: Length <= 100 unicode chars or 400 bytes
   */
  readonly name: string

  /** @ignore
   * Create a new Stream object.
   *
   * @param other          The stream object
   */
  protected constructor(
    other:
      | {
          clientInternal: SuperstreamClientInternal
          publicKey: web3.PublicKey
          isPrepaid: boolean
          mint: web3.PublicKey
          sender: web3.PublicKey
          recipient: web3.PublicKey
          name: string
          createdAt: BN
          startsAt: BN
          endsAt: BN
          initialAmount: BN
          flowInterval: BN
          flowRate: BN
          isCancelled: boolean
          isCancelledBeforeStart: boolean
          isCancelledBySender: boolean
          cancelledAt: BN
          senderCanCancel: boolean
          senderCanCancelAt: BN
          senderCanChangeSender: boolean
          senderCanChangeSenderAt: BN
          isPaused: boolean
          isPausedBySender: boolean
          senderCanPause: boolean
          senderCanPauseAt: BN
          recipientCanResumePauseBySender: boolean
          recipientCanResumePauseBySenderAt: BN
          anyoneCanWithdrawForRecipient: boolean
          anyoneCanWithdrawForRecipientAt: BN
          lastResumedAt: BN
          accumulatedActiveTime: BN
          totalWithdrawnAmount: BN
          lastWithdrawnAt: BN
          lastWithdrawnAmount: BN
          totalTopupAmount: BN
          lastTopupAt: BN
          lastTopupAmount: BN
          depositNeeded: BN
          seed: BN
          bump: number
        }
      | Stream,
  ) {
    this.clientInternal = other.clientInternal
    this.publicKey = other.publicKey
    this.isPrepaid = other.isPrepaid
    this.mint = other.mint
    this.sender = other.sender
    this.recipient = other.recipient
    this.createdAt = other.createdAt
    this.startsAt = other.startsAt
    this.endsAt = other.endsAt
    this.initialAmount = other.initialAmount
    this.flowInterval = other.flowInterval
    this.flowRate = other.flowRate
    this.isCancelled = other.isCancelled
    this.isCancelledBeforeStart = other.isCancelledBeforeStart
    this.isCancelledBySender = other.isCancelledBySender
    this.cancelledAt = other.cancelledAt
    this.senderCanCancel = other.senderCanCancel
    this.senderCanCancelAt = other.senderCanCancelAt
    this.senderCanChangeSender = other.senderCanChangeSender
    this.senderCanChangeSenderAt = other.senderCanChangeSenderAt
    this.isPaused = other.isPaused
    this.isPausedBySender = other.isPausedBySender
    this.senderCanPause = other.senderCanPause
    this.senderCanPauseAt = other.senderCanPauseAt
    this.recipientCanResumePauseBySender = other.recipientCanResumePauseBySender
    this.recipientCanResumePauseBySenderAt = other.recipientCanResumePauseBySenderAt
    this.anyoneCanWithdrawForRecipient = other.anyoneCanWithdrawForRecipient
    this.anyoneCanWithdrawForRecipientAt = other.anyoneCanWithdrawForRecipientAt
    this.lastResumedAt = other.lastResumedAt
    this.accumulatedActiveTime = other.accumulatedActiveTime
    this.totalWithdrawnAmount = other.totalWithdrawnAmount
    this.lastWithdrawnAt = other.lastWithdrawnAt
    this.lastWithdrawnAmount = other.lastWithdrawnAmount
    this.totalTopupAmount = other.totalTopupAmount
    this.lastTopupAt = other.lastTopupAt
    this.lastTopupAmount = other.lastTopupAmount
    this.depositNeeded = other.depositNeeded
    this.seed = other.seed
    this.bump = other.bump
    this.name = other.name
  }

  /** @ignore
   * Create a new Stream object.
   *
   * @param clientInternal The Superstream internal client
   * @param publicKey      The stream public key
   * @param streamAccount  The stream account returned by Anchor
   *
   * @returns A new Stream object
   */
  static fromStreamAccount(
    clientInternal: SuperstreamClientInternal,
    publicKey: web3.PublicKey,
    streamAccount: StreamAccount,
  ): Stream {
    return new Stream({
      clientInternal,
      publicKey,
      ...streamAccount,
    })
  }

  /**
   * Comparison function for Stream objects by the created at time.
   *
   * @param a The first Stream object
   * @param b The second Stream object
   *
   * @returns -1 if a < b, 0 if a == b or 1 if a > b
   */
  static compareFnCreatedAt(a: Stream, b: Stream): number {
    if (a.createdAt.lt(b.createdAt)) {
      return -1
    } else if (a.createdAt.gt(b.createdAt)) {
      return 1
    }
    return 0
  }

  /**
   * Get the current Solana on-chain time in seconds. If there is an issue fetching the time, undefined is returned.
   *
   * @returns The current Solana on-chain time in seconds or undefined if there was an issue
   */
  readonly getCurrentTime = async (): Promise<BN | undefined> => {
    return this.clientInternal.getCurrentTime()
  }

  /**
   * Get the current Solana on-chain time in seconds. If there is an issue fetching the time, an error is thrown.
   *
   * @returns The current Solana on-chain time in seconds
   *
   * @throws An error is thrown if there is an issue fetching the time
   */
  readonly mustGetCurrentTime = async (): Promise<BN> => {
    return this.clientInternal.mustGetCurrentTime()
  }

  /**
   * Get the stream public key.
   *
   * @returns The stream public key
   */
  readonly getStreamPublicKey = (): [web3.PublicKey, number] => {
    return this.clientInternal.getStreamPublicKey(this.seed, this.mint, this.name)
  }

  /**
   * Refresh the stream.
   *
   * @returns The refreshed stream
   *
   * @throws An error is thrown if there is a Solana RPC issue
   */
  readonly refresh = async (): Promise<Stream> => {
    return await this.clientInternal.getStream(this.publicKey)
  }

  /**
   * Check is the client wallet address is the sender of this stream.
   *
   * @returns true if the client wallet address is the sender of this stream, false otherwise
   */
  readonly isSender = (): boolean => {
    return this.clientInternal.getWalletPublicKey().equals(this.sender)
  }

  /**
   * Check is the client wallet address is the recipient of this stream.
   *
   * @returns true if the client wallet address is the recipient of this stream, false otherwise
   */
  readonly isRecipient = (): boolean => {
    return this.clientInternal.getWalletPublicKey().equals(this.recipient)
  }

  /**
   * Check is the stream has non-zero flow payments. Flow payments refers to payments without the initial amount.
   *
   * @returns true if the stream has flow payments, false otherwise
   */
  readonly hasFlowPayments = (): boolean => {
    return (this.endsAt.lte(BN_ZERO) || this.endsAt.gt(this.startsAt)) && this.flowRate.gt(BN_ZERO)
  }

  /**
   * Get the time at which the stream will stop or has already stopped.
   *
   * @returns The time at which the stream will stop or has already stopped in seconds as BN
   */
  readonly getStopsAt = (): BN => {
    const cancelledAt = this.cancelledAt
    const endsAt = this.endsAt
    if (cancelledAt.lte(BN_ZERO)) {
      return endsAt
    } else if (endsAt.lte(BN_ZERO)) {
      return cancelledAt
    } else if (endsAt.lt(cancelledAt)) {
      return endsAt
    } else {
      return cancelledAt
    }
  }

  /**
   * Check is the stream has stopped at the given on-chain time.
   *
   * @param at The on-chain time
   *
   * @returns true if the stream has stopped, false otherwise
   */
  readonly hasStopped = (at: BN): boolean => {
    const stopsAt = this.getStopsAt()
    return stopsAt.gt(BN_ZERO) && stopsAt.lte(at)
  }

  /**
   * Get the status of the stream at the given on-chain time.
   *
   * @param at The on-chain time
   *
   * @returns The status of the stream
   */
  readonly getStatus = (at: BN): StreamStatus => {
    const hasStopped = this.hasStopped(at)
    if (hasStopped) {
      if (this.isCancelled) {
        return StreamStatus.CANCELLED
      } else {
        return StreamStatus.ENDED
      }
    } else if (this.startsAt.gt(at)) {
      return StreamStatus.NOT_STARTED
    } else if (this.isPaused) {
      return StreamStatus.PAUSED
    } else {
      return StreamStatus.STREAMING
    }
  }

  /**
   * Get the payment status of the stream at the given on-chain time.
   *
   * @param at The on-chain time
   *
   * @returns The payment status of the stream
   */
  readonly getPaymentStatus = (at: BN): StreamPaymentStatus => {
    const status = this.getStatus(at)
    if (status != StreamStatus.STREAMING) {
      return StreamPaymentStatus.STREAMING
    }

    if (this.isPrepaid) {
      return StreamPaymentStatus.PREPAID
    } else if (!this.hasFlowPayments()) {
      return StreamPaymentStatus.FULLY_PAID
    } else {
      const { noLimit, maxAcceptableTopupAmount } = this.getMaxAcceptableTopupAmount(at)
      if (!noLimit && maxAcceptableTopupAmount.lte(BN_ZERO)) {
        return StreamPaymentStatus.FULLY_PAID
      } else {
        const amountOwed = this.getAmountOwed(at)
        const diff = this.totalTopupAmount.sub(amountOwed)
        if (diff.lte(BN_ZERO)) {
          return StreamPaymentStatus.NEEDS_TOPUP
        } else {
          const remainingSecs = diff.mul(this.flowInterval).div(this.flowRate)
          if (remainingSecs.toNumber() <= LOW_TOPUP_WARNING_PERIOD_IN_SECS) {
            return StreamPaymentStatus.LOW_TOPUP
          } else {
            return StreamPaymentStatus.STREAMING
          }
        }
      }
    }
  }

  private readonly unsafeGetActiveTimeAfterStart = (at: BN): BN => {
    return this.isPaused
      ? this.accumulatedActiveTime
      : this.lastResumedAt.lte(BN_ZERO)
      ? at.sub(this.startsAt)
      : at.sub(this.lastResumedAt).add(this.accumulatedActiveTime)
  }

  /**
   * Get the maximum acceptable topup amount at the given on-chain time.
   *
   * @param at The on-chain time
   *
   * @returns The maximum acceptable topup amount. If there is no maximum, the noLimit property is true
   */
  readonly getMaxAcceptableTopupAmount = (at: BN): { noLimit: boolean; maxAcceptableTopupAmount: BN } => {
    if (this.isPrepaid || !this.hasFlowPayments()) {
      return { noLimit: false, maxAcceptableTopupAmount: BN_ZERO }
    }

    const stopsAt = this.getStopsAt()
    if (stopsAt.lte(BN_ZERO)) {
      return { noLimit: true, maxAcceptableTopupAmount: BN_ZERO }
    } else if (stopsAt.lt(this.startsAt)) {
      return { noLimit: false, maxAcceptableTopupAmount: BN_ZERO }
    }

    const totalPossibleActiveTime = at.lt(this.startsAt)
      ? this.endsAt.sub(this.startsAt)
      : stopsAt.lte(at)
      ? this.unsafeGetActiveTimeAfterStart(stopsAt)
      : this.unsafeGetActiveTimeAfterStart(at).add(stopsAt.sub(at))
    const totalPossibleTopup = totalPossibleActiveTime.lte(BN_ZERO)
      ? this.initialAmount
      : this.initialAmount.add(totalPossibleActiveTime.mul(this.flowRate).div(this.flowInterval))
    if (totalPossibleTopup.lte(this.totalTopupAmount)) {
      return { noLimit: false, maxAcceptableTopupAmount: BN_ZERO }
    } else {
      return { noLimit: false, maxAcceptableTopupAmount: totalPossibleTopup.sub(this.totalTopupAmount) }
    }
  }

  /**
   * Get the total amount owed to the recipient at the given on-chain time. This includes any amount the recipient has
   * already withdrawn. That need be subtracted to get the amount the recipient is eligible to withdraw. See
   * {@link Stream.totalWithdrawnAmount} for more details.
   *
   * @param at The on-chain time
   *
   * @returns The total amount owed to the recipient at the given on-chain time
   */
  readonly getAmountOwed = (at: BN): BN => {
    const stopsAt = this.getStopsAt()
    if (stopsAt.gt(BN_ZERO) && stopsAt.lt(at)) {
      at = stopsAt
    }

    if (at.lt(this.startsAt)) {
      return BN_ZERO
    } else if (!this.hasFlowPayments()) {
      return this.initialAmount
    } else {
      const activeTime = this.isPaused
        ? this.accumulatedActiveTime
        : this.lastResumedAt.eq(BN_ZERO)
        ? at.sub(this.startsAt)
        : at.sub(this.lastResumedAt).add(this.accumulatedActiveTime)
      return this.initialAmount.add(activeTime.mul(this.flowRate).div(this.flowInterval))
    }
  }

  /**
   * Get the total amount available to withdraw to the recipient at the given on-chain time.
   *
   * @param at The on-chain time
   *
   * @returns The total amount available to withdraw to the recipient at the given on-chain time
   */
  readonly getAmountAvailableToWithdraw = (at: BN): BN => {
    const amountOwed = this.getAmountOwed(at)
    let amountAvailableToWithdraw = this.totalWithdrawnAmount.gte(amountOwed)
      ? BN_ZERO
      : amountOwed.sub(this.totalWithdrawnAmount)
    if (amountAvailableToWithdraw.gt(BN_ZERO)) {
      const totalEscrowAmount = this.totalTopupAmount.add(this.depositNeeded)
      if (this.totalWithdrawnAmount.gte(totalEscrowAmount)) {
        amountAvailableToWithdraw = BN_ZERO
      } else {
        const remainingEscrowAmount = totalEscrowAmount.sub(this.totalWithdrawnAmount)
        if (amountAvailableToWithdraw.gt(remainingEscrowAmount)) {
          amountAvailableToWithdraw = remainingEscrowAmount
        }
      }
    }
    return amountAvailableToWithdraw
  }

  /**
   * Check is the stream is solvent at the given on-chain time.
   *
   * @param at The on-chain time
   *
   * @returns true if the stream is solvent, false otherwise
   */
  readonly isSolvent = (at: BN): boolean => {
    return this.getAmountOwed(at).lte(this.totalTopupAmount)
  }

  /**
   * Validate if the stream can be cancelled at the given on-chain time.
   *
   * Conditions when validation fails:
   * - Stream has already been cancelled
   * - Stream has already ended
   * - Stream is solvent and
   *   - Wallet doesn't belong to the sender or the recipient of the stream
   *   - Wallet belongs to the sender of the stream and the sender of the stream isn't allowed to cancel
   *
   * @param at The on-chain time
   *
   * @throws An error is thrown if the stream cannot be cancelled
   */
  readonly validateCancel = (at: BN) => {
    if (this.isCancelled) {
      throw new Error('The stream has already been cancelled')
    } else if (this.isSolvent(at)) {
      const isSender = this.isSender()
      const isRecipient = this.isRecipient()
      if (!isSender && !isRecipient) {
        throw new Error('A solvent stream can only be cancelled by the sender or the recipient')
      } else if (isSender) {
        if (!this.senderCanCancel) {
          throw new Error('The sender is not allowed to cancel the stream')
        } else if (this.senderCanCancelAt.gt(at)) {
          throw new Error(
            `The sender can only cancel the stream in ${formatDistanceToNow(Number(this.senderCanCancelAt) * 1000)}`,
          )
        }
      }
    }

    if (this.hasStopped(at)) {
      throw new Error('Stream has already stopped. Cannot change sender of a stopped stream')
    }
  }

  /**
   * Cancel the stream and validate at the given on-chain time.
   *
   * @param at  The on-chain time
   *
   * @throws An error is thrown if the stream cannot be cancelled or a user wallet wasn't provided to the Superstream
   *         client or there is a Solana RPC issue
   */
  readonly cancel = async (at: BN) => {
    this.validateCancel(at)
    await this.clientInternal.cancelStream(this)
  }

  /**
   * Validate if the stream can be withdrawn from for excess sender topup at the given on-chain time.
   *
   * Conditions when validation fails:
   * - Stream has already been cancelled
   * - Stream has not yet ended
   * - Stream is insolvent
   * - Amount owed to the recipient is more than the total topup amount plus the deposit
   *
   * @param at The on-chain time
   *
   * @throws An error is thrown if the stream cannot be withdrawn from for excess sender topup
   */
  readonly validateWithdrawExcessTopupNonPrepaidEnded = (at: BN) => {
    if (this.isCancelled) {
      throw new Error('The stream has already been cancelled')
    } else if (!this.isSolvent(at)) {
      throw new Error('The stream is insolvent')
    } else {
      const amountOwed = this.getAmountOwed(at)
      const amount = this.totalTopupAmount.add(this.depositNeeded).sub(amountOwed)
      if (amount.lte(BN_ZERO)) {
        throw new Error('Nothing to withdraw')
      }
    }

    if (!this.hasStopped(at)) {
      throw new Error('Stream has not stopped. Can withdraw excess topup only after the stream has ended')
    }
  }

  /**
   * Withdraw excess sender topup from the non-prepaid stream and validate at the given on-chain time.
   *
   * @param at  The on-chain time
   *
   * @throws An error is thrown if the stream cannot be withdrawn from for excess sender topup or a user wallet wasn't
   *         provided to the Superstream client or there is a Solana RPC issue
   */
  readonly withdrawExcessTopupNonPrepaidEnded = async (at: BN) => {
    this.validateWithdrawExcessTopupNonPrepaidEnded(at)
    await this.clientInternal.withdrawExcessTopupFromNonPrepaidEndedStream(this)
  }

  /**
   * Validate if the non-prepaid stream can be topped up at the given on-chain time.
   *
   * Conditions when validation fails:
   * - Stream has already ended
   * - Stream is prepaid
   * - Stream doesn't have any flow payments (payments apart from the initial amount)
   * - Topup amount is <= 0
   * - Topup amount is > maximum acceptable topup amount
   *
   * @param at          The on-chain time
   * @param topupAmount The topup amount
   *
   * @throws An error is thrown if the stream cannot be topped up
   */
  readonly validateTopupNonPrepaid = (at: BN, topupAmount?: BN) => {
    if (this.isPrepaid) {
      throw new Error('Cannot topup a prepaid stream')
    } else if (topupAmount != null && topupAmount.eq(BN_ZERO)) {
      throw new Error('Topup amount should be > 0')
    } else if (!this.hasFlowPayments()) {
      throw new Error('Stream has no flow payments')
    }

    if (this.hasStopped(at)) {
      throw new Error('Stream has already stopped. Cannot topup a stopped stream')
    }

    if (topupAmount) {
      const { noLimit, maxAcceptableTopupAmount } = this.getMaxAcceptableTopupAmount(at)
      if (!noLimit && topupAmount.gt(maxAcceptableTopupAmount)) {
        throw new Error('The topup amount is more than what is needed by the stream')
      }
    }
  }

  /**
   * Topup the non-prepaid stream and validate at the given on-chain time.
   *
   * @param at          The on-chain time
   * @param topupAmount The topup amount
   *
   * @throws An error is thrown if the stream cannot be topped up or a user wallet wasn't provided to the Superstream
   *         client or there is a Solana RPC issue
   */
  readonly topupNonPrepaid = async (at: BN, topupAmount: BN) => {
    this.validateTopupNonPrepaid(at, topupAmount)
    await this.clientInternal.topupNonPrepaidStream(this, topupAmount)
  }

  /**
   * Validate if the non-prepaid stream's sender can be changed at the given on-chain time.
   *
   * Conditions when validation fails:
   * - Stream has already ended
   * - Stream is prepaid
   * - Wallet doesn't belong to the sender of the stream
   * - Sender of the stream is not allowed to change the sender
   * - New sender === `web3.PublicKey.default`
   * - New sender === `this stream's current sender`
   *
   * @param at        The on-chain time
   * @param newSender The new sender
   *
   * @throws An error is thrown if the stream's sender cannot be changed
   */
  readonly validateChangeSenderNonPrepaid = (at: BN, newSender?: web3.PublicKey) => {
    if (this.isPrepaid) {
      throw new Error('Sender of prepaid streams cannot be changed')
    } else if (!this.isSender()) {
      throw new Error('Only the sender can change the sender')
    } else if (newSender != null) {
      if (newSender.equals(web3.PublicKey.default)) {
        throw new Error('Invalid new sender. New sender has to be a valid address')
      } else if (newSender.equals(this.sender)) {
        throw new Error('New sender cannot be the same as the current sender')
      }
    }

    if (!this.senderCanChangeSenderAt) {
      throw new Error('Sender is not allowed to change sender of the stream')
    } else if (this.senderCanChangeSenderAt.gt(at)) {
      throw new Error(
        `The sender can only change the sender of the stream in ${formatDistanceToNow(
          Number(this.senderCanCancelAt) * 1000,
        )}`,
      )
    }

    if (this.hasStopped(at)) {
      throw new Error('Stream has already stopped. Cannot change sender of a stopped stream')
    }
  }

  /**
   * Change the sender of the non-prepaid stream and validate at the given on-chain time. The new sender should not be
   * === `web3.PublicKey.default` or === `this stream's current sender`
   *
   * @param at        The on-chain time
   * @param newSender The new sender. The new sender should not be === `web3.PublicKey.default` or === `this stream's
   *                  current sender`
   *
   * @throws An error is thrown if the stream's sender cannot be changed or a user wallet wasn't provided to the
   *         Superstream client or there is a Solana RPC issue
   */
  readonly changeSenderNonPrepaid = async (at: BN, newSender: web3.PublicKey) => {
    this.validateChangeSenderNonPrepaid(at, newSender)
    await this.clientInternal.changeSenderNonPrepaidStream(this, newSender)
  }

  /**
   * Validate if the stream's recipient funds can be withdrawn at the given on-chain time.
   *
   * Conditions when validation fails:
   * - Amount owed to the recipient is less than or equal to the total withdrawn amount
   * - Total withdrawn amount is greater than or equal to the total topup amount plus the total deposit
   * - Wallet doesn't belong to the recipient of the stream and
   *   - Anyone cannot withdraw on behalf of the recipient
   *
   * @param at The on-chain time
   *
   * @throws An error is thrown if the stream's recipient funds cannot be withdrawn
   */
  readonly validateWithdraw = (at: BN) => {
    const amountOwed = this.getAmountOwed(at)
    if (amountOwed.lte(this.totalWithdrawnAmount)) {
      throw new Error('Amount owed has already been withdrawn. Nothing to withdraw')
    } else if (this.totalWithdrawnAmount.gte(this.totalTopupAmount.add(this.depositNeeded))) {
      throw new Error('Amount topped up has already been withdrawn. Nothing to withdraw')
    } else if (!this.isRecipient()) {
      if (!this.anyoneCanWithdrawForRecipient) {
        throw new Error('Only the recipient can withdraw')
      } else if (this.anyoneCanWithdrawForRecipientAt.gt(at)) {
        throw new Error(
          `Non-recipients can only withdraw for the recipient of the stream in ${formatDistanceToNow(
            Number(this.senderCanCancelAt) * 1000,
          )}`,
        )
      }
    }
  }

  /**
   * Withdraw recipient funds from the stream and validate at the given on-chain time.
   *
   * @param at The on-chain time
   *
   * @throws An error is thrown if the stream's recipient funds cannot be withdrawn or a user wallet wasn't provided to
   *         the Superstream client or there is a Solana RPC issue
   */
  readonly withdraw = async (at: BN) => {
    this.validateWithdraw(at)
    await this.clientInternal.withdrawFromStream(this)
  }

  /**
   * Validate if the stream's recipient funds can be withdrawn and the recipient can be changed at the given on-chain
   * time.
   *
   * Conditions when validation fails:
   * - {@link Stream.validateWithdraw} fails
   * - Wallet doesn't belong to the recipient of the stream
   * - New recipient === `this stream's current recipient`
   *
   * @param at           The on-chain time
   * @param newRecipient The new recipient
   *
   * @throws An error is thrown if the stream's recipient funds cannot be withdrawn or the recipient cannot be changed
   */
  readonly validateWithdrawAndChangeRecipient = (at: BN, newRecipient?: web3.PublicKey) => {
    this.validateWithdraw(at)
    if (!this.isRecipient()) {
      throw new Error('Only the recipient can withdraw and change recipient')
    } else if (
      newRecipient != null &&
      !newRecipient.equals(web3.PublicKey.default) &&
      newRecipient.equals(this.recipient)
    ) {
      throw new Error('New recipient cannot be the same as the current recipient')
    }
  }

  /**
   * Withdraw recipient funds from the stream and change the recipient of the stream and validate at the given on-chain
   * time. If the new recipient === `web3.PublicKey.default`, the recipient is not changed. The new recipient should not
   * be === `this stream's current recipient`.
   *
   * @param at           The on-chain time
   * @param newRecipient The new recipient. If the new recipient === `web3.PublicKey.default`, the recipient is not
   *                     changed. The new recipient should not be === `this stream's current recipient`
   *
   * @throws An error is thrown if the stream's recipient funds cannot be withdrawn or the recipient cannot be changed
   *         or a user wallet wasn't provided to the Superstream client or there is a Solana RPC issue
   */
  readonly withdrawAndChangeRecipient = async (at: BN, newRecipient: web3.PublicKey) => {
    this.validateWithdrawAndChangeRecipient(at, newRecipient)
    await this.clientInternal.withdrawFromStreamAndChangeRecipient(this, newRecipient)
  }

  /**
   * Validate if the stream can be paused at the given on-chain time.
   *
   * Conditions when validation fails:
   * - Stream is prepaid
   * - Stream has already stopped
   * - Stream is already paused
   * - Stream doesn't have any flow payments (payments apart from the initial amount)
   * - Wallet doesn't belong to the sender or the recipient of the stream
   * - Wallet belongs to the sender of the stream and
   *   - Sender of the stream isn't allowed to pause
   *
   * @param at The on-chain time
   *
   * @throws An error is thrown if the stream cannot be paused
   */
  readonly validatePauseNonPrepaid = (at: BN) => {
    if (this.isPrepaid) {
      throw new Error('Prepaid streams cannot be paused')
    } else if (this.isPaused) {
      throw new Error('Stream is already paused')
    } else if (!this.hasFlowPayments()) {
      throw new Error('Stream with no flow payments cannot be paused')
    }

    const isSender = this.isSender()
    const isRecipient = this.isRecipient()
    if (!isSender && !isRecipient) {
      throw new Error('Only the sender and the recipient can pause a stream')
    } else if (isSender) {
      if (!this.senderCanPause) {
        throw new Error('Sender is not allowed to pause the stream')
      } else if (this.senderCanPauseAt.gt(at)) {
        throw new Error(
          `The sender can only pause the stream in ${formatDistanceToNow(Number(this.senderCanCancelAt) * 1000)}`,
        )
      }
    }

    if (this.hasStopped(at)) {
      throw new Error('Stream has already stopped. Cannot pause a stopped stream')
    }
  }

  /**
   * Pause the non-prepaid stream and validate at the given on-chain time.
   *
   * @param at The on-chain time
   *
   * @throws An error is thrown if the stream cannot be paused or a user wallet wasn't provided to the Superstream
   *         client or there is a Solana RPC issue
   */
  readonly pauseNonPrepaid = async (at: BN) => {
    this.validatePauseNonPrepaid(at)
    await this.clientInternal.pauseNonPrepaidStream(this)
  }

  /**
   * Validate if the stream can be resumed at the given on-chain time.
   *
   * Conditions when validation fails:
   * - Stream is prepaid
   * - Stream has already stopped
   * - Stream is not already paused
   * - Wallet doesn't belong to the sender or the recipient of the stream
   * - Wallet belongs to the recipient of the stream and
   *   - Stream is paused by the sender of the stream and
   *     - Recipient of the stream isn't allowed to resume a stream paused by the sender of the stream
   *
   * @param at The on-chain time
   *
   * @throws An error is thrown if the stream cannot be resumed
   */
  readonly validateResumeNonPrepaid = (at: BN) => {
    if (this.isPrepaid) {
      throw new Error('Prepaid streams cannot be paused')
    } else if (!this.isPaused) {
      throw new Error('Only a paused stream can be resumed')
    }

    const isSender = this.isSender()
    const isRecipient = this.isRecipient()
    if (!isSender && !isRecipient) {
      throw new Error('Only the sender and the recipient can pause a stream')
    } else if (isRecipient && this.isPausedBySender) {
      if (!this.recipientCanResumePauseBySender) {
        throw new Error('Recipient is not allowed to resume a stream paused by the sender')
      } else if (this.recipientCanResumePauseBySenderAt.gt(at)) {
        throw new Error(
          `The recipient can only resume the stream in ${formatDistanceToNow(Number(this.senderCanCancelAt) * 1000)}`,
        )
      }
    }

    if (this.hasStopped(at)) {
      throw new Error('Stream has already stopped. Cannot resume a stopped stream')
    }
  }

  /**
   * Resume the non-prepaid stream and validate at the given on-chain time.
   *
   * @param at The on-chain time
   *
   * @throws An error is thrown if the stream cannot be resumed or a user wallet wasn't provided to the Superstream
   *         client or there is a Solana RPC issue
   */
  readonly resumeNonPrepaid = async (at: BN) => {
    this.validateResumeNonPrepaid(at)
    await this.clientInternal.resumeNonPrepaidStream(this)
  }

  /**
   * Get or create an associated token account for the stream's mint for the given owner.
   *
   * @param owner The public key of the owner for which an associated token account is needed
   *
   * @returns The public key of the associated token account fetched or created
   *
   * @throws An error is thrown if there is a Solana RPC issue
   */
  readonly getOrCreateAssociatedTokenAccount = async (owner: web3.PublicKey): Promise<web3.PublicKey> => {
    return await getOrCreateAssociatedTokenAccount(this.clientInternal.provider, this.mint, owner)
  }

  /**
   * Get or create an associated token account for the stream's mint for the signer.
   *
   * @returns The public key of the associated token account fetched or created
   *
   * @throws An error is thrown if there is a Solana RPC issue
   */
  readonly getOrCreateSignerAssociatedTokenAccount = async (): Promise<web3.PublicKey> => {
    return await getOrCreateAssociatedTokenAccount(
      this.clientInternal.provider,
      this.mint,
      this.clientInternal.getWalletPublicKey(),
    )
  }

  /**
   * Get or create an associated token account for the stream's mint for the stream sender.
   *
   * @returns The public key of the associated token account fetched or created
   *
   * @throws An error is thrown if there is a Solana RPC issue
   */
  readonly getOrCreateSenderAssociatedTokenAccount = async (): Promise<web3.PublicKey> => {
    return await getOrCreateAssociatedTokenAccount(this.clientInternal.provider, this.mint, this.sender)
  }

  /**
   * Get or create an associated token account for the stream's mint for the stream recipient.
   *
   * @returns The public key of the associated token account fetched or created
   *
   * @throws An error is thrown if there is a Solana RPC issue
   */
  readonly getOrCreateRecipientAssociatedTokenAccount = async (): Promise<web3.PublicKey> => {
    return await getOrCreateAssociatedTokenAccount(this.clientInternal.provider, this.mint, this.recipient)
  }

  /**
   * Get the associated token account for the stream's mint for the given owner. If an associated token account doesn't
   * exist, an error is thrown.
   *
   * @param owner The public key of the owner for which the associated token account is needed
   *
   * @returns The public key of the associated token account
   *
   * @throws An error is thrown an associated token account doesn't exist or there is a Solana RPC issue
   */
  readonly mustGetAssociatedTokenAccount = async (owner: web3.PublicKey): Promise<web3.PublicKey> => {
    return await mustGetAssociatedTokenAccount(this.clientInternal.provider, this.mint, owner)
  }

  /**
   * Get the associated token account for the stream's mint for the stream sender. If an associated token account
   * doesn't exist, an error is thrown.
   *
   * @returns The public key of the associated token account
   *
   * @throws An error is thrown an associated token account doesn't exist or there is a Solana RPC issue
   */
  readonly mustGetSenderAssociatedTokenAccount = async (): Promise<web3.PublicKey> => {
    return await this.mustGetAssociatedTokenAccount(this.sender)
  }

  /**
   * Get the associated token account for the stream's mint for the stream recipient. If an associated token account
   * doesn't exist, an error is thrown.
   *
   * @returns The public key of the associated token account
   *
   * @throws An error is thrown an associated token account doesn't exist or there is a Solana RPC issue
   */
  readonly mustGetRecipientAssociatedTokenAccount = async (): Promise<web3.PublicKey> => {
    return await this.mustGetAssociatedTokenAccount(this.recipient)
  }
}
