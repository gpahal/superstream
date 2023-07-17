//! Module for superstream state management.

use std::cmp::min;

use anchor_lang::prelude::*;

use crate::{error::StreamError, utils::get_current_timestamp};

const ANCHOR_DISCRIMINATOR_LENGTH: usize = 8;

const BOOL_LENGTH: usize = 1;
const U8_LENGTH: usize = 1;
const U64_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const STRING_LENGTH_PREFIX: usize = 4;

/// Minimum length of a stream name.
pub const MIN_STREAM_NAME_LENGTH: usize = 2;
/// Maximum length of a stream name.
pub const MAX_STREAM_NAME_LENGTH: usize = 100;

/// Deposit amount period (in seconds) for a non-prepaid stream. If a non-prepaid stream has unlimited lifetime or
/// lifetime >= DEPOSIT_AMOUNT_PERIOD_IN_SECS, a security deposit is taken from the sender which would not be returned
/// in case the stream becomes insolvent. This is done to make sure users keep topping up their streams on time.
pub const DEPOSIT_AMOUNT_PERIOD_IN_SECS: u64 = 8 * 60 * 60; // 8 hrs

/// A payment stream with support for SPL tokens, prepaid and limited upfront payment, unlimited lifetime, cliffs and
/// cancellations.
///
/// Possible states of a stream:
/// - Not started
///     - Scheduled
///     - Cancelled before start
/// - Started but not stopped
///     - Streaming
///     - Paused
/// - Stopped
///     - Cancelled after start
///     - Ended
#[account]
#[derive(Debug, PartialEq, Eq)]
pub struct Stream {
    /// If true, the stream is prepaid - all the required amount needs to be deposited on creation. Prepaid streams
    /// cannot have unlimited lifetime.
    pub is_prepaid: bool,

    /// SPL token mint address.
    pub mint: Pubkey,
    /// Sender address.
    pub sender: Pubkey,
    /// Recipient address.
    pub recipient: Pubkey,

    /// Time at which the stream was created.
    pub created_at: u64,
    /// Start time of the stream.
    ///
    /// INVARIANT: >= created_at
    pub starts_at: u64,
    /// End time of the stream. If the stream is unbounded, this can be 0 to indicate no end time.
    ///
    /// INVARIANT: prepaid: >= starts_at
    /// INVARIANT: unbounded: == 0 || >= starts_at
    pub ends_at: u64,

    /// Amount available to the recipient once stream starts.
    pub initial_amount: u64,
    /// Flow interval is the interval in which flow payments are released.
    pub flow_interval: u64,
    /// Flow rate is the number of tokens to stream per interval.
    pub flow_rate: u64,

    /// If true, the stream has been cancelled.
    pub is_cancelled: bool,
    /// If true, the stream has been cancelled before start.
    ///
    /// INVARIANT: !is_cancelled => == false
    pub is_cancelled_before_start: bool,
    /// If true, the stream has been cancelled by the sender.
    ///
    /// INVARIANT: !is_cancelled || !sender_can_cancel => == false
    pub is_cancelled_by_sender: bool,

    /// Time at which the stream was cancelled. If it is > 0, it means the stream has been cancelled and any funds in
    /// the escrow account not available to be withdrawn by the recipient have been retrieved.
    ///
    /// INVARIANT: cancelled_at > 0 iff is_cancelled == true
    pub cancelled_at: u64,

    /// True if a solvent stream can be cancelled by the sender.
    pub sender_can_cancel: bool,
    /// Time at which the sender is allowed to cancel a solvent stream.
    pub sender_can_cancel_at: u64,

    /// True if the sender can change the sender of the stream who will do the upcoming topups.
    ///
    /// INVARIANT: prepaid: false
    pub sender_can_change_sender: bool,
    /// Time at which the sender is allowed to change the sender.
    ///
    /// INVARIANT: prepaid: == 0
    pub sender_can_change_sender_at: u64,

    /// If true, the stream is paused.
    ///
    /// INVARIANT: prepaid: == false
    pub is_paused: bool,
    /// If true, the stream is paused by sender.
    ///
    /// INVARIANT: prepaid: == false
    /// INVARIANT: runtime: unbounded: !is_paused || !sender_can_pause => == false
    pub is_paused_by_sender: bool,

