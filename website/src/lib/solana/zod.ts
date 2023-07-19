import { web3, type BN } from '@coral-xyz/anchor'
import type { TokenInfo } from '@solana/spl-token-registry'
import type { z } from 'zod'

import { parseTokenAmount } from '@/lib/solana/tokens'

export function zTokenAmount<T extends string | null | undefined>(
  schema: z.ZodType<T>,
  name: string,
  tokenInfo?: TokenInfo,
  refineFn?: (bn: BN) => boolean,
  refineError?: string,
) {
  return schema
    .refine(
      (s) => {
        if (!s) {
          return true
        }

        const parsedTopupAmount = parseTokenAmount(s, tokenInfo)
        return parsedTopupAmount != null
      },
      tokenInfo && tokenInfo.decimals > 0
        ? `${name} should be a decimal and have max ${tokenInfo.decimals} decimal places`
        : `${name} should be a positive number without any decimal places`,
    )
    .refine(
      (s) => {
        try {
          return !refineFn || !s || refineFn(parseTokenAmount(s, tokenInfo)!)
        } catch {
          return false
        }
      },
      refineError || `${name} is invalid`,
    )
}

export function zPublicKey<T extends string | null | undefined>(
  schema: z.ZodType<T>,
  name: string,
  refineFn?: (publicKey: web3.PublicKey) => boolean,
  refineError?: string,
) {
  return schema
    .refine((s) => {
      if (!s) {
        return true
      }

      try {
        const publicKey = new web3.PublicKey(s)
        return !publicKey.equals(web3.PublicKey.default)
      } catch (e) {
        console.error(`${name} is an invalid public key '${s}'`, e)
        return false
      }
    }, `${name} should be a valid address`)
    .refine(
      (s) => {
        try {
          return !refineFn || !s || refineFn(new web3.PublicKey(s))
        } catch {
          return false
        }
      },
      refineError || `${name} is invalid`,
    )
}
