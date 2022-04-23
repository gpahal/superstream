use std::cmp::min;

use anchor_lang::prelude::*;

use crate::{error::StreamError, utils::get_current_timestamp};

const ANCHOR_DISCRIMINATOR_LENGTH: usize = 8;

const BOOL_LENGTH: usize = 1;
const U8_LENGTH: usize = 1;
const U64_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const STRING_LENGTH_PREFIX: usize = 4;

pub const MAX_STREAM_NAME_LENGTH: usize = 100;

pub const DEPOSIT_AMOUNT_PERIOD: u64 = 8 * 60 * 60; // 8 hrs

/// A payment stream with support for SPL tokens, prepaid and limited upfront payment, unlimited
/// lifetime, cliffs and cancellations.
#[account]
#[derive(Debug, PartialEq, Eq)]
pub struct Stream {
    /// If true, the stream is prepaid - all the required amount needs to be deposited on creation.
    /// Prepaid streams cannot have unlimited lifetime.
    pub prepaid: bool,
    /// If true, the stream is paused.
    ///
    /// INVARIANT: prepaid: == false
    pub paused: bool,
    /// If true, the stream is paused by sender.
    ///
    /// INVARIANT: prepaid: == false
    /// INVARIANT: runtime: unbounded: !paused => == false
    pub paused_by_sender: bool,
    /// If true, the stream has been cancelled.
    pub cancelled: bool,

    /// SPL token mint address.
    pub mint: Pubkey,
    /// Sender address.
    pub sender: Pubkey,
    /// Recipient address.
    pub recipient: Pubkey,

    /// Name of the stream. Should be unique for a particular set of (seed, mint).
    ///
    /// INVARIANT: Length <= 100 unicode chars or 400 bytes
    pub name: String,

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

    /// True if a solvent stream can be cancelled by the sender.
    pub sender_can_cancel: bool,
    /// Time at which the sender is allowed to cancel a solvent stream.
    pub sender_can_cancel_at: u64,

    /// Time at which the stream was cancelled. If it is > 0, it means the stream has been
    /// cancelled and any funds in the escrow account not available to be withdrawn by the recipient
    /// have been retrieved.
    ///
    /// INVARIANT: cancelled_at > 0 iff cancelled == true
    pub cancelled_at: u64,

    /// True if the sender can change the sender of the stream who will do the upcoming topups.
    ///
    /// INVARIANT: prepaid: false
    pub sender_can_change_sender: bool,
    /// Time at which the sender is allowed to change the sender.
    ///
    /// INVARIANT: prepaid: == 0
    pub sender_can_change_sender_at: u64,

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

    /// Time at which the stream was last resumed.
    ///
    /// INVARIANT: prepaid: == 0
    /// INVARIANT: unbounded: (== 0 || >= starts_at) && (ends_at == 0 || < ends_at)
    pub last_resumed_at: u64,
    /// Total accumulated active (not paused) time since starts_at. This does not include
    /// (now - last_resumed_at) time if the stream is not paused.
    ///
    /// INVARIANT: prepaid: == 0
    /// INVARIANT: unbounded: == 0 || (now > starts_at && == now - starts_at - total_paused_time)
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

    /// Total deposit amount needed for the non-prepaid stream. These are needed in case the sender
    /// does not topup the stream in time and the amount owed becomes > total topup amount. When
    /// that happens, anyone can cancel the stream. The deposit amount will be distributed as
    /// a reward to whoever finds the insolvency and cancels the stream.
    ///
    /// INVARIANT: prepaid: == 0
    /// INVARIANT: unbounded: == 24 hrs of streaming payments
    pub deposit_needed: u64,

    /// Seed of the stream PDA. It's upto the client how they choose the seed. Each tuple
    /// (seed, mint, name) corresponds to a unique stream.
    pub seed: u64,
    /// The PDA bump.
    pub bump: u8,

    /// Extra space for program upgrades.
    pub reserved: [u64; 16],
}