    /// True if a stream can be paused by the sender.
    ///
    /// INVARIANT: prepaid: false
    pub sender_can_pause: bool,
    /// Time at which the sender is allowed to pause a stream.
    ///
    /// INVARIANT: prepaid: == 0
    pub sender_can_pause_at: u64,

    /// True if a stream can be resumed by the recipient if it was paused by the sender.
    ///
    /// INVARIANT: prepaid: false
    pub recipient_can_resume_pause_by_sender: bool,
    /// Time at which the recipient is allowed to resume a stream which was paused by the sender.
    ///
    /// INVARIANT: prepaid: == 0
    pub recipient_can_resume_pause_by_sender_at: u64,

    /// True if anyone can withdraw on behalf of the recipient. The amount will go in recipients' account.
    pub anyone_can_withdraw_for_recipient: bool,
    /// Time at which anyone can withdraw on behalf of the recipient.
    pub anyone_can_withdraw_for_recipient_at: u64,

    /// Time at which the stream was last resumed.
    ///
    /// INVARIANT: prepaid: == 0
    /// INVARIANT: unbounded: (== 0 || >= starts_at) && (ends_at == 0 || < ends_at)
    pub last_resumed_at: u64,
    /// Total accumulated active (!is_paused) time since starts_at. This does not include (current_time -
    /// last_resumed_at) time if the stream is not paused.
    ///
    /// INVARIANT: prepaid: == 0
    /// INVARIANT: unbounded: == 0 || (current_time > starts_at && == current_time - starts_at - total_paused_time)
    pub accumulated_active_time: u64,

    /// Total amount withdrawn by the recipient.
    ///
    /// INVARIANT: runtime: prepaid: <= amount_owed && <= prepaid_amount_needed
    /// INVARIANT: runtime: unbounded: <= amount_owed && <= total_topup_amount
    pub total_withdrawn_amount: u64,
    /// Last time at which recipient withdrew any amount.
    pub last_withdrawn_at: u64,
    /// Last amount which recipient withdrew.
    pub last_withdrawn_amount: u64,

    /// Total topup amount added for the stream.
    ///
    /// INVARIANT: prepaid: == total_prepaid_amount
    /// INVARIANT: unbounded: >= initial_amount + streaming_amount_owed
    pub total_topup_amount: u64,
    /// Last time at which sender topped up the stream.
    pub last_topup_at: u64,
    /// Last topup amount.
    pub last_topup_amount: u64,

    /// Total deposit amount needed for the non-prepaid stream. These are needed in case the sender does not topup the
    /// stream in time and the amount owed becomes > total topup amount. When that happens, anyone can cancel the
    /// stream. The deposit amount will be distributed as a reward to whoever finds the insolvency and cancels the
    /// stream.
    ///
    /// INVARIANT: prepaid: == 0
    /// INVARIANT: unbounded: == DEPOSIT_AMOUNT_PERIOD_IN_SECS of streaming payments
    pub deposit_needed: u64,

    /// Extra space for program upgrades.
    pub reserved: [u64; 16],

    /// Seed of the stream PDA. It's upto the client how they choose the seed. Each tuple (seed, mint, name) corresponds
    /// to a unique stream.
    pub seed: u64,
    /// The PDA bump.
    pub bump: u8,

    /// Name of the stream. Should be unique for a particular set of (seed, mint).
    ///
    /// INVARIANT: Length <= 100 unicode chars or 400 bytes
    pub name: String,
}

