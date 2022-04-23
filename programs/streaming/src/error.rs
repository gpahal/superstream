use anchor_lang::prelude::*;

#[error_code]
pub enum StreamError {
    #[msg("The stream recipient is empty. Should be a valid address.")]
    EmptyRecipient,
    #[msg("The stream recipient is the same as the sender. Should be different addresses.")]
    SameSenderAndRecipient,
    #[msg("The stream sender is the same as the new sender. Should be different addresses.")]
    SameSenders,
    #[msg("The stream recipient is the same as the new recipient. Should be different addresses.")]
    SameRecipients,
    #[msg("The new sender is invalid.")]
    InvalidNewSender,
    #[msg("The sender is invalid.")]
    InvalidSender,
    #[msg("The recipient is invalid.")]
    InvalidRecipient,
    #[msg("The stream name is too long. Should be <= 50 chars.")]
    StreamNameTooLong,
    #[msg("The flow interval is 0. Should be > 0.")]
    ZeroFlowInterval,
    #[msg("The end time is either 0 with prepaid = true, in the past or < cliff_at. Should be >= now and >= cliff_at or if the stream is not prepaid, it can be 0.")]
    InvalidEndsAt,
    #[msg("The stream will never lead to any payments. Either there should be a cliff amount or flow rate and flow duration should be > 0.")]
    ZeroLifetimeAmount,
    #[msg("The amount cannot be 0. Should be > 0.")]
    ZeroAmount,
    #[msg("The prepaid amount needed by the stream is out of bounds.")]
    PrepaidAmountNeededOutOfBounds,
    #[msg("The deposit amount needed by the non-prepaid stream is out of bounds.")]
    DepositAmountNeededOutOfBounds,
    #[msg("The amount is less than the minimum initial amount needed.")]
    AmountLessThanAmountNeeded,
    #[msg("The withdrawn amount by recipient is more than the amount owed. THIS SHOULD NOT HAVE HAPPENED!!!")]
    WithdrawnAmountGreaterThanAmountOwed,
    #[msg("The total withdrawn amount by the recipient of the stream is out of bounds.")]
    WithdrawAmountOutOfBounds,
    #[msg("The amount available to be withdrawn by the recipient of the stream is out of bounds.")]
    AmountAvailableToWithdrawOutOfBounds,
    #[msg("The cancellation refund amount to the sender of the stream is out of bounds.")]
    CancellationRefundOutOfBounds,
    #[msg("The total topup amount by the sender of the stream is out of bounds.")]
    TopupAmountOutOfBounds,
    #[msg("The sender has insufficient balance in their token account.")]
    SenderInsufficientFunds,
    #[msg("The token escrow account has insufficient balance. THIS SHOULD NOT HAVE HAPPENED!!!")]
    EscrowInsufficientFunds,
    #[msg("The token escrow account is not rent exempt.")]
    EscrowNotRentExempt,
    #[msg("The stream has already been cancelled.")]
    StreamAlreadyCancelled,
    #[msg(
        "The user is not allowed to cancel. Should be the sender or the receiver of the stream."
    )]
    UserUnauthorizedToCancel,
    #[msg("The sender is not allowed to cancel permanently or at the moment.")]
    SenderCannotCancel,
    #[msg("The stream is prepaid. Should be a non-prepaid stream.")]
    StreamIsPrepaid,
    #[msg("The stream has already stopped. Should be an unstopped stream.")]
    StreamHasStopped,
    #[msg("The stream is already paused. Should be a non-paused stream.")]
    StreamIsPaused,
    #[msg("The stream is not paused. Should be a paused stream.")]
    StreamIsNotPaused,
    #[msg("The stream has no flow payments. Should be a stream stream with a positive flow rate and flow period.")]
    StreamHasNoFlowPayments,
    #[msg(
        "The sender is not allowed to change sender of the stream permanently or at the moment."
    )]
    SenderCannotChangeSender,
    #[msg("The sender is not allowed to pause stream permanently or at the moment.")]
    SenderCannotPause,
    #[msg("The recipient is not allowed resume a stream paused by sender permanently or at the moment.")]
    RecipientCannotResumePauseBySender,
    #[msg("The user is not allowed to pause. Should be the sender or the receiver of the stream.")]
    UserUnauthorizedToPause,
    #[msg(
        "The user is not allowed to resume. Should be the sender or the receiver of the stream."
    )]
    UserUnauthorizedToResume,
    #[msg("The stream has not ended. Should have ended and nat been cancelled.")]
    StreamNotEnded,
}
