import { AnchorProvider, BN, web3 } from "@project-serum/anchor";

import { StreamingClientInternal } from "./client-internal";
import { StreamFilters } from "./filters";
import { StreamPagination } from "./pagination";
import { Stream } from "./stream";
import { Wallet } from "./wallet";

export class StreamingClient {
  private readonly clientInternal: StreamingClientInternal;

  constructor(cluster: web3.Cluster | URL, wallet: Wallet) {
    this.clientInternal = new StreamingClientInternal(cluster, wallet);
  }

  readonly getProvider = (): AnchorProvider => this.clientInternal.getProvider();

  readonly getConnection = (): web3.Connection => this.clientInternal.getConnection();

  readonly getWalletPublicKey = (): web3.PublicKey => this.clientInternal.getWalletPublicKey();

  readonly getCurrentTime = (): Promise<BN> => this.clientInternal.getCurrentTime();

  readonly getNullableStream = (publicKey: web3.PublicKey): Promise<Stream | null> =>
    this.clientInternal.getNullableStream(publicKey);

  readonly getStream = (publicKey: web3.PublicKey): Promise<Stream> => this.clientInternal.getStream(publicKey);

  readonly getMultipleStreams = (publicKeys: web3.PublicKey[]): Promise<(Stream | null)[]> =>
    this.clientInternal.getMultipleStreams(publicKeys);

  readonly getAllStreams = (filters?: StreamFilters): Promise<Stream[]> => this.clientInternal.getAllStreams(filters);

  readonly getAllStreamsPagination = (pageSize: number, filters?: StreamFilters): StreamPagination => {
    return this.clientInternal.getAllStreamsPagination(pageSize, filters);
  };

  readonly getPrepaidAmountNeeded = (
    at: BN,
    params: {
      startsAt: BN;
      endsAt: BN;
      initialAmount: BN;
      flowInterval: BN;
      flowRate: BN;
    },
  ): BN => {
    return this.clientInternal.getPrepaidAmountNeeded(at, params);
  };

  readonly getNonPrepaidDepositNeeded = (
    at: BN,
    params: { startsAt: BN; endsAt: BN; flowInterval: BN; flowRate: BN },
  ): BN => {
    return this.clientInternal.getNonPrepaidDepositNeeded(at, params);
  };

  readonly validateCreatePrepaidStream = (
    at: BN,
    params: {
      recipient: web3.PublicKey;
      name: string;
      startsAt: BN;
      endsAt: BN;
      initialAmount: BN;
      flowRate: BN;
    },
  ) => {
    this.clientInternal.validateCreatePrepaidStream(at, params);
  };

  readonly validateCreateNonPrepaidStream = (
    at: BN,
    params: {
      recipient: web3.PublicKey;
      name: string;
      startsAt: BN;
      endsAt: BN;
      initialAmount: BN;
      flowInterval: BN;
      flowRate: BN;
      topupAmount: BN;
    },
  ) => {
    this.clientInternal.validateCreateNonPrepaidStream(at, params);
  };

  readonly createPrepaidStream = (params: {
    mint: web3.PublicKey;
    recipient: web3.PublicKey;
    name: string;
    startsAt: BN;
    endsAt: BN;
    initialAmount: BN;
    flowInterval: BN;
    flowRate: BN;
    senderCanCancel: boolean;
    senderCanCancelAt: BN;
    senderCanChangeSender: boolean;
    senderCanChangeSenderAt: BN;
    senderCanPause: boolean;
    senderCanPauseAt: BN;
    recipientCanResumePauseBySender: boolean;
    recipientCanResumePauseBySenderAt: BN;
  }): Promise<Stream> => this.clientInternal.createPrepaidStream(params);

  readonly createNonPrepaidStream = (params: {
    mint: web3.PublicKey;
    recipient: web3.PublicKey;
    name: string;
    startsAt: BN;
    endsAt: BN;
    initialAmount: BN;
    flowInterval: BN;
    flowRate: BN;
    senderCanCancel: boolean;
    senderCanCancelAt: BN;
    senderCanChangeSender: boolean;
    senderCanChangeSenderAt: BN;
    senderCanPause: boolean;
    senderCanPauseAt: BN;
    recipientCanResumePauseBySender: boolean;
    recipientCanResumePauseBySenderAt: BN;
    topupAmount: BN;
  }): Promise<Stream> => this.clientInternal.createNonPrepaidStream(params);
}