/// INVARIANT: total_topup_amount_sent_by_sender ==
///                amount_owed_to_recipient + amount_owed_to_cancelling_account
///                + excess_topup_amount_available_to_withdraw_to_sender_after_ended
///
/// For solvent stream:
///
/// INVARIANT: total_topup_amount_sent_by_sender ==
///                total_topup_amount + deposit_needed
/// INVARIANT: amount_owed_to_recipient ==
///                amount_owed
/// INVARIANT: amount_owed_to_cancelling_account ==
///                0
/// INVARIANT: excess_topup_amount_available_to_withdraw_to_sender_after_ended ==
///                total_topup_amount + deposit_needed - amount_owed
///
/// For non-cancelled insolvent stream:
///
/// INVARIANT: total_topup_amount_sent_by_sender ==
///                total_topup_amount + deposit_needed
/// INVARIANT: amount_owed_to_recipient ==
///                total_topup_amount + deposit_needed
/// INVARIANT: amount_owed_to_cancelling_account ==
///                0
/// INVARIANT: excess_topup_amount_available_to_withdraw_to_sender_after_ended ==
///                0
///
/// For cancelled insolvent stream: (deposit_needed == 0 for cancelled streams)
///
/// INVARIANT: total_topup_amount_sent_by_sender ==
///                total_topup_amount + insolvent_stream_cancellation_reward (== initial_deposit_needed)
/// INVARIANT: amount_owed_to_recipient ==
///                total_topup_amount
/// INVARIANT: amount_owed_to_cancelling_account ==
///                insolvent_stream_cancellation_reward (== initial_deposit_needed)
/// INVARIANT: excess_topup_amount_available_to_withdraw_to_sender_after_ended ==
///                0
impl Stream {
    /// Total size of a Stream account excluding space taken up by the name
    const BASE_LENGTH: usize = ANCHOR_DISCRIMINATOR_LENGTH
        + 1 * BOOL_LENGTH       // is_prepaid - 9
        + 3 * PUBLIC_KEY_LENGTH // sender, recipient, mint - 105
        + 3 * U64_LENGTH        // created_at, starts_at, ends_at - 129
        + 3 * U64_LENGTH        // initial_amount, flow_interval, flow_rate - 153
        + 3 * BOOL_LENGTH       // is_cancelled, is_cancelled_before_start, is_cancelled_by_sender - 156
        + 1 * U64_LENGTH        // cancelled_at - 164
        + 1 * BOOL_LENGTH       // sender_can_cancel - 165
        + 1 * U64_LENGTH        // sender_can_cancel_at - 173
        + 1 * BOOL_LENGTH       // sender_can_change_sender - 174
        + 1 * U64_LENGTH        // sender_can_change_sender_at - 182
        + 2 * BOOL_LENGTH       // is_paused, is_paused_by_sender - 184
        + 1 * BOOL_LENGTH       // sender_can_pause - 185
        + 1 * U64_LENGTH        // sender_can_pause_at - 193
        + 1 * BOOL_LENGTH       // recipient_can_resume_pause_by_sender - 194
        + 1 * U64_LENGTH        // recipient_can_resume_pause_by_sender_at - 202
        + 1 * BOOL_LENGTH       // anyone_can_withdraw_for_recipient - 203
        + 1 * U64_LENGTH        // anyone_can_withdraw_for_recipient_at - 211
        + 2 * U64_LENGTH        // last_resumed_at, accumulated_active_time - 227
        + 3 * U64_LENGTH        // total_withdrawn_amount, last_withdrawn_at, last_withdrawn_amount - 251
        + 3 * U64_LENGTH        // total_topup_amount, last_topup_at, last_topup_amount - 275
        + 1 * U64_LENGTH        // deposit_needed - 283
        + 16 * U64_LENGTH       // reserved - 411
        + 1 * U64_LENGTH        // seed - 419
        + 1 * U8_LENGTH         // bump - 420
    ;

    pub fn space(name: &str) -> usize {
        Self::BASE_LENGTH + STRING_LENGTH_PREFIX + name.len()
    }

    // --- Utility functions --- BEGIN ---

    pub fn has_flow_payments(&self) -> bool {
        self.flow_rate > 0 && (self.ends_at == 0 || self.ends_at > self.starts_at)
    }

    /// Calculate the amount of prepaid needed for a prepaid stream. This is called when creating the stream.
    pub fn get_prepaid_amount_needed(&self) -> Result<u64> {
        if !self.is_prepaid || self.ends_at == 0 {
            Ok(0)
        } else if !self.has_flow_payments() {
            Ok(self.initial_amount)
        } else {
            self.initial_amount
                .checked_add(
                    ((self.ends_at - self.starts_at)
                        .checked_mul(self.flow_rate)
                        .ok_or(error!(StreamError::PrepaidAmountNeededOutOfBounds))?)
                        / self.flow_interval,
                )
                .ok_or(error!(StreamError::PrepaidAmountNeededOutOfBounds))
        }
    }

