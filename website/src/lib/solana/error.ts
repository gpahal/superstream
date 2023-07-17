import { AnchorError } from '@coral-xyz/anchor'
import { getErrorMessage } from '@gpahal/std/error'

export function getAnchorErrorMessage(error: unknown): string {
  if (error instanceof AnchorError) {
    return error.error.errorMessage
  } else {
    return getErrorMessage(error)
  }
}
