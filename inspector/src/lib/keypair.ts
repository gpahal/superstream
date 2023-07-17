import fs from 'node:fs'
import path from 'node:path'

import { web3 } from '@coral-xyz/anchor'

export function readKeypair(filePath: string): web3.Keypair {
  const secretKey = readSecretKey(filePath)
  return web3.Keypair.fromSecretKey(secretKey)
}

function readSecretKey(filePath: string): Uint8Array {
  const secretKeyArray = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8')) as number[]
  return Uint8Array.from(secretKeyArray)
}