    /// Calculate the amount of deposit needed for the streaming payments excluding the initial amount. This is called
    /// when creating the stream.
    pub fn get_deposit_needed(&self) -> Result<u64> {
        Ok(if self.is_prepaid || !self.has_flow_payments() {
            0
        } else {
            let deposit_needed = if self.ends_at == 0 {
                DEPOSIT_AMOUNT_PERIOD_IN_SECS
                    .checked_mul(self.flow_rate)
                    .ok_or(error!(StreamError::DepositAmountNeededOutOfBounds))?
                    / self.flow_interval
            } else {
                min(DEPOSIT_AMOUNT_PERIOD_IN_SECS, self.ends_at - self.starts_at)
                    .checked_mul(self.flow_rate)
                    .ok_or(error!(StreamError::DepositAmountNeededOutOfBounds))?
                    / self.flow_interval
            };

            if deposit_needed >= 10 {
                deposit_needed
            } else {
                deposit_needed + 1
            }
        })
    }

    pub fn get_stops_at(&self) -> u64 {
        let cancelled_at = self.cancelled_at;
        let ends_at = self.ends_at;
        if cancelled_at == 0 {
            ends_at
        } else if ends_at == 0 {
            cancelled_at
        } else {
            min(ends_at, cancelled_at)
        }
    }

    /// Check if the stream has stooped.
    pub fn has_stopped(&self, at: u64) -> bool {
        let stops_at = self.get_stops_at();
        return stops_at > 0 && at > stops_at;
    }

    fn min_with_stopped_at(&self, at: u64) -> u64 {
        let stops_at = self.get_stops_at();
        if stops_at > 0 && at > stops_at {
            // If the stream has been stopped for some reason - either ending or being cancelled - make at = stopped_at
            // if the stream stopped before at. This will make sure, the amount is calculated only till the time the
            // stream was active.
            stops_at
        } else {
            at
        }
    }

    // INVARIANT: (stops_at == 0 || at <= stops_at) && at >= self.starts_at && self.has_flow_payments()
    fn unsafe_get_active_time_after_start(&self, at: u64) -> Result<u64> {
        Ok(if self.is_paused {
            // INVARIANT: The stream is paused => accumulated time is the total time.
            self.accumulated_active_time
        } else if self.last_resumed_at == 0 {
            // INVARIANT: The stream is not paused and was never resumed => stream was never paused.
            at - self.starts_at
        } else {
            // SAFETY: INVARIANT: last_resumed_at != 0 =>
            //     last_resumed_at >= starts_at && (ends_at == 0 || < ends_at) =>
            //     last_resumed_at will never be > ends_at if ends_at > 0
            (at - self.last_resumed_at)
                .checked_add(self.accumulated_active_time)
                .ok_or(error!(StreamError::AmountAvailableToWithdrawOutOfBounds))?
        })
    }

    /// Get the maximum acceptable topup amount.
    pub fn get_max_acceptable_topup_amount(&self, at: u64) -> Result<(bool, u64)> {
        Ok(if self.is_prepaid || !self.has_flow_payments() {
            (false, 0)
        } else {
            // Streams: non-prepaid, with flow payments.
            let stops_at = self.get_stops_at();
            if stops_at == 0 {
                // Streams: non-prepaid, with flow payments, non-cancelled with no end time.
                (true, 0)
            } else if stops_at < self.starts_at {
                // Streams: non-prepaid, with flow payments, stopped before start.
                (false, 0)
            } else {
                // Streams: non-prepaid, with flow payments, cancelled after start time and/or with set end time after
                // start time.
                let total_possible_active_time = if at < self.starts_at {
                    // Streams: non-prepaid, with flow payments, not-started, with set end time after start time. The
                    // stream cannot be cancelled before current time.
                    self.ends_at - self.starts_at
                } else {
                    // Streams: non-prepaid, with flow payments, started, cancelled after start time and/or with set end
                    // time after start time.
                    if stops_at <= at {
                        // Streams: non-prepaid, with flow payments, started, stopped after start time.
                        self.unsafe_get_active_time_after_start(stops_at)?
                    } else {
                        // Streams: non-prepaid, with flow payments, started, not already stopped => with set end time
                        // after start time in the future.
                        self.unsafe_get_active_time_after_start(at)?
                            .checked_add(stops_at - at)
                            .ok_or(error!(StreamError::TopupAmountOutOfBounds))?
                    }
                };

                let total_possible_topup = if total_possible_active_time == 0 {
                    self.initial_amount
                } else {
                    self.initial_amount
                        .checked_add(
                            (total_possible_active_time
                                .checked_mul(self.flow_rate)
                                .ok_or(error!(StreamError::TopupAmountOutOfBounds))?)
                                / self.flow_interval,
                        )
                        .ok_or(error!(StreamError::TopupAmountOutOfBounds))?
                };

                (
                    false,
                    if total_possible_topup <= self.total_topup_amount {
                        0
                    } else {
                        total_possible_topup - self.total_topup_amount
                    },
                )
            }
        })
    }

