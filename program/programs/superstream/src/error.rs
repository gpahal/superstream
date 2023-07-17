//! Module for superstream error handling.

use anchor_lang::prelude::*;

/// Enumeration of possible stream errors.
#[error_code]
pub enum StreamError {
    /// The stream recipient is empty. Should be a valid address.
    #[msg("The stream recipient is empty. Should be a valid address")]
    EmptyRecipient,
    /// The stream recipient is the same as the sender. Should be different addresses.
    #[msg("The stream recipient is the same as the sender. Should be different addresses")]
    SameSenderAndRecipient,
    /// The stream sender is the same as the new sender. Should be different addresses.
    #[msg("The stream sender is the same as the new sender. Should be different addresses")]
    SameSenders,
    /// The stream recipient is the same as the new recipient. Should be different addresses.
    #[msg("The stream recipient is the same as the new recipient. Should be different addresses")]
    SameRecipients,
    /// The new sender is invalid.
    #[msg("The new sender is invalid")]
    InvalidNewSender,
    /// The sender is invalid.
    #[msg("The sender is invalid")]
    InvalidSender,
    /// The recipient is invalid.
    #[msg("The recipient is invalid")]
    InvalidRecipient,
    /// The stream name is too short. Should be >= 2 chars.
    #[msg("The stream name is too short. Should be >= 2 chars")]
    StreamNameTooShort,
    /// The stream name is too long. Should be <= 100 chars.
    #[msg("The stream name is too long. Should be <= 100 chars")]
    StreamNameTooLong,
    /// The flow interval is 0. Should be > 0.
    #[msg("The flow interval is 0. Should be > 0")]
    ZeroFlowInterval,
    /// The end time is either 0 with prepaid = true, in the past or < starts_at. Should be >= current_time and
    /// >= starts_at or if the stream is not prepaid, it can be 0.
    #[msg("The end time is either 0 with prepaid = true, in the past or < starts_at. Should be >= current_time and >= starts_at or if the stream is not prepaid, it can be 0")]
    InvalidEndsAt,
    /// The stream will never lead to any payments. Either there should be a initial amount or flow rate and flow
    /// duration should be > 0.
    #[msg("The stream will never lead to any payments. Either there should be a initial amount or flow rate and flow duration should be > 0")]
    ZeroLifetimeAmount,
    /// The amount cannot be 0. Should be > 0.
    #[msg("The amount cannot be 0. Should be > 0")]
    ZeroAmount,
    /// The prepaid amount needed by the stream is out of bounds.
    #[msg("The prepaid amount needed by the stream is out of bounds")]
    PrepaidAmountNeededOutOfBounds,
    /// The deposit amount needed by the non-prepaid stream is out of bounds.
    #[msg("The deposit amount needed by the non-prepaid stream is out of bounds")]
    DepositAmountNeededOutOfBounds,
    /// The amount is less than the minimum initial amount needed.
    #[msg("The amount is less than the minimum initial amount needed")]
    AmountLessThanAmountNeeded,
    /// The user is not allowed to withdraw. Should be the recipient of the stream.
    #[msg("The user is not allowed to withdraw. Should be the recipient of the stream")]
    UserUnauthorizedToWithdraw,
    /// The withdrawn amount by recipient is more than the amount owed. THIS SHOULD NOT HAVE HAPPENED!!!
    #[msg("The withdrawn amount by recipient is more than the amount owed. THIS SHOULD NOT HAVE HAPPENED!!!")]
    WithdrawnAmountGreaterThanAmountOwed,
    /// The total withdrawn amount by the recipient of the stream is out of bounds.
    #[msg("The total withdrawn amount by the recipient of the stream is out of bounds")]
    WithdrawAmountOutOfBounds,
    /// The amount available to be withdrawn by the recipient of the stream is out of bounds.
    #[msg("The amount available to be withdrawn by the recipient of the stream is out of bounds")]
    AmountAvailableToWithdrawOutOfBounds,
    /// The cancellation refund amount to the sender of the stream is out of bounds.
    #[msg("The cancellation refund amount to the sender of the stream is out of bounds")]
    CancellationRefundOutOfBounds,
    /// The total topup amount by the sender of the stream is out of bounds.
    #[msg("The total topup amount by the sender of the stream is out of bounds")]
    TopupAmountOutOfBounds,
    /// The topup amount is more than what is needed by the stream.
    #[msg("The topup amount is more than what is needed by the stream")]
    TopupAmountMoreThanMaxAcceptable,
    /// The sender has insufficient balance in their token account.
    #[msg("The sender has insufficient balance in their token account")]
    SenderInsufficientFunds,
    /// The token escrow account has insufficient balance. THIS SHOULD NOT HAVE HAPPENED!!!
    #[msg("The token escrow account has insufficient balance. THIS SHOULD NOT HAVE HAPPENED!!!")]
    EscrowInsufficientFunds,
    /// The token escrow account is not rent exempt.
    #[msg("The token escrow account is not rent exempt")]
    EscrowNotRentExempt,
    /// The stream has already been cancelled.
    #[msg("The stream has already been cancelled")]
    StreamAlreadyCancelled,
    /// The user is not allowed to cancel. Should be the sender or the recipient of the stream.
    #[msg("The user is not allowed to cancel. Should be the sender or the recipient of the stream")]
    UserUnauthorizedToCancel,
    /// The sender is not allowed to cancel permanently or at the moment.
    #[msg("The sender is not allowed to cancel permanently or at the moment")]
    SenderCannotCancel,
    /// The stream is prepaid. Should be a non-prepaid stream.
    #[msg("The stream is prepaid. Should be a non-prepaid stream")]
    StreamIsPrepaid,
    /// The stream has already stopped. Should be an unstopped stream.
    #[msg("The stream has already stopped. Should be an unstopped stream")]
    StreamHasStopped,
    /// The stream is already paused. Should be a non-paused stream.
    #[msg("The stream is already paused. Should be a non-paused stream")]
    StreamIsPaused,
    /// The stream is not paused. Should be a paused stream.
    #[msg("The stream is not paused. Should be a paused stream")]
    StreamIsNotPaused,
    /// The stream has no flow payments. Should be a stream stream with a positive flow rate and flow period.
    #[msg("The stream has no flow payments. Should be a stream stream with a positive flow rate and flow period")]
    StreamHasNoFlowPayments,
    /// The sender is not allowed to change sender of the stream permanently or at the moment.
    #[msg("The sender is not allowed to change sender of the stream permanently or at the moment")]
    SenderCannotChangeSender,
    /// The sender is not allowed to pause stream permanently or at the moment.
    #[msg("The sender is not allowed to pause stream permanently or at the moment")]
    SenderCannotPause,
    /// The recipient is not allowed resume a stream paused by sender permanently or at the moment.
    #[msg("The recipient is not allowed resume a stream paused by sender permanently or at the moment")]
    RecipientCannotResumePauseBySender,
    /// The user is not allowed to pause. Should be the sender or the recipient of the stream.
    #[msg("The user is not allowed to pause. Should be the sender or the recipient of the stream")]
    UserUnauthorizedToPause,
    /// The user is not allowed to resume. Should be the sender or the recipient of the stream.
    #[msg("The user is not allowed to resume. Should be the sender or the recipient of the stream")]
    UserUnauthorizedToResume,
    /// The stream has not ended. Should have ended and nat been cancelled.
    #[msg("The stream has not ended. Should have ended and nat been cancelled")]
    StreamNotEnded,
}
