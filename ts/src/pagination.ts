import { web3 } from "@project-serum/anchor";

import { StreamingClientInternal } from "./client-internal";
import { StreamFilters } from "./filters";
import { Stream } from "./stream";

export class StreamPagination {
  private readonly clientInternal: StreamingClientInternal;
  readonly pageSize: number;
  readonly filters?: StreamFilters;

  private initialized = false;
  private publicKeys: web3.PublicKey[] = [];

  constructor(clientInternal: StreamingClientInternal, pageSize: number, filters?: StreamFilters) {
    if (pageSize < 1) {
      throw new Error("Page size cannot non-positive (< 1)");
    }

    this.clientInternal = clientInternal;
    this.pageSize = Math.floor(pageSize);
    this.filters = filters;
  }

  readonly initialize = async () => {
    if (!this.initialized) {
      this.initialized = true;
      await this.refresh();
    }
  };

  readonly refresh = async () => {
    this.publicKeys = await this.clientInternal.getAllStreamsPublicKeys(this.filters);
  };

  private readonly validateInitialized = () => {
    if (!this.initialized) {
      throw new Error(
        "Stream pagination is not initialized yet. Please do so by calling `await pagination.initialize();`",
      );
    }
  };

  readonly totalItems = (): number => {
    this.validateInitialized();
    return this.publicKeys.length;
  };

  readonly totalPages = (): number => {
    this.validateInitialized();
    return Math.ceil(this.totalItems() / this.pageSize);
  };

  readonly getItems = async ({ offset, limit }: { offset: number; limit: number }): Promise<(Stream | null)[]> => {
    this.validateInitialized();

    offset = Math.floor(offset);
    if (offset < 0) {
      throw new Error("Offset cannot be negative");
    }
    limit = Math.floor(limit);
    if (limit <= 0) {
      throw new Error("Limit cannot be non-positive (< 1)");
    }

    const publicKeys = this.publicKeys.slice(offset, offset + limit);
    return await this.clientInternal.getMultipleStreams(publicKeys);
  };

  readonly getPage = async (pageNumber: number): Promise<(Stream | null)[]> => {
    if (pageNumber < 1) {
      throw new Error("Page number cannot be non-positive (< 1)");
    }
    return await this.getItems({ offset: (pageNumber - 1) * this.pageSize, limit: this.pageSize });
  };
}