    /// Get the total amount owed to the recipient.
    pub fn get_amount_owed(&self, at: u64) -> Result<u64> {
        let at = self.min_with_stopped_at(at);

        Ok(if at < self.starts_at {
            0
        } else if !self.has_flow_payments() {
            self.initial_amount
        } else {
            let active_time = self.unsafe_get_active_time_after_start(at)?;
            if active_time == 0 {
                self.initial_amount
            } else {
                self.initial_amount
                    .checked_add(
                        (active_time
                            .checked_mul(self.flow_rate)
                            .ok_or(error!(StreamError::AmountAvailableToWithdrawOutOfBounds))?)
                            / self.flow_interval,
                    )
                    .ok_or(error!(StreamError::AmountAvailableToWithdrawOutOfBounds))?
            }
        })
    }

    fn mark_cancelled(&mut self, at: u64, signer: &Signer) {
        self.is_cancelled = true;
        self.is_cancelled_before_start = at < self.starts_at;
        self.is_cancelled_by_sender = signer.key() == self.sender;
        self.cancelled_at = at;
    }

    fn add_topup_amount(&mut self, at: u64, latest_topup_amount: u64) -> Result<()> {
        self.total_topup_amount = self
            .total_topup_amount
            .checked_add(latest_topup_amount)
            .ok_or(error!(StreamError::TopupAmountOutOfBounds))?;
        self.last_topup_at = at;
        self.last_topup_amount = latest_topup_amount;
        Ok(())
    }

    fn add_withdrawn_amount(&mut self, at: u64, latest_withdrawn_amount: u64) -> Result<()> {
        if latest_withdrawn_amount == 0 {
            return Ok(());
        }

        self.total_withdrawn_amount = self
            .total_withdrawn_amount
            .checked_add(latest_withdrawn_amount)
            .ok_or(error!(StreamError::WithdrawAmountOutOfBounds))?;
        self.last_withdrawn_at = at;
        self.last_withdrawn_amount = latest_withdrawn_amount;
        Ok(())
    }

    // --- Utility functions --- END ---

    // --- Instruction functions --- BEGIN ---

