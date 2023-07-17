import { web3 } from '@coral-xyz/anchor'
import { getErrorMessage } from '@gpahal/std/error'
import { Command, Option, OptionValues } from 'commander'

import { Cluster, DEFAULT_CLUSTER, parseCluster } from '@/lib/cluster'
import { readKeypair } from '@/lib/keypair'

export type GlobalOptions = GlobalCommonOptions | GlobalOptionsWithWallet

export type GlobalCommonOptions = {
  cluster: Cluster
  showOutputAsJSON: boolean
  enableDebugOutput: boolean
}

export type GlobalOptionsWithWallet = GlobalCommonOptions & {
  keyPair: web3.Keypair
}

export function isGlobalOptionsWithWallet(optionValues: GlobalOptions): optionValues is GlobalOptionsWithWallet {
  return 'keyPair' in optionValues && !!optionValues.keyPair
}

export function addGlobalCommonOptions(command: Command): Command {
  return command
    .addOption(
      new Option('-c, --cluster <cluster>', 'solana cluster')
        .choices([Cluster.MAINNET_BETA, Cluster.DEVNET, Cluster.TESTNET, Cluster.LOCALNET])
        .default(DEFAULT_CLUSTER),
    )
    .addOption(new Option('-j, --json', 'show output as JSON'))
    .addOption(new Option('-d, --debug', 'enable debug output'))
}

export function addGlobalOptionsWithWallet(command: Command): Command {
  return addGlobalCommonOptions(command).addOption(
    new Option('-w, --wallet <wallet-keypair-json-path>', 'solana wallet keypair JSON file path'),
  )
}

export function parseGlobalCommonOptions(optionValues: OptionValues): GlobalCommonOptions {
  const cluster = parseCluster(optionValues.cluster)
  const showOutputAsJSON = !!optionValues.json
  const enableDebugOutput = !!optionValues.debug
  return {
    cluster,
    showOutputAsJSON,
    enableDebugOutput,
  }
}

export function parseGlobalOptionsWithWallet(optionValues: OptionValues): GlobalOptionsWithWallet {
  const commonOptions = parseGlobalCommonOptions(optionValues)
  const walletFilePath = optionValues.wallet as string | undefined
  if (!walletFilePath) {
    throw new Error(`solana wallet keypair JSON file path is required`)
  }

  try {
    const keyPair = readKeypair(walletFilePath)
    return {
      ...commonOptions,
      keyPair,
    }
  } catch (e) {
    throw new Error(`unable to read Solana wallet keypair JSON file: ${getErrorMessage(e)}`)
  }
}
