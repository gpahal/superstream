import { BN } from '@coral-xyz/anchor'

/**
 * Superstream on-chain program ID.
 */
export const SUPERSTREAM_PROGRAM_ID = '4WLNkJ6RKt54sv85iTgJPLgoaxfrxAasZWBxAPLUfuVG'
/**
 * PDA account seed to create new stream PDA accounts.
 */
export const STREAM_ACCOUNT_SEED = 'stream'

/**
 * Minimum length of a stream name.
 */
export const MIN_STREAM_NAME_LENGTH = 2
/**
 * Maximum length of a stream name.
 */
export const MAX_STREAM_NAME_LENGTH = 100

/**
 * Deposit amount period (in seconds) for a non-prepaid stream. If a non-prepaid stream has unlimited lifetime or
 * lifetime >= DEPOSIT_AMOUNT_PERIOD_IN_SECS, a security deposit is taken from the sender which would not be returned
 * in case the stream becomes insolvent. This is done to make sure users keep topping up their streams on time.
 */
export const DEPOSIT_AMOUNT_PERIOD_IN_SECS = 8 * 60 * 60 // 8 hours
/**
 * The value {@link DEPOSIT_AMOUNT_PERIOD_IN_SECS} as a BN.
 */
export const DEPOSIT_AMOUNT_PERIOD_IN_SECS_BN = new BN(DEPOSIT_AMOUNT_PERIOD_IN_SECS)

/**
 * If current time (in seconds) + LOW_TOPUP_WARNING_PERIOD_IN_SECS >= time at which stream becomes insolvent, the stream
 * is marked as low topup and a warning can be shown to the user. This is used to calculate the stream payment status.
 */
export const LOW_TOPUP_WARNING_PERIOD_IN_SECS = 24 * 60 * 60 // 1 day