    /// Initialize a stream.
    pub fn initialize(
        &mut self,
        is_prepaid: bool,
        mint: Pubkey,
        sender: Pubkey,
        recipient: Pubkey,
        name: String,
        starts_at: u64,
        ends_at: u64,
        initial_amount: u64,
        flow_interval: u64,
        flow_rate: u64,
        sender_can_cancel: bool,
        sender_can_cancel_at: u64,
        sender_can_change_sender: bool,
        sender_can_change_sender_at: u64,
        sender_can_pause: bool,
        sender_can_pause_at: u64,
        recipient_can_resume_pause_by_sender: bool,
        recipient_can_resume_pause_by_sender_at: u64,
        anyone_can_withdraw_for_recipient: bool,
        anyone_can_withdraw_for_recipient_at: u64,
        seed: u64,
        bump: u8,
    ) -> Result<()> {
        require!(recipient != Pubkey::default(), StreamError::EmptyRecipient);
        require!(name.len() >= MIN_STREAM_NAME_LENGTH, StreamError::StreamNameTooShort);
        require!(name.len() <= MAX_STREAM_NAME_LENGTH, StreamError::StreamNameTooLong);
        require!(recipient != sender, StreamError::SameSenderAndRecipient);
        require!(flow_interval > 0, StreamError::ZeroFlowInterval);

        let at = get_current_timestamp()?;
        let starts_at = if starts_at < at { at } else { starts_at };

        require!(
            (!is_prepaid && ends_at == 0) || ends_at >= starts_at,
            StreamError::InvalidEndsAt,
        );

        let sender_can_cancel_at = if sender_can_cancel {
            min(sender_can_cancel_at, at)
        } else {
            0
        };
        let sender_can_change_sender_at = if sender_can_change_sender {
            min(sender_can_change_sender_at, at)
        } else {
            0
        };
        let sender_can_pause_at = if sender_can_pause {
            min(sender_can_pause_at, at)
        } else {
            0
        };
        let recipient_can_resume_pause_by_sender_at = if recipient_can_resume_pause_by_sender {
            min(recipient_can_resume_pause_by_sender_at, at)
        } else {
            0
        };
        let anyone_can_withdraw_for_recipient_at = if anyone_can_withdraw_for_recipient {
            min(anyone_can_withdraw_for_recipient_at, at)
        } else {
            0
        };

        self.is_prepaid = is_prepaid;
        self.is_cancelled = false;
        self.is_cancelled_before_start = false;
        self.is_cancelled_by_sender = false;
        self.is_paused = false;
        self.is_paused_by_sender = false;
        self.mint = mint;
        self.sender = sender;
        self.recipient = recipient;
        self.created_at = at;
        self.starts_at = starts_at;
        self.ends_at = ends_at;
        self.initial_amount = initial_amount;
        self.flow_interval = flow_interval;
        self.flow_rate = flow_rate;
        self.sender_can_cancel = sender_can_cancel;
        self.sender_can_cancel_at = sender_can_cancel_at;
        self.cancelled_at = 0;
        self.sender_can_change_sender = sender_can_change_sender;
        self.sender_can_change_sender_at = sender_can_change_sender_at;
        self.sender_can_pause = sender_can_pause;
        self.sender_can_pause_at = sender_can_pause_at;
        self.recipient_can_resume_pause_by_sender = recipient_can_resume_pause_by_sender;
        self.recipient_can_resume_pause_by_sender_at = recipient_can_resume_pause_by_sender_at;
        self.anyone_can_withdraw_for_recipient = anyone_can_withdraw_for_recipient;
        self.anyone_can_withdraw_for_recipient_at = anyone_can_withdraw_for_recipient_at;
        self.last_resumed_at = 0;
        self.accumulated_active_time = 0;
        self.total_withdrawn_amount = 0;
        self.last_withdrawn_at = 0;
        self.last_withdrawn_amount = 0;
        self.total_topup_amount = 0;
        self.last_topup_at = 0;
        self.last_topup_amount = 0;
        self.deposit_needed = self.get_deposit_needed()?;
        self.seed = seed;
        self.bump = bump;
        self.name = name;

        require!(
            self.initial_amount > 0 || self.has_flow_payments(),
            StreamError::ZeroLifetimeAmount
        );
        Ok(())
    }

    /// Initialize a prepaid stream.
    pub fn initialize_prepaid(&mut self) -> Result<u64> {
        let prepaid_amount_needed = self.get_prepaid_amount_needed()?;
        require!(prepaid_amount_needed > 0, StreamError::ZeroLifetimeAmount);
        self.add_topup_amount(get_current_timestamp()?, prepaid_amount_needed)?;
        Ok(prepaid_amount_needed)
    }

    /// Initialize a non-prepaid stream.
    pub fn initialize_non_prepaid(&mut self, topup_amount: u64) -> Result<()> {
        require!(topup_amount > 0, StreamError::ZeroAmount);

        // Amount needed = initial_amount + 2 * deposit_amount.
        //
        // We are doing 2 times deposit amount, because if it was just once, the stream would become insolvent
        // immediately.
        let amount_needed = self
            .initial_amount
            .checked_add(
                self.deposit_needed
                    .checked_mul(2)
                    .ok_or(error!(StreamError::DepositAmountNeededOutOfBounds))?,
            )
            .ok_or(error!(StreamError::DepositAmountNeededOutOfBounds))?;
        require!(topup_amount >= amount_needed, StreamError::AmountLessThanAmountNeeded);
        self.add_topup_amount(get_current_timestamp()?, topup_amount - self.deposit_needed)
    }

