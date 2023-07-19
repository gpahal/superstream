import { BN, type web3 } from '@coral-xyz/anchor'

/**
 * Get the current Solana on-chain time in seconds. If there is an issue fetching the time, an error is thrown.
 *
 * @param connection The Solana connection
 *
 * @returns The current Solana on-chain time in seconds
 *
 * @throws An error is thrown if there is an issue fetching the time
 */
export async function getCurrentTimeInSecsBN(connection: web3.Connection): Promise<BN> {
  const slot = await connection.getSlot('recent')
  const time = await connection.getBlockTime(slot)
  if (time) {
    return new BN(time)
  } else {
    throw new Error(`Invalid time returned by Solana node: ${time}`)
  }
}

/**
 * Get the current Solana on-chain time in seconds. If there is an issue fetching the time, undefined is returned.
 *
 * @param connection The Solana connection
 *
 * @returns The current Solana on-chain time in seconds or undefined if there was an issue
 */
export async function getCurrentTimeInSecsBNOrUndefined(connection: web3.Connection): Promise<BN | undefined> {
  try {
    return getCurrentTimeInSecsBN(connection)
  } catch (e) {
    console.error(`Error getting the current on-chain time`, e)
    return undefined
  }
}
