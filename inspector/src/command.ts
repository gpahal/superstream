import { Wallet as NodeWallet } from '@coral-xyz/anchor'
import { Logger } from '@gpahal/logger'
import { createSuperstreamClient, SuperstreamClient } from '@superstream/client'

import { clusterToWeb3Cluster } from '@/lib/cluster'
import { ExitError, getError, getErrorExitCode } from '@/lib/error'
import { GlobalOptions, isGlobalOptionsWithWallet } from '@/option'

export default abstract class Command<T extends GlobalOptions> {
  protected options: T
  protected logger: Logger
  protected verboseLogger: Logger

  protected client: SuperstreamClient

  constructor(options: T) {
    this.options = options
    this.logger = this.createLogger(false)
    this.verboseLogger = this.createLogger(true)
    if (isGlobalOptionsWithWallet(options)) {
      this.client = createSuperstreamClient(clusterToWeb3Cluster(options.cluster), new NodeWallet(options.keyPair))
    } else {
      this.client = createSuperstreamClient(clusterToWeb3Cluster(options.cluster))
    }
  }

  protected createLogger(isVerbose?: boolean): Logger {
    return new Logger({
      level: this.options.enableDebugOutput ? 'debug' : 'info',
      showOutputAsJSON: this.options.showOutputAsJSON,
      isVerbose,
    })
  }

  getLogger(): Logger {
    return this.logger
  }

  getAllLoggers(): Logger[] {
    return [this.logger, this.verboseLogger]
  }

  endLoggers(): void {
    this.getAllLoggers().map((logger) => logger.end())
  }

  abstract run(): Promise<void>

  exit(message?: string, exitCode?: number): never {
    throw new ExitError(message, exitCode)
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  async catch(error: Error): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  async finally(error?: Error, exitCode?: number): Promise<void> {}
}

export async function runCommand<T extends GlobalOptions>(command: Command<T>): Promise<void> {
  let error: Error | undefined = undefined
  try {
    await command.run()
  } catch (e) {
    error = getError(e)
    command.getLogger().error(error.message)
    await command.catch(error)
  } finally {
    command.endLoggers()
    const exitCode = getErrorExitCode(error)
    await command.finally(error, exitCode)
    process.exit(exitCode)
  }
}
