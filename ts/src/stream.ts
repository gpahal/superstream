import { BN, web3 } from "@project-serum/anchor";
import { formatDistanceToNow } from "date-fns";

import { StreamAccount, StreamingClientInternal } from "./client-internal";
import { BN_ZERO } from "./utils/bn";
import { getOrCreateAssociatedTokenAccount, mustGetAssociatedTokenAccount } from "./utils/spl";

export class Stream {
  readonly clientInternal: StreamingClientInternal;

  readonly publicKey: web3.PublicKey;

  readonly prepaid: boolean;
  readonly paused: boolean;
  readonly pausedBySender: boolean;

  readonly mint: web3.PublicKey;
  readonly sender: web3.PublicKey;
  readonly recipient: web3.PublicKey;

  readonly name: string;

  readonly createdAt: BN;

  readonly startsAt: BN;
  readonly endsAt: BN;
  readonly initialAmount: BN;
  readonly flowInterval: BN;
  readonly flowRate: BN;

  readonly senderCanCancel: boolean;
  readonly senderCanCancelAt: BN;

  readonly cancelledAt: BN;

  readonly senderCanChangeSender: boolean;
  readonly senderCanChangeSenderAt: BN;

  readonly senderCanPause: boolean;
  readonly senderCanPauseAt: BN;

  readonly recipientCanResumePauseBySender: boolean;
  readonly recipientCanResumePauseBySenderAt: BN;

  readonly lastResumedAt: BN;
  readonly accumulatedActiveTime: BN;

  readonly totalWithdrawnAmount: BN;
  readonly lastWithdrawnAt: BN;
  readonly lastWithdrawnAmount: BN;

  readonly totalTopupAmount: BN;
  readonly lastTopupAt: BN;
  readonly lastTopupAmount: BN;

  readonly depositNeeded: BN;

  readonly seed: BN;
  readonly bump: number;

  protected constructor(
    other:
      | {
          clientInternal: StreamingClientInternal;
          publicKey: web3.PublicKey;
          prepaid: boolean;
          paused: boolean;
          pausedBySender: boolean;
          createdAt: BN;
          mint: web3.PublicKey;
          sender: web3.PublicKey;
          recipient: web3.PublicKey;
          name: string;
          startsAt: BN;
          endsAt: BN;
          initialAmount: BN;
          flowInterval: BN;
          flowRate: BN;
          senderCanCancel: boolean;
          senderCanCancelAt: BN;
          cancelledAt: BN;
          senderCanChangeSender: boolean;
          senderCanChangeSenderAt: BN;
          senderCanPause: boolean;
          senderCanPauseAt: BN;
          recipientCanResumePauseBySender: boolean;
          recipientCanResumePauseBySenderAt: BN;
          lastResumedAt: BN;
          accumulatedActiveTime: BN;
          totalWithdrawnAmount: BN;
          lastWithdrawnAt: BN;
          lastWithdrawnAmount: BN;
          totalTopupAmount: BN;
          lastTopupAt: BN;
          lastTopupAmount: BN;
          depositNeeded: BN;
          seed: BN;
          bump: number;
        }
      | Stream,
  ) {
    this.clientInternal = other.clientInternal;
    this.publicKey = other.publicKey;
    this.prepaid = other.prepaid;
    this.paused = other.paused;
    this.pausedBySender = other.pausedBySender;
    this.mint = other.mint;
    this.sender = other.sender;
    this.recipient = other.recipient;
    this.name = other.name;
    this.createdAt = other.createdAt;
    this.startsAt = other.startsAt;
    this.endsAt = other.endsAt;
    this.initialAmount = other.initialAmount;
    this.flowInterval = other.flowInterval;
    this.flowRate = other.flowRate;
    this.senderCanCancel = other.senderCanCancel;
    this.senderCanCancelAt = other.senderCanCancelAt;
    this.cancelledAt = other.cancelledAt;
    this.senderCanChangeSender = other.senderCanChangeSender;
    this.senderCanChangeSenderAt = other.senderCanChangeSenderAt;
    this.senderCanPause = other.senderCanPause;
    this.senderCanPauseAt = other.senderCanPauseAt;
    this.recipientCanResumePauseBySender = other.recipientCanResumePauseBySender;
    this.recipientCanResumePauseBySenderAt = other.recipientCanResumePauseBySenderAt;
    this.lastResumedAt = other.lastResumedAt;
    this.accumulatedActiveTime = other.accumulatedActiveTime;
    this.totalWithdrawnAmount = other.totalWithdrawnAmount;
    this.lastWithdrawnAt = other.lastWithdrawnAt;
    this.lastWithdrawnAmount = other.lastWithdrawnAmount;
    this.totalTopupAmount = other.totalTopupAmount;
    this.lastTopupAt = other.lastTopupAt;
    this.lastTopupAmount = other.lastTopupAmount;
    this.depositNeeded = other.depositNeeded;
    this.seed = other.seed;
    this.bump = other.bump;
  }

