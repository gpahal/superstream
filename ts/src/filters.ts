import { Buffer } from "buffer";

import { web3 } from "@project-serum/anchor";
import { GetProgramAccountsFilter } from "@solana/web3.js";
import bs58 from "bs58";

export type StreamFilters = {
  prepaid?: boolean;
  paused?: boolean;
  pausedBySender?: boolean;
  cancelled?: boolean;
  mint?: web3.PublicKey;
  sender?: web3.PublicKey;
  recipient?: web3.PublicKey;
  name?: string;
};

export function streamFiltersToAnchorFilters(filters?: StreamFilters): GetProgramAccountsFilter[] {
  const anchorFilters: GetProgramAccountsFilter[] = [];
  if (!filters) {
    return anchorFilters;
  }

  if (filters.prepaid != null) {
    anchorFilters.push({
      memcmp: {
        offset: 8,
        bytes: bs58.encode([filters.prepaid ? 1 : 0]),
      },
    });
  }
  if (filters.paused != null) {
    anchorFilters.push({
      memcmp: {
        offset: 8 + 1,
        bytes: bs58.encode([filters.paused ? 1 : 0]),
      },
    });
  }
  if (filters.pausedBySender != null) {
    anchorFilters.push({
      memcmp: {
        offset: 8 + 1 + 1,
        bytes: bs58.encode([filters.pausedBySender ? 1 : 0]),
      },
    });
  }
  if (filters.cancelled != null) {
    anchorFilters.push({
      memcmp: {
        offset: 8 + 1 + 1 + 1,
        bytes: bs58.encode([filters.cancelled ? 1 : 0]),
      },
    });
  }
  if (filters.mint) {
    anchorFilters.push({
      memcmp: {
        offset: 8 + 1 + 1 + 1 + 1,
        bytes: filters.mint.toString(),
      },
    });
  }
  if (filters.sender) {
    anchorFilters.push({
      memcmp: {
        offset: 8 + 1 + 1 + 1 + 1 + 32,
        bytes: filters.sender.toString(),
      },
    });
  }
  if (filters.recipient) {
    anchorFilters.push({
      memcmp: {
        offset: 8 + 1 + 1 + 1 + 1 + 32 + 32,
        bytes: filters.recipient.toString(),
      },
    });
  }
  if (filters.name) {
    anchorFilters.push({
      memcmp: {
        offset: 8 + 1 + 1 + 1 + 1 + 32 + 32 + 32 + 4,
        bytes: bs58.encode(Buffer.from(filters.name)),
      },
    });
  }
  return anchorFilters;
}