impl Stream {
    /// Total size of the Stream account - space taken up by the name
    const BASE_LENGTH: usize = ANCHOR_DISCRIMINATOR_LENGTH
        + 4 * BOOL_LENGTH       // prepaid, paused, paused_by_sender, cancelled
        + 3 * PUBLIC_KEY_LENGTH // sender, recipient, mint
        + 1 * U64_LENGTH        // created_at
        + 5 * U64_LENGTH        // starts_at, ends_at, initial_amount, flow_interval, flow_rate
        + 1 * BOOL_LENGTH       // sender_can_cancel
        + 1 * U64_LENGTH        // sender_can_cancel_at
        + 1 * U64_LENGTH        // cancelled_at
        + 1 * BOOL_LENGTH       // sender_can_change_sender
        + 1 * U64_LENGTH        // sender_can_change_sender_at
        + 1 * BOOL_LENGTH       // sender_can_pause
        + 1 * U64_LENGTH        // sender_can_pause_at
        + 1 * BOOL_LENGTH       // recipient_can_resume_pause_by_sender
        + 1 * U64_LENGTH        // recipient_can_resume_pause_by_sender_at
        + 2 * U64_LENGTH        // last_resumed_at, total_active_time
        + 3 * U64_LENGTH        // total_withdrawn_amount, last_withdrawn_at, last_withdrawn_amount
        + 3 * U64_LENGTH        // total_topup_amount, last_topup_at, last_topup_amount
        + 1 * U64_LENGTH        // deposit_needed
        + 1 * U64_LENGTH        // seed
        + 1 * U8_LENGTH         // bump
        + 16 * U64_LENGTH; // reserved

    pub fn space(name: &str) -> usize {
        Self::BASE_LENGTH + STRING_LENGTH_PREFIX + name.len()
    }

    pub fn has_no_flow_payments(&self) -> bool {
        self.flow_rate == 0 || (self.ends_at != 0 && self.ends_at <= self.starts_at)
    }

    /// Check is the stream can ever have amount owed > 0. This is called when creating the stream.
    pub fn is_non_zero_amount(&self) -> bool {
        self.initial_amount > 0
            || ((self.ends_at == 0 || self.ends_at > self.starts_at) && self.flow_rate > 0)
    }