  static fromStreamAccount(
    clientInternal: StreamingClientInternal,
    publicKey: web3.PublicKey,
    streamAccount: StreamAccount,
  ): Stream {
    return new Stream({
      clientInternal,
      publicKey,
      ...streamAccount,
    });
  }

  static compareFnCreatedAt(a: Stream, b: Stream): number {
    if (a.createdAt.lt(b.createdAt)) {
      return -1;
    } else if (a.createdAt.gt(b.createdAt)) {
      return 1;
    }
    return 0;
  }

  static compareFnCreatedAtDesc(a: Stream, b: Stream) {
    return -Stream.compareFnCreatedAt(a, b);
  }

  readonly getCurrentTime = async (): Promise<BN> => {
    return this.clientInternal.getCurrentTime();
  };

  readonly getStreamPublicKey = async (): Promise<[web3.PublicKey, number]> => {
    return await this.clientInternal.getStreamPublicKey(this.seed, this.mint, this.name);
  };

  readonly getOrCreateAssociatedTokenAccount = async (owner: web3.PublicKey): Promise<web3.PublicKey> => {
    return await getOrCreateAssociatedTokenAccount(this.clientInternal.provider, this.mint, owner);
  };

  readonly getOrCreateSignerAssociatedTokenAccount = async (): Promise<web3.PublicKey> => {
    return await getOrCreateAssociatedTokenAccount(
      this.clientInternal.provider,
      this.mint,
      this.clientInternal.getWalletPublicKey(),
    );
  };

  readonly getOrCreateSenderAssociatedTokenAccount = async (): Promise<web3.PublicKey> => {
    return await getOrCreateAssociatedTokenAccount(this.clientInternal.provider, this.mint, this.sender);
  };

  readonly getOrCreateRecipientAssociatedTokenAccount = async (): Promise<web3.PublicKey> => {
    return await getOrCreateAssociatedTokenAccount(this.clientInternal.provider, this.mint, this.recipient);
  };

  readonly mustGetAssociatedTokenAccount = async (owner: web3.PublicKey): Promise<web3.PublicKey> => {
    return await mustGetAssociatedTokenAccount(this.clientInternal.provider, this.mint, owner);
  };

  readonly mustGetSenderAssociatedTokenAccount = async (): Promise<web3.PublicKey> => {
    return await this.mustGetAssociatedTokenAccount(this.sender);
  };

  readonly mustGetRecipientAssociatedTokenAccount = async (): Promise<web3.PublicKey> => {
    return await this.mustGetAssociatedTokenAccount(this.recipient);
  };

  readonly refresh = async (): Promise<Stream> => {
    return await this.clientInternal.getStream(this.publicKey);
  };

  readonly isCancelled = (): boolean => {
    return this.cancelledAt.gt(BN_ZERO);
  };

  readonly isSender = (): boolean => {
    return this.clientInternal.getWalletPublicKey().equals(this.sender);
  };

  readonly isRecipient = (): boolean => {
    return this.clientInternal.getWalletPublicKey().equals(this.recipient);
  };

  readonly hasFlowPayments = (): boolean => {
    return (this.endsAt.lte(BN_ZERO) || this.endsAt.gt(this.startsAt)) && this.flowRate.gt(BN_ZERO);
  };

  readonly getStopsAt = (): BN => {
    const cancelledAt = this.cancelledAt;
    const endsAt = this.endsAt;
    if (cancelledAt.lte(BN_ZERO)) {
      return endsAt;
    } else if (endsAt.lte(BN_ZERO)) {
      return cancelledAt;
    } else if (endsAt.lt(cancelledAt)) {
      return endsAt;
    } else {
      return cancelledAt;
    }
  };

