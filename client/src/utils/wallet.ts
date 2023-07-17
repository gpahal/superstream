import { web3 } from '@coral-xyz/anchor'

/**
 * A Solana wallet with a public key and methods to sign transaction.
 */
export type Wallet = {
  /**
   * Wallet public key.
   */
  publicKey: web3.PublicKey

  /**
   * Sign a transaction using the wallet private key.
   *
   * @param transaction The transaction to sign
   *
   * @returns The signed transaction
   */
  signTransaction: <T extends web3.Transaction | web3.VersionedTransaction>(transaction: T) => Promise<T>
  /**
   * Sign all transactions using the wallet private key.
   *
   * @param transactions The transactions to sign
   *
   * @returns The signed transactions
   */
  signAllTransactions: <T extends web3.Transaction | web3.VersionedTransaction>(transactions: T[]) => Promise<T[]>
}

/**
 * A no-op Solana wallet used when no on-chain transactions need to signed.
 */
export const NO_OP_WALLET: Wallet = {
  publicKey: web3.PublicKey.default,
  signTransaction: (transaction) => Promise.resolve(transaction),
  signAllTransactions: (transactions) => Promise.resolve(transactions),
}
