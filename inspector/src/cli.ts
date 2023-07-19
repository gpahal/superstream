import { Command, OptionValues } from 'commander'

import { Logger } from '@gpahal/logger'

import { getError, getErrorExitCode } from '@/lib/error'
import { runCommand } from '@/command'
import RunCommand from '@/commands/run'
import StatsCommand from '@/commands/stats'
import {
  addGlobalCommonOptions,
  addGlobalOptionsWithWallet,
  GlobalOptions,
  parseGlobalCommonOptions,
  parseGlobalOptionsWithWallet,
} from '@/option'

const DEFAULT_LOGGER = new Logger()

const program = new Command()

program
  .name('inspector')
  .description('Monitor and update on-chain streams powered by Superstream')
  .configureOutput({
    writeOut(str: string) {
      DEFAULT_LOGGER.info(str)
    },
    writeErr(str: string) {
      DEFAULT_LOGGER.error(str)
    },
  })
  .showHelpAfterError('(add --help for additional information)')
  .showSuggestionAfterError(true)

function parseOptions<T extends GlobalOptions>(parseFn: (options: OptionValues) => T, optionValues: OptionValues): T {
  try {
    return parseFn(optionValues)
  } catch (e) {
    const error = getError(e)
    DEFAULT_LOGGER.error(error.message)
    process.exit(getErrorExitCode(error))
  }
}

addGlobalOptionsWithWallet(
  program
    .command('run')
    .description('Run inspector process')
    .action(async (optionValues: OptionValues) => {
      const options = parseOptions(parseGlobalOptionsWithWallet, optionValues)
      const command = new RunCommand(options)
      await runCommand(command)
    }),
)

addGlobalCommonOptions(
  program
    .command('stats')
    .description('Get stream stats')
    .action(async (optionValues: OptionValues) => {
      const options = parseOptions(parseGlobalCommonOptions, optionValues)
      const command = new StatsCommand(options)
      await runCommand(command)
    }),
)

async function main(): Promise<void> {
  try {
    await program.parseAsync()
  } catch (e) {
    const error = getError(e)
    DEFAULT_LOGGER.error(error.message)
    process.exit(getErrorExitCode(error))
  }
}

void main()