    pub(crate) fn cancel(&mut self, key: Pubkey, signer: &Signer, recipient: Pubkey) -> Result<CancelTransferParams> {
        require!(!self.is_cancelled, StreamError::StreamAlreadyCancelled);
        require!(recipient == self.recipient, StreamError::InvalidRecipient);

        let at = get_current_timestamp()?;
        self.mark_cancelled(at, signer);

        let total_topup_amount = self.total_topup_amount;
        let amount_owed = self.get_amount_owed(at)?;
        if total_topup_amount < amount_owed {
            // The stream is insolvent. Anyone can cancel.
            let transfer_amount_recipient = if total_topup_amount > self.total_withdrawn_amount {
                total_topup_amount - self.total_withdrawn_amount
            } else {
                0
            };
            self.add_withdrawn_amount(at, transfer_amount_recipient)?;

            if self.is_prepaid {
                msg!("Prepaid stream [{}] is insolvent. THIS SHOULD NEVER HAPPEN!!!", key);
                Ok(CancelTransferParams {
                    transfer_amount_sender: 0,
                    transfer_amount_signer: 0,
                    transfer_amount_recipient,
                })
            } else {
                // The deposit is given as reward to the signer. The remaining topup amount can be withdrawn by the
                // recipient.
                let transfer_amount_signer = self.deposit_needed;
                self.deposit_needed = 0;
                Ok(CancelTransferParams {
                    transfer_amount_sender: 0,
                    transfer_amount_signer,
                    transfer_amount_recipient,
                })
            }
        } else {
            // The stream is still solvent. Only the sender and recipient can cancel.
            let signer_key = signer.key();
            require!(
                signer_key == self.sender || signer_key == self.recipient,
                StreamError::UserUnauthorizedToCancel,
            );
            require!(
                signer_key != self.sender || (self.sender_can_cancel && self.sender_can_cancel_at <= at),
                StreamError::SenderCannotCancel,
            );

            // Return anything the sender paid - topup or deposit that is not owed to the recipient. The stream has been
            // cancelled and stopped, so the deposit is no longer needed.
            let transfer_amount_sender = total_topup_amount
                .checked_add(self.deposit_needed)
                .ok_or(error!(StreamError::CancellationRefundOutOfBounds))?
                - amount_owed;

            self.total_topup_amount = amount_owed;
            self.deposit_needed = 0;

            let transfer_amount_recipient = if amount_owed > self.total_withdrawn_amount {
                amount_owed - self.total_withdrawn_amount
            } else {
                0
            };
            self.add_withdrawn_amount(at, transfer_amount_recipient)?;

            Ok(CancelTransferParams {
                transfer_amount_sender,
                transfer_amount_signer: 0,
                transfer_amount_recipient,
            })
        }
    }

    pub(crate) fn withdraw_excess_topup_non_prepaid_ended(&mut self) -> Result<u64> {
        require!(!self.is_cancelled, StreamError::StreamAlreadyCancelled);

        let at = get_current_timestamp()?;
        require!(self.ends_at > 0 && self.ends_at < at, StreamError::StreamNotEnded);

        let total_topup_amount = self.total_topup_amount;
        let amount_owed = self.get_amount_owed(at)?;
        Ok(if total_topup_amount < amount_owed {
            // The stream is insolvent. Nothing to do.
            0
        } else {
            let deposit_needed = self.deposit_needed;

            self.total_topup_amount = amount_owed;
            self.deposit_needed = 0;

            total_topup_amount
                .checked_add(deposit_needed)
                .ok_or(error!(StreamError::CancellationRefundOutOfBounds))?
                - amount_owed
        })
    }

    pub(crate) fn topup_non_prepaid(&mut self, topup_amount: u64) -> Result<()> {
        require!(topup_amount > 0, StreamError::ZeroAmount);
        require!(!self.is_prepaid, StreamError::StreamIsPrepaid);
        require!(self.has_flow_payments(), StreamError::StreamHasNoFlowPayments);

        let at = get_current_timestamp()?;
        require!(!self.has_stopped(at), StreamError::StreamHasStopped);

        let (no_limit, max_acceptable_topup) = self.get_max_acceptable_topup_amount(at)?;
        if !no_limit && topup_amount > max_acceptable_topup {
            require!(!self.has_stopped(at), StreamError::TopupAmountMoreThanMaxAcceptable);
        }

        self.add_topup_amount(get_current_timestamp()?, topup_amount)
    }

    pub(crate) fn change_sender_non_prepaid(&mut self, sender: &Signer, new_sender: Pubkey) -> Result<()> {
        require!(!self.is_prepaid, StreamError::StreamIsPrepaid);
        require!(sender.key() == self.sender, StreamError::InvalidSender);
        require!(new_sender != Pubkey::default(), StreamError::InvalidNewSender);
        require!(new_sender != self.sender, StreamError::SameSenders);

        let at = get_current_timestamp()?;
        require!(
            self.sender_can_change_sender && self.sender_can_change_sender_at <= at,
            StreamError::SenderCannotChangeSender
        );
        require!(!self.has_stopped(at), StreamError::StreamHasStopped);

        self.sender = new_sender;
        Ok(())
    }

