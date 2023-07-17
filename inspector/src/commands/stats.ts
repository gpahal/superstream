import chalk from 'chalk'

import Command from '@/command'
import { GlobalCommonOptions } from '@/option'

export type StatsResponse = {
  totalCount: number
  totalPrepaidCount: number

  activeCount: number
  activePrepaidCount: number
  activeInsolventCount: number
}

export default class StatsCommand extends Command<GlobalCommonOptions> {
  async run(): Promise<void> {
    this.logger.info('Fetching stats...')
    const stats = await this.fetchStats()
    this.logger.info('')
    this.logger.info(chalk.bold('TOTAL'))
    this.logger.info(`${'Count:'.padEnd(20, ' ')}${stats.totalCount}`)
    this.logger.info(`${'Prepaid count:'.padEnd(20, ' ')}${stats.totalPrepaidCount}`)
    this.logger.info('')
    this.logger.info(chalk.bold('ACTIVE'))
    this.logger.info(`${'Count:'.padEnd(20, ' ')}${stats.activeCount}`)
    this.logger.info(`${'Prepaid count:'.padEnd(20, ' ')}${stats.activePrepaidCount}`)
    this.logger.info(`${'Insolvent count:'.padEnd(20, ' ')}${stats.activeInsolventCount}`)
  }

  private async fetchStats(): Promise<StatsResponse> {
    const streams = await this.client.getAllStreams()
    const totalCount = streams.length
    const totalPrepaidCount = streams.filter((s) => s.isPrepaid).length

    const at = await this.client.mustGetCurrentTime()
    const activeStreams = streams.filter((s) => !s.hasStopped(at))
    const activeCount = activeStreams.length
    const activePrepaidCount = streams.filter((s) => s.isPrepaid).length
    const activeInsolventCount = streams.filter((s) => !s.isSolvent(at)).length

    return { totalCount, totalPrepaidCount, activeCount, activePrepaidCount, activeInsolventCount }
  }
}