  readonly hasStopped = (at: BN): boolean => {
    const stopsAt = this.getStopsAt();
    return stopsAt.gt(BN_ZERO) && stopsAt.lte(at);
  };

  readonly getAmountOwed = (at: BN): BN => {
    const stopsAt = this.getStopsAt();
    if (stopsAt.gt(BN_ZERO) && stopsAt.lt(at)) {
      at = stopsAt;
    }

    if (at.lt(this.startsAt)) {
      return BN_ZERO;
    } else if (!this.hasFlowPayments()) {
      return this.initialAmount;
    } else {
      const activeTime = this.paused
        ? this.accumulatedActiveTime
        : this.lastResumedAt.eq(BN_ZERO)
        ? at.sub(this.startsAt)
        : at.sub(this.lastResumedAt).add(this.accumulatedActiveTime);
      return this.initialAmount.add(this.flowRate.mul(activeTime).div(this.flowInterval));
    }
  };

  readonly isSolvent = (at: BN): boolean => {
    return this.getAmountOwed(at).lte(this.totalTopupAmount);
  };

  readonly validateCancel = (at: BN) => {
    if (this.isCancelled()) {
      throw new Error("The stream has already been cancelled");
    } else if (this.isSolvent(at)) {
      const isSender = this.isSender();
      const isRecipient = this.isRecipient();
      if (!isSender && !isRecipient) {
        throw new Error("A solvent stream can only be cancelled by the sender or the recipient");
      } else if (isSender) {
        if (!this.senderCanCancel) {
          throw new Error("The sender is not allowed to cancel the stream");
        } else if (this.senderCanCancelAt.gt(at)) {
          throw new Error(
            `The sender can only cancel the stream in ${formatDistanceToNow(Number(this.senderCanCancelAt) * 1000)}`,
          );
        }
      }
    }

    if (this.hasStopped(at)) {
      throw new Error("Stream has already stopped. Cannot change sender of a stopped stream");
    }
  };

  readonly cancel = async (at: BN) => {
    this.validateCancel(at);
    await this.clientInternal.cancelStream(this);
  };

  readonly validateWithdrawExcessTopupNonPrepaidEnded = (at: BN) => {
    if (this.isCancelled()) {
      throw new Error("The stream has already been cancelled");
    } else if (!this.isSolvent(at)) {
      throw new Error("The stream is insolvent");
    } else {
      const amountOwed = this.getAmountOwed(at);
      const amount = this.totalTopupAmount.add(this.depositNeeded).sub(amountOwed);
      if (amount.lte(BN_ZERO)) {
        throw new Error("Nothing to withdraw");
      }
    }

    if (!this.hasStopped(at)) {
      throw new Error("Stream has not stopped. Can withdraw excess topup only after the stream has ended");
    }
  };

  readonly withdrawExcessTopupNonPrepaidEnded = async (at: BN) => {
    this.validateWithdrawExcessTopupNonPrepaidEnded(at);
    await this.clientInternal.withdrawExcessTopupFromNonPrepaidEndedStream(this);
  };

  readonly validateTopupNonPrepaid = (at: BN, topupAmount?: BN) => {
    if (this.prepaid) {
      throw new Error("Cannot topup a prepaid stream");
    } else if (topupAmount != null && topupAmount.eq(BN_ZERO)) {
      throw new Error("Topup amount should be > 0");
    } else if (!this.hasFlowPayments()) {
      throw new Error("Stream has no flow payments");
    }

    if (this.hasStopped(at)) {
      throw new Error("Stream has already stopped. Cannot topup a stopped stream");
    }
  };

  readonly topupNonPrepaid = async (topupAmount: BN) => {
    this.validateTopupNonPrepaid(topupAmount);
    await this.clientInternal.topupNonPrepaidStream(this, topupAmount);
  };

  readonly validateChangeSenderNonPrepaid = (at: BN, newSender?: web3.PublicKey) => {
    if (this.prepaid) {
      throw new Error("Sender of prepaid streams cannot be changed");
    } else if (!this.isSender()) {
      throw new Error("Only the sender can change the sender");
    } else if (newSender != null) {
      if (newSender.equals(web3.PublicKey.default)) {
        throw new Error("Invalid new sender. New sender has to be a valid address");
      } else if (newSender.equals(this.sender)) {
        throw new Error("New sender cannot be the same as the current sender");
      }
    } else {
      if (!this.senderCanChangeSenderAt) {
        throw new Error("Sender is not allowed to change sender of the stream");
      } else if (this.senderCanChangeSenderAt.gt(at)) {
        throw new Error(
          `The sender can only change the sender of the stream in ${formatDistanceToNow(
            Number(this.senderCanCancelAt) * 1000,
          )}`,
        );
      }
    }

    if (this.hasStopped(at)) {
      throw new Error("Stream has already stopped. Cannot change sender of a stopped stream");
    }
  };

