/**
 * Status of the stream.
 */
export enum StreamStatus {
  /**
   * The stream has not started yet.
   */
  NOT_STARTED = 'not-started',
  /**
   * The stream has started and not been paused or ended yet.
   */
  STREAMING = 'streaming',
  /**
   * The stream is paused.
   */
  PAUSED = 'paused',
  /**
   * The stream has been cancelled.
   */
  CANCELLED = 'cancelled',
  /**
   * The stream has ended.
   */
  ENDED = 'ended',
}

const STREAM_STATUS_NUMBER_VALUE = new Map<StreamStatus, number>([
  [StreamStatus.NOT_STARTED, 1],
  [StreamStatus.STREAMING, 2],
  [StreamStatus.PAUSED, 3],
  [StreamStatus.CANCELLED, 4],
  [StreamStatus.ENDED, 5],
])

/**
 * Comparison function for StreamStatus objects.
 *
 * @param a The first StreamStatus object
 * @param b The second StreamStatus object
 *
 * @returns -1 if a < b, 0 if a == b or 1 if a > b
 */
export function compareFnStreamStatus(a: StreamStatus, b: StreamStatus): number {
  return (STREAM_STATUS_NUMBER_VALUE.get(a) || 0) - (STREAM_STATUS_NUMBER_VALUE.get(b) || 0)
}

/**
 * Payment Status of the stream.
 */
export enum StreamPaymentStatus {
  /**
   * The stream is prepaid.
   */
  PREPAID = 'prepaid',
  /**
   * The stream is fully paid and no topups are needed.
   */
  FULLY_PAID = 'fully-paid',
  /**
   * The stream has been paid partially but enough that it does not qualify as low topup.
   */
  STREAMING = 'streaming',
  /**
   * The stream has low topup and a warning can be shown to the user to indicate that.
   */
  LOW_TOPUP = 'low-topup',
  /**
   * The stream is insolvent and needs topup.
   */
  NEEDS_TOPUP = 'needs-topup',
}

const STREAM_PAYMENT_STATUS_NUMBER_VALUE = new Map<StreamPaymentStatus, number>([
  [StreamPaymentStatus.PREPAID, 1],
  [StreamPaymentStatus.FULLY_PAID, 2],
  [StreamPaymentStatus.STREAMING, 3],
  [StreamPaymentStatus.LOW_TOPUP, 4],
  [StreamPaymentStatus.NEEDS_TOPUP, 5],
])

/**
 * Comparison function for StreamPaymentStatus objects.
 *
 * @param a The first StreamPaymentStatus object
 * @param b The second StreamPaymentStatus object
 *
 * @returns -1 if a < b, 0 if a == b or 1 if a > b
 */
export function compareFnStreamPaymentStatus(a: StreamPaymentStatus, b: StreamPaymentStatus): number {
  return (STREAM_PAYMENT_STATUS_NUMBER_VALUE.get(a) || 0) - (STREAM_PAYMENT_STATUS_NUMBER_VALUE.get(b) || 0)
}