    pub(crate) fn withdraw_and_change_recipient(
        &mut self,
        signer: &Signer,
        recipient: Pubkey,
        new_recipient: Pubkey,
    ) -> Result<u64> {
        require!(recipient == self.recipient, StreamError::InvalidRecipient);

        let at = get_current_timestamp()?;
        require!(
            signer.key() == self.recipient
                || (self.anyone_can_withdraw_for_recipient && self.anyone_can_withdraw_for_recipient_at <= at),
            StreamError::UserUnauthorizedToWithdraw,
        );

        let total_topup_amount = self.total_topup_amount;

        let at = get_current_timestamp()?;
        let mut amount_owed = self.get_amount_owed(at)?;
        if amount_owed > total_topup_amount {
            // The stream is insolvent. Cancel the stream if not already cancelled. Recipient is owed the whole topup
            // amount and if the stream is not cancelled yet, also the deposit amount.
            amount_owed = if self.is_cancelled {
                total_topup_amount
            } else {
                self.mark_cancelled(at, signer);
                total_topup_amount
                    .checked_add(self.deposit_needed)
                    .ok_or(error!(StreamError::WithdrawAmountOutOfBounds))?
            }
        }

        require!(
            amount_owed >= self.total_withdrawn_amount,
            StreamError::WithdrawnAmountGreaterThanAmountOwed,
        );
        let amount_available_to_withdraw = amount_owed - self.total_withdrawn_amount;
        self.add_withdrawn_amount(at, amount_available_to_withdraw)?;
        if !self.is_cancelled && new_recipient != Pubkey::default() {
            // Only the recipient can change the recipient.
            require!(signer.key() == self.recipient, StreamError::UserUnauthorizedToWithdraw);
            require!(new_recipient != self.recipient, StreamError::SameRecipients);
            self.recipient = new_recipient;
        }

        Ok(amount_available_to_withdraw)
    }

    pub(crate) fn pause_non_prepaid(&mut self, signer: &Signer) -> Result<()> {
        require!(!self.is_prepaid, StreamError::StreamIsPrepaid);
        require!(!self.is_paused, StreamError::StreamIsPaused);
        require!(self.has_flow_payments(), StreamError::StreamHasNoFlowPayments);

        let signer_key = signer.key();
        let is_sender = signer_key == self.sender;
        let is_recipient = signer_key == self.recipient;
        require!(is_sender || is_recipient, StreamError::UserUnauthorizedToPause);

        let at = get_current_timestamp()?;
        require!(
            is_recipient || (self.sender_can_pause && self.sender_can_pause_at <= at),
            StreamError::SenderCannotPause
        );

        require!(!self.has_stopped(at), StreamError::StreamHasStopped);

        // Update accumulated_active_time if there has been any flow till `at`.
        if at > self.starts_at {
            self.accumulated_active_time = self.unsafe_get_active_time_after_start(at)?;
        }

        self.is_paused = true;
        self.is_paused_by_sender = is_sender;

        Ok(())
    }

    pub(crate) fn resume_non_prepaid(&mut self, signer: &Signer) -> Result<()> {
        require!(!self.is_prepaid, StreamError::StreamIsPrepaid);
        require!(self.is_paused, StreamError::StreamIsNotPaused);

        let signer_key = signer.key();
        let is_sender = signer_key == self.sender;
        let is_recipient = signer_key == self.recipient;
        require!(is_sender || is_recipient, StreamError::UserUnauthorizedToResume);

        let at = get_current_timestamp()?;
        require!(
            is_sender
                || !self.is_paused_by_sender
                || (self.recipient_can_resume_pause_by_sender && self.recipient_can_resume_pause_by_sender_at <= at),
            StreamError::RecipientCannotResumePauseBySender
        );

        require!(!self.has_stopped(at), StreamError::StreamHasStopped);

        self.is_paused = false;
        self.is_paused_by_sender = false;

        // Update last_resumed_at if there has been any flow till `at`.
        if at > self.starts_at {
            self.last_resumed_at = at;
        }

        Ok(())
    }

    // --- Instruction functions --- END ---
}

/// Record of funds to be transferred once a stream is cancelled.
pub struct CancelTransferParams {
    /// Transfer fund amount to the stream sender.
    pub transfer_amount_sender: u64,
    /// Transfer fund amount to the signer.
    pub transfer_amount_signer: u64,
    /// Transfer fund amount to the stream recipient.
    pub transfer_amount_recipient: u64,
}
