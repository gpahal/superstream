import type { web3 } from '@coral-xyz/anchor'

import type { SuperstreamClientInternal } from '@/client-internal'
import type { StreamFilters } from '@/filters'
import type { Stream } from '@/stream'

/**
 * Stream pagination options used {@link StreamPagination.getStreams | StreamPagination.getStreams}.
 */
export type StreamPaginationOptions = {
  /**
   * Number of streams to skip. Should be >= 0.
   */
  offset: number
  /**
   * Number of streams to return. Should be > 0.
   */
  limit: number
}

/**
 * StreamPagination object is used to fetch all streams that satisfy the given filters.
 *
 * **NOTE:** You need to call {@link StreamPagination.initialize | StreamPagination.initialize} before doing any other
 * operations.
 */
export class StreamPagination {
  /** @ignore
   * Reference to the internal Superstream client.
   */
  private readonly clientInternal: SuperstreamClientInternal
  /**
   * The stream filters. Only streams that satisfy the given filters are returned.
   */
  readonly filters?: StreamFilters

  private initialized = false
  private publicKeys: web3.PublicKey[] = []

  /** @ignore
   * Create a new StreamPagination object.
   */
  constructor(clientInternal: SuperstreamClientInternal, filters?: StreamFilters) {
    this.clientInternal = clientInternal
    this.filters = filters
  }

  /**
   * Initialize a StreamPagination object.
   */
  readonly initialize = async () => {
    if (!this.initialized) {
      this.initialized = true
      await this.refresh()
    }
  }

  /**
   * Refresh all the streams and the StreamPagination object.
   */
  readonly refresh = async () => {
    this.publicKeys = await this.clientInternal.getAllStreamsPublicKeys(this.filters)
  }

  /** @ignore
   * Validate if the stream has been initialized.
   *
   * @throws An error is thrown is the StreamPagination object is not initialized
   */
  private readonly validateInitialized = () => {
    if (!this.initialized) {
      throw new Error(
        'Stream pagination is not initialized yet. Please do so by calling `await pagination.initialize();`',
      )
    }
  }

  /**
   * Get the total number of streams.
   *
   * @returns The total number of streams.
   *
   * @throws An error is thrown is the StreamPagination object is not initialized
   */
  readonly totalStreams = (): number => {
    this.validateInitialized()
    return this.publicKeys.length
  }

  /**
   * Get the streams.
   *
   * @param options The stream pagination options. Look at {@link StreamPaginationOptions} for more details
   *
   * @returns The streams
   *
   * @throws An error is thrown is the StreamPagination object is not initialized or options value is invalid.
   */
  readonly getStreams = async (options: StreamPaginationOptions): Promise<(Stream | undefined)[]> => {
    this.validateInitialized()

    let { offset, limit } = options
    offset = Math.floor(offset)
    if (offset < 0) {
      throw new Error('Offset cannot be negative')
    }
    limit = Math.floor(limit)
    if (limit <= 0) {
      throw new Error('Limit cannot be non-positive (< 1)')
    }

    const publicKeys = this.publicKeys.slice(offset, offset + limit)
    return await this.clientInternal.getMultipleStreams(publicKeys)
  }
}
