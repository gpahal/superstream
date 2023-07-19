import { BN } from '@coral-xyz/anchor'
import { Stream, StreamPagination } from '@superstream/client'

import { getErrorMessage } from '@gpahal/std/error'

import { sleep } from '@/lib/time'
import Command from '@/command'
import { GlobalOptionsWithWallet } from '@/option'

const PAGE_SIZE = 25

export default class RunCommand extends Command<GlobalOptionsWithWallet> {
  async run(): Promise<void> {
    this.verboseLogger.info('Starting inspector...')
    for (let iteration = 1; ; iteration++) {
      await this.checkForInsolventStreamsWithRetry(iteration)
      await sleep(2500)
    }
  }

  private async checkForInsolventStreamsWithRetry(iteration?: number): Promise<void> {
    for (let tryNo = 1; ; tryNo++) {
      try {
        return await this.checkForInsolventStreams(iteration)
      } catch (e) {
        this.verboseLogger.error(`Error processing streams [try=${tryNo}]: ${getErrorMessage(e)}`)
        this.verboseLogger.error('Retrying in sometime...')
        await sleep(10000)
        this.verboseLogger.error('Retrying...')
      }
    }
  }

  private async checkForInsolventStreams(iteration?: number): Promise<void> {
    this.verboseLogger.info(
      `Checking for insolvent streams${iteration != null && iteration > 0 ? ` [iteration=${iteration}]` : ''}...`,
    )

    const pagination = this.client.getAllStreamsPagination({ isPrepaid: false })
    await pagination.initialize()

    for (let i = 1; ; i++) {
      if (await this.checkPageForInsolventStreamsWithRetry(pagination, i)) {
        break
      }
    }

    this.verboseLogger.info('Done checking for insolvent streams')
  }

  async checkPageForInsolventStreamsWithRetry(pagination: StreamPagination, pageNo: number): Promise<boolean> {
    for (let tryNo = 1; ; tryNo++) {
      try {
        return await this.checkPageForInsolventStreams(pagination, pageNo)
      } catch (e) {
        this.verboseLogger.error(`Error processing page [page=${pageNo}, try=${tryNo}]: ${getErrorMessage(e)}`)
        this.verboseLogger.error('Retrying in sometime...')
        await sleep(10000)
        this.verboseLogger.error('Retrying...')
      }
    }
  }

  async checkPageForInsolventStreams(pagination: StreamPagination, pageNo: number): Promise<boolean> {
    const streams = await pagination.getStreams({
      offset: pageNo <= 0 ? 0 : (pageNo - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    })
    if (streams.length === 0) {
      return true
    }

    const at = await this.client.mustGetCurrentTime()
    await Promise.all(streams.map((stream) => this.checkStreamForInsolvency(stream, at)))
    return false
  }

  async checkStreamForInsolvency(stream: Stream | null | undefined, at: BN): Promise<void> {
    if (!stream) {
      return
    }

    if (!stream.hasStopped(at) && !stream.isSolvent(at)) {
      this.verboseLogger.info(`Found insolvent stream [publicKey=${stream.publicKey.toBase58()}]`)
      try {
        await stream.cancel(at)
        this.verboseLogger.info(`Cancelled insolvent stream [publicKey=${stream.publicKey.toBase58()}]`)
      } catch (e) {
        this.verboseLogger.error(
          `Unable to cancel insolvent stream [publicKey=${stream.publicKey.toBase58()}]: ${getErrorMessage(e)}`,
        )
      }
    }
  }
}
