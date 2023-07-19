import type { web3 } from '@coral-xyz/anchor'
import bs58 from 'bs58'

// prettier-ignore
// eslint-disable-next-line unicorn/prefer-node-protocol
import { Buffer } from "buffer";

/**
 * Stream filters that can be used to filter streams when fetching all streams.
 */
export type StreamFilters = {
  /**
   * Filter by stream type - prepaid or unbounded.
   */
  isPrepaid?: boolean
  /**
   * Filter by the stream mint.
   */
  mint?: web3.PublicKey
  /**
   * Filter by the stream sender.
   */
  sender?: web3.PublicKey
  /**
   * Filter by the stream recipient.
   */
  recipient?: web3.PublicKey
  /**
   * Filter by the stream cancellation status.
   */
  isCancelled?: boolean
  /**
   * Filter by the stream cancellation before start status.
   */
  isCancelledBeforeStart?: boolean
  /**
   * Filter by the stream cancellation by sender status.
   */
  isCancelledBySender?: boolean
  /**
   * Filter by the stream paused status.
   */
  isPaused?: boolean
  /**
   * Filter by the stream paused by sender status.
   */
  isPausedBySender?: boolean
  /**
   * Filter by the stream name.
   */
  name?: string
}

/**
 * Convert StreamFilters to Anchor filters.
 *
 * @param filters The StreamFilters
 *
 * @returns The Anchor filters
 */
export function streamFiltersToAnchorFilters(filters?: StreamFilters): web3.GetProgramAccountsFilter[] {
  const anchorFilters: web3.GetProgramAccountsFilter[] = []
  if (!filters) {
    return anchorFilters
  }

  if (filters.isPrepaid != null) {
    anchorFilters.push({
      memcmp: {
        offset: 8,
        bytes: bs58.encode([filters.isPrepaid ? 1 : 0]),
      },
    })
  }
  if (filters.mint) {
    anchorFilters.push({
      memcmp: {
        offset: 9,
        bytes: filters.mint.toString(),
      },
    })
  }
  if (filters.sender) {
    anchorFilters.push({
      memcmp: {
        offset: 41,
        bytes: filters.sender.toString(),
      },
    })
  }
  if (filters.recipient) {
    anchorFilters.push({
      memcmp: {
        offset: 73,
        bytes: filters.recipient.toString(),
      },
    })
  }
  if (filters.isCancelled != null) {
    anchorFilters.push({
      memcmp: {
        offset: 153,
        bytes: bs58.encode([filters.isCancelled ? 1 : 0]),
      },
    })
  }
  if (filters.isCancelledBeforeStart != null) {
    anchorFilters.push({
      memcmp: {
        offset: 154,
        bytes: bs58.encode([filters.isCancelledBeforeStart ? 1 : 0]),
      },
    })
  }
  if (filters.isCancelledBySender != null) {
    anchorFilters.push({
      memcmp: {
        offset: 155,
        bytes: bs58.encode([filters.isCancelledBySender ? 1 : 0]),
      },
    })
  }
  if (filters.isPaused != null) {
    anchorFilters.push({
      memcmp: {
        offset: 182,
        bytes: bs58.encode([filters.isPaused ? 1 : 0]),
      },
    })
  }
  if (filters.isPausedBySender != null) {
    anchorFilters.push({
      memcmp: {
        offset: 183,
        bytes: bs58.encode([filters.isPausedBySender ? 1 : 0]),
      },
    })
  }
  if (filters.name) {
    anchorFilters.push({
      memcmp: {
        offset: 424,
        bytes: bs58.encode(Buffer.from(filters.name)),
      },
    })
  }
  return anchorFilters
}