    /// Calculate the amount of prepaid needed for a prepaid stream. This is called when creating
    /// the stream.
    pub fn get_prepaid_amount_needed(&self) -> Result<u64> {
        if !self.prepaid || self.ends_at == 0 {
            Ok(0)
        } else if self.has_no_flow_payments() {
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

    /// Calculate the amount of deposit needed for the streaming payments excluding the initial
    /// amount. This is called when creating the stream.
    pub fn get_deposit_needed(&self) -> Result<u64> {
        if self.prepaid || self.has_no_flow_payments() {
            Ok(0)
        } else if self.ends_at == 0 {
            Ok(DEPOSIT_AMOUNT_PERIOD
                .checked_mul(self.flow_rate)
                .ok_or(error!(StreamError::DepositAmountNeededOutOfBounds))?
                / self.flow_interval)
        } else {
            Ok(min(DEPOSIT_AMOUNT_PERIOD, self.ends_at - self.starts_at)
                .checked_mul(self.flow_rate)
                .ok_or(error!(StreamError::DepositAmountNeededOutOfBounds))?
                / self.flow_interval)
        }
    }

    fn get_stops_at(&self) -> u64 {
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

    pub fn has_stopped(&self, at: u64) -> bool {
        let stops_at = self.get_stops_at();
        return stops_at > 0 && at > stops_at;
    }

    fn get_before_stopped_at(&self, at: u64) -> u64 {
        let stops_at = self.get_stops_at();
        if stops_at > 0 && at > stops_at {
            // If the stream has been stopped for some reason - either ending or being cancelled -
            // make at = stopped_at if the stream stopped before at. This will make sure, the
            // amount is calculated only till the time the stream was active.
            stops_at
        } else {
            at
        }
    }

    // INVARIANT: at <= stops_at && at >= self.starts_at && !self.has_no_flow_payments()
    fn unsafe_get_active_time_after_start(&self, at: u64) -> Result<u64> {
        Ok(if self.paused {
            // INVARIANT: The stream is paused and was never resumed => accumulated time is the
            // total time.
            self.accumulated_active_time
        } else if self.last_resumed_at == 0 {
            // INVARIANT: The stream is not paused and was never resumed => stream was never
            // paused.
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

    pub fn get_amount_owed(&self, at: u64) -> Result<u64> {
        let at = self.get_before_stopped_at(at);

        Ok(if at < self.starts_at {
            0
        } else if self.has_no_flow_payments() {
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

    pub fn get_amount_available_to_withdraw(&self, amount_owed: u64) -> Result<u64> {
        require!(
            amount_owed >= self.total_withdrawn_amount,
            StreamError::WithdrawnAmountGreaterThanAmountOwed,
        );
        Ok(amount_owed - self.total_withdrawn_amount)
    }

    pub fn initialize(
        &mut self,
        prepaid: bool,
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
        seed: u64,
        bump: u8,
    ) -> Result<()> {
        require!(recipient != Pubkey::default(), StreamError::EmptyRecipient);
        require!(
            name.len() <= MAX_STREAM_NAME_LENGTH,
            StreamError::StreamNameTooLong,
        );
        require!(recipient != sender, StreamError::SameSenderAndRecipient);
        require!(flow_interval > 0, StreamError::ZeroFlowInterval);

        let now = get_current_timestamp()?;
        let starts_at = if starts_at < now { now } else { starts_at };

        require!(
            (!prepaid && ends_at == 0) || ends_at >= starts_at,
            StreamError::InvalidEndsAt,
        );

        let sender_can_cancel_at = if sender_can_cancel {
            min(sender_can_cancel_at, now)
        } else {
            0
        };
        let sender_can_change_sender_at = if sender_can_change_sender {
            min(sender_can_change_sender_at, now)
        } else {
            0
        };
        let sender_can_pause_at = if sender_can_pause {
            min(sender_can_pause_at, now)
        } else {
            0
        };
        let recipient_can_resume_pause_by_sender_at = if recipient_can_resume_pause_by_sender {
            min(recipient_can_resume_pause_by_sender_at, now)
        } else {
            0
        };

        self.prepaid = prepaid;
        self.paused = false;
        self.paused_by_sender = false;
        self.cancelled = false;
        self.mint = mint;
        self.sender = sender;
        self.recipient = recipient;
        self.name = name;
        self.created_at = now;
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

        require!(self.is_non_zero_amount(), StreamError::ZeroLifetimeAmount);
        Ok(())
    }

    pub fn initialize_prepaid(&mut self) -> Result<u64> {
        let prepaid_amount_needed = self.get_prepaid_amount_needed()?;
        require!(prepaid_amount_needed > 0, StreamError::ZeroLifetimeAmount);
        self.add_topup_amount(get_current_timestamp()?, prepaid_amount_needed)?;
        Ok(prepaid_amount_needed)
    }

    pub fn initialize_non_prepaid(&mut self, topup_amount: u64) -> Result<()> {
        require!(topup_amount > 0, StreamError::ZeroAmount);

        // Amount needed = cliff_amount + 2 * deposit_amount
        // We are doing 2 times deposit amount, because if it was just once, the stream would become
        // insolvent immediately.
        let amount_needed = self
            .initial_amount
            .checked_add(
                self.deposit_needed
                    .checked_mul(2)
                    .ok_or(error!(StreamError::DepositAmountNeededOutOfBounds))?,
            )
            .ok_or(error!(StreamError::DepositAmountNeededOutOfBounds))?;
        require!(
            topup_amount >= amount_needed,
            StreamError::AmountLessThanAmountNeeded,
        );
        self.add_topup_amount(get_current_timestamp()?, topup_amount - self.deposit_needed)
    }

    pub fn cancel(
        &mut self,
        key: Pubkey,
        signer: &Signer,
        recipient: Pubkey,
    ) -> Result<Option<CancelTransferParams>> {
        require!(!self.cancelled, StreamError::StreamAlreadyCancelled);

        let now = get_current_timestamp()?;
        self.cancelled = true;
        self.cancelled_at = now;

        let total_topup_amount = self.total_topup_amount;
        let amount_owed = self.get_amount_owed(now)?;
        if total_topup_amount < amount_owed {
            // The stream is insolvent. Anyone can cancel.
            if self.prepaid {
                msg!(
                    "Prepaid stream [{}] is insolvent. THIS SHOULD NEVER HAPPEN!!!",
                    key,
                );
                Ok(None)
            } else {
                // The deposit is given as reward to the signer. The remaining topup amount can be
                // withdrawn by the recipient.
                let transfer_amount = self.deposit_needed;
                self.deposit_needed = 0;
                Ok(Some(CancelTransferParams {
                    transfer_to_sender: false,
                    transfer_amount,
                }))
            }
        } else {
            // The stream is still solvent. Only the sender and recipient can cancel.
            let signer_key = signer.key();
            require!(
                signer_key == self.sender || signer_key == recipient,
                StreamError::UserUnauthorizedToCancel,
            );
            require!(
                signer_key != self.sender
                    || (self.sender_can_cancel && self.sender_can_cancel_at <= now),
                StreamError::SenderCannotCancel,
            );

            self.total_topup_amount = amount_owed;
            self.deposit_needed = 0;

            // Return anything the sender paid - topup or deposit that is not owed to the recipient.
            // The stream has been cancelled and stopped, so the deposit is no longer needed.
            let transfer_amount = total_topup_amount
                .checked_add(self.deposit_needed)
                .ok_or(error!(StreamError::CancellationRefundOutOfBounds))?
                - amount_owed;
            Ok(Some(CancelTransferParams {
                transfer_to_sender: true,
                transfer_amount,
            }))
        }
    }

    pub fn withdraw_excess_topup_non_prepaid_ended(&mut self) -> Result<u64> {
        require!(!self.cancelled, StreamError::StreamAlreadyCancelled);

        let now = get_current_timestamp()?;
        require!(
            self.ends_at > 0 && self.ends_at < now,
            StreamError::StreamNotEnded
        );

        let total_topup_amount = self.total_topup_amount;
        let amount_owed = self.get_amount_owed(now)?;
        Ok(if total_topup_amount < amount_owed {
            // The stream is insolvent. Nothing to do.
            0
        } else {
            self.total_topup_amount = amount_owed;
            self.deposit_needed = 0;

            total_topup_amount
                .checked_add(self.deposit_needed)
                .ok_or(error!(StreamError::CancellationRefundOutOfBounds))?
                - amount_owed
        })
    }

    pub fn topup_non_prepaid(&mut self, topup_amount: u64) -> Result<()> {
        require!(topup_amount > 0, StreamError::ZeroAmount);
        require!(!self.prepaid, StreamError::StreamIsPrepaid);
        require!(
            !self.has_no_flow_payments(),
            StreamError::StreamHasNoFlowPayments,
        );

        let now = get_current_timestamp()?;
        require!(!self.has_stopped(now), StreamError::StreamHasStopped,);

        self.add_topup_amount(get_current_timestamp()?, topup_amount)
    }

    pub fn change_sender_non_prepaid(&mut self, sender: &Signer, new_sender: Pubkey) -> Result<()> {
        require!(!self.prepaid, StreamError::StreamIsPrepaid);
        require!(sender.key() == self.sender, StreamError::InvalidSender);
        require!(
            new_sender != Pubkey::default(),
            StreamError::InvalidNewSender,
        );
        require!(new_sender != self.sender, StreamError::SameSenders);

        let now = get_current_timestamp()?;
        require!(
            self.sender_can_change_sender && self.sender_can_change_sender_at <= now,
            StreamError::SenderCannotChangeSender
        );
        require!(!self.has_stopped(now), StreamError::StreamHasStopped,);

        self.sender = new_sender;
        Ok(())
    }

    pub fn withdraw_and_change_recipient(
        &mut self,
        recipient: Pubkey,
        new_recipient: Pubkey,
    ) -> Result<u64> {
        require!(recipient == self.recipient, StreamError::InvalidRecipient);

        let total_topup_amount = self.total_topup_amount;

        let now = get_current_timestamp()?;
        let mut amount_owed = self.get_amount_owed(now)?;
        if amount_owed > total_topup_amount {
            // The stream is insolvent. Cancel the stream if not already cancelled and recipient is
            // owed the whole topup amount and if the stream is not cancelled yet, also the deposit
            // amount.
            amount_owed = if self.cancelled {
                total_topup_amount
            } else {
                self.cancelled = true;
                self.cancelled_at = now;
                total_topup_amount
                    .checked_add(self.deposit_needed)
                    .ok_or(error!(StreamError::WithdrawAmountOutOfBounds))?
            }
        }

        let amount_available_to_withdraw = self.get_amount_available_to_withdraw(amount_owed)?;
        self.add_withdrawn_amount(now, amount_available_to_withdraw)?;
        if !self.cancelled && new_recipient != Pubkey::default() {
            require!(new_recipient != self.recipient, StreamError::SameRecipients);
            self.recipient = new_recipient;
        }

        Ok(amount_available_to_withdraw)
    }

    pub fn pause_non_prepaid(&mut self, signer: &Signer) -> Result<()> {
        require!(!self.prepaid, StreamError::StreamIsPrepaid);
        require!(!self.paused, StreamError::StreamIsPaused);
        require!(
            !self.has_no_flow_payments(),
            StreamError::StreamHasNoFlowPayments
        );

        let signer_key = signer.key();
        let is_sender = signer_key == self.sender;
        let is_recipient = signer_key == self.recipient;
        require!(
            is_sender || is_recipient,
            StreamError::UserUnauthorizedToPause
        );

        let now = get_current_timestamp()?;
        require!(
            is_recipient || (self.sender_can_pause && self.sender_can_pause_at <= now),
            StreamError::SenderCannotPause
        );

        require!(!self.has_stopped(now), StreamError::StreamHasStopped,);

        // Update accumulated_active_time if there has been any flow till now.
        if now > self.starts_at {
            self.accumulated_active_time = self.unsafe_get_active_time_after_start(now)?;
        }

        self.paused = true;
        self.paused_by_sender = is_sender;

        Ok(())
    }

    pub fn resume_non_prepaid(&mut self, signer: &Signer) -> Result<()> {
        require!(!self.prepaid, StreamError::StreamIsPrepaid);
        require!(self.paused, StreamError::StreamIsNotPaused);

        let signer_key = signer.key();
        let is_sender = signer_key == self.sender;
        let is_recipient = signer_key == self.recipient;
        require!(
            is_sender || is_recipient,
            StreamError::UserUnauthorizedToResume
        );

        let now = get_current_timestamp()?;
        require!(
            is_sender
                || !self.paused_by_sender
                || (self.recipient_can_resume_pause_by_sender
                    && self.recipient_can_resume_pause_by_sender_at <= now),
            StreamError::RecipientCannotResumePauseBySender
        );

        require!(!self.has_stopped(now), StreamError::StreamHasStopped,);

        self.paused = false;
        self.paused_by_sender = false;

        // Update last_resumed_at if there has been any flow till now.
        if now > self.starts_at {
            self.last_resumed_at = now;
        }

        Ok(())
    }

    pub fn add_withdrawn_amount(&mut self, now: u64, latest_withdrawn_amount: u64) -> Result<()> {
        self.total_withdrawn_amount = self
            .total_withdrawn_amount
            .checked_add(latest_withdrawn_amount)
            .ok_or(error!(StreamError::WithdrawAmountOutOfBounds))?;
        self.last_withdrawn_at = now;
        self.last_withdrawn_amount = latest_withdrawn_amount;
        Ok(())
    }

    pub fn add_topup_amount(&mut self, now: u64, latest_topup_amount: u64) -> Result<()> {
        self.total_topup_amount = self
            .total_topup_amount
            .checked_add(latest_topup_amount)
            .ok_or(error!(StreamError::TopupAmountOutOfBounds))?;
        self.last_topup_at = now;
        self.last_topup_amount = latest_topup_amount;
        Ok(())
    }
}

pub struct CancelTransferParams {
    pub transfer_to_sender: bool,
    pub transfer_amount: u64,
}