  readonly changeSenderNonPrepaid = async (at: BN, newSender: web3.PublicKey) => {
    this.validateChangeSenderNonPrepaid(at);
    await this.clientInternal.changeSenderNonPrepaidStream(this, newSender);
  };

  readonly validateWithdraw = (at: BN) => {
    if (this.getAmountOwed(at).lte(this.totalWithdrawnAmount)) {
      throw new Error("Amount owed has already been withdrawn. Nothing to withdraw");
    } else if (!this.isRecipient()) {
      throw new Error("Only the recipient can withdraw");
    }
  };

  readonly withdraw = async (at: BN) => {
    this.validateWithdraw(at);
    await this.clientInternal.withdrawFromStream(this);
  };

  readonly validateWithdrawAndChangeRecipient = (at: BN, newRecipient?: web3.PublicKey) => {
    this.validateWithdraw(at);
    if (newRecipient != null) {
      if (newRecipient.equals(web3.PublicKey.default)) {
        throw new Error("Invalid new recipient. New recipient has to be a valid address");
      } else if (newRecipient.equals(this.recipient)) {
        throw new Error("New recipient cannot be the same as the current recipient");
      }
    }
  };

  readonly withdrawAndChangeRecipient = async (at: BN, newRecipient: web3.PublicKey) => {
    this.validateWithdrawAndChangeRecipient(at);
    await this.clientInternal.withdrawFromStreamAndChangeRecipient(this, newRecipient);
  };

  readonly validatePauseNonPrepaid = (at: BN) => {
    if (this.prepaid) {
      throw new Error("Prepaid streams cannot be paused");
    } else if (this.paused) {
      throw new Error("Stream is already paused");
    } else if (!this.hasFlowPayments()) {
      throw new Error("Stream with no flow payments cannot be paused");
    }

    const isSender = this.isSender();
    const isRecipient = this.isRecipient();
    if (!isSender && !isRecipient) {
      throw new Error("Only the sender and the recipient can pause a stream");
    } else if (isSender) {
      if (!this.senderCanPause) {
        throw new Error("Sender is not allowed to pause the stream");
      } else if (this.senderCanPauseAt.gt(at)) {
        throw new Error(
          `The sender can only pause the stream in ${formatDistanceToNow(Number(this.senderCanCancelAt) * 1000)}`,
        );
      }
    }

    if (this.hasStopped(at)) {
      throw new Error("Stream has already stopped. Cannot pause a stopped stream");
    }
  };

  readonly pauseNonPrepaid = async (at: BN) => {
    this.validatePauseNonPrepaid(at);
    await this.clientInternal.pauseNonPrepaidStream(this);
  };

  readonly validateResumeNonPrepaid = (at: BN) => {
    if (this.prepaid) {
      throw new Error("Prepaid streams cannot be paused");
    } else if (!this.paused) {
      throw new Error("Only a paused stream can be resumed");
    }

    const isSender = this.isSender();
    const isRecipient = this.isRecipient();
    if (!isSender && !isRecipient) {
      throw new Error("Only the sender and the recipient can pause a stream");
    } else if (isRecipient && this.pausedBySender) {
      if (!this.recipientCanResumePauseBySender) {
        throw new Error("Recipient is not allowed to resume a stream paused by the sender");
      } else if (this.recipientCanResumePauseBySenderAt.gt(at)) {
        throw new Error(
          `The recipient can only resume the stream in ${formatDistanceToNow(Number(this.senderCanCancelAt) * 1000)}`,
        );
      }
    }

    if (this.hasStopped(at)) {
      throw new Error("Stream has already stopped. Cannot resume a stopped stream");
    }
  };

  readonly resumeNonPrepaid = async (at: BN) => {
    this.validateResumeNonPrepaid(at);
    await this.clientInternal.resumeNonPrepaidStream(this);
  };
}
