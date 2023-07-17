import { getErrorMessage } from '@gpahal/std/error'
import ExtendableError from 'ts-error'

export class UnknownError extends ExtendableError {
  constructor(error?: unknown) {
    super(getErrorMessage(error))
  }
}

export class ExitError extends ExtendableError {
  readonly exitCode: number

  constructor(message?: string, exitCode?: number) {
    super(message)
    this.exitCode = exitCode || 1
  }
}

export function getError(error: unknown): Error {
  return error instanceof Error ? error : new UnknownError(error)
}

export function getErrorExitCode(error?: Error): number {
  return error instanceof ExitError ? error.exitCode : error != null ? 1 : 0
}
