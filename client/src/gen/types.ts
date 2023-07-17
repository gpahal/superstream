export type Superstream = {
  "version": "0.3.3",
  "name": "superstream",
  "docs": [
    "Module for superstream cpi methods and other utilities."
  ],
  "instructions": [
    {
      "name": "createPrepaid",
      "docs": [
        "Create a new prepaid stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account. This is initialized by the program."
          ]
        },
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Stream sender wallet."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "senderToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the sender."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Solana system program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        },
        {
          "name": "startsAt",
          "type": "u64"
        },
        {
          "name": "endsAt",
          "type": "u64"
        },
        {
          "name": "initialAmount",
          "type": "u64"
        },
        {
          "name": "flowInterval",
          "type": "u64"
        },
        {
          "name": "flowRate",
          "type": "u64"
        },
        {
          "name": "senderCanCancel",
          "type": "bool"
        },
        {
          "name": "senderCanCancelAt",
          "type": "u64"
        },
        {
          "name": "senderCanChangeSender",
          "type": "bool"
        },
        {
          "name": "senderCanChangeSenderAt",
          "type": "u64"
        },
        {
          "name": "senderCanPause",
          "type": "bool"
        },
        {
          "name": "senderCanPauseAt",
          "type": "u64"
        },
        {
          "name": "recipientCanResumePauseBySender",
          "type": "bool"
        },
        {
          "name": "recipientCanResumePauseBySenderAt",
          "type": "u64"
        },
        {
          "name": "anyoneCanWithdrawForRecipient",
          "type": "bool"
        },
        {
          "name": "anyoneCanWithdrawForRecipientAt",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createNonPrepaid",
      "docs": [
        "Create a new non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "* `topup_amount` - Initial topup amount for the stream. The topup amount should be >= minimum deposit required.",
        "See [`DEPOSIT_AMOUNT_PERIOD_IN_SECS`](crate::state::DEPOSIT_AMOUNT_PERIOD_IN_SECS) for more information.",
        "",
        "For more information on the other arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account. This is initialized by the program."
          ]
        },
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Stream sender wallet."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "senderToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the sender."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Solana system program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        },
        {
          "name": "startsAt",
          "type": "u64"
        },
        {
          "name": "endsAt",
          "type": "u64"
        },
        {
          "name": "initialAmount",
          "type": "u64"
        },
        {
          "name": "flowInterval",
          "type": "u64"
        },
        {
          "name": "flowRate",
          "type": "u64"
        },
        {
          "name": "senderCanCancel",
          "type": "bool"
        },
        {
          "name": "senderCanCancelAt",
          "type": "u64"
        },
        {
          "name": "senderCanChangeSender",
          "type": "bool"
        },
        {
          "name": "senderCanChangeSenderAt",
          "type": "u64"
        },
        {
          "name": "senderCanPause",
          "type": "bool"
        },
        {
          "name": "senderCanPauseAt",
          "type": "u64"
        },
        {
          "name": "recipientCanResumePauseBySender",
          "type": "bool"
        },
        {
          "name": "recipientCanResumePauseBySenderAt",
          "type": "u64"
        },
        {
          "name": "anyoneCanWithdrawForRecipient",
          "type": "bool"
        },
        {
          "name": "anyoneCanWithdrawForRecipientAt",
          "type": "u64"
        },
        {
          "name": "topupAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancel",
      "docs": [
        "Cancel a stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Either the sender or the receiver can cancel the stream till it's solvent. After insolvency,",
            "anyone can cancel."
          ]
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Stream sender account.",
            "",
            "to the stream sender."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "signerToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the signer."
          ]
        },
        {
          "name": "senderToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the sender."
          ]
        },
        {
          "name": "recipientToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the recipient."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "withdrawExcessTopupNonPrepaidEnded",
      "docs": [
        "Withdraw excess sender topup from a non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet."
          ]
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Stream sender account.",
            "",
            "to the stream sender."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "senderToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the sender."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "topupNonPrepaid",
      "docs": [
        "Topup a non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "* `topup_amount` - Topup amount for the stream. The topup amount should be <= maximum acceptable topup amount.",
        "",
        "For more information on the other arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Anyone can topup a stream. But the refund when the stream gets cancelled will only go to the",
            "stream sender."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "signerToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the signer."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "topupAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeSenderNonPrepaid",
      "docs": [
        "Change sender of a non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "* `new_sender` - The new sender",
        "",
        "For more information on the other arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "newSender",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "withdraw",
      "docs": [
        "Withdraw recipient funds from a stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Anybody can call the withdraw method. The recipient of the withdrawn amount is not related to the",
            "signer. Recipient is passed as an argument, based on which the stream PDA is accessed, so if a malicious user",
            "tries to send themselves as a recipient, but a different stream account, the constraint for the stream account",
            "will fail."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "recipientToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the recipient."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "withdrawAndChangeRecipient",
      "docs": [
        "Withdraw recipient funds from a stream and change recipient of a stream.",
        "",
        "# Arguments",
        "",
        "* `new_recipient` - The new recipient",
        "",
        "For more information on the other arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Anybody can call the withdraw method. The recipient of the withdrawn amount is not related to the",
            "signer. Recipient is passed as an argument, based on which the stream PDA is accessed, so if a malicious user",
            "tries to send themselves as a recipient, but a different stream account, the constraint for the stream account",
            "will fail."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "recipientToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the recipient."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        },
        {
          "name": "newRecipient",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "pauseNonPrepaid",
      "docs": [
        "Pause a non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Signer needs to be either the sender (if they are allowed to) or the recipient."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "resumeNonPrepaid",
      "docs": [
        "Resume a non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Signer needs to be either the sender (if they are allowed to) or the recipient (exception is if",
            "the stream was paused by the sender and recipient is not allowed to resume a stream paused by sender)."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "stream",
      "docs": [
        "A payment stream with support for SPL tokens, prepaid and limited upfront payment, unlimited lifetime, cliffs and",
        "cancellations.",
        "",
        "Possible states of a stream:",
        "- Not started",
        "- Scheduled",
        "- Cancelled before start",
        "- Started but not stopped",
        "- Streaming",
        "- Paused",
        "- Stopped",
        "- Cancelled after start",
        "- Ended"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isPrepaid",
            "docs": [
              "If true, the stream is prepaid - all the required amount needs to be deposited on creation. Prepaid streams",
              "cannot have unlimited lifetime."
            ],
            "type": "bool"
          },
          {
            "name": "mint",
            "docs": [
              "SPL token mint address."
            ],
            "type": "publicKey"
          },
          {
            "name": "sender",
            "docs": [
              "Sender address."
            ],
            "type": "publicKey"
          },
          {
            "name": "recipient",
            "docs": [
              "Recipient address."
            ],
            "type": "publicKey"
          },
          {
            "name": "createdAt",
            "docs": [
              "Time at which the stream was created."
            ],
            "type": "u64"
          },
          {
            "name": "startsAt",
            "docs": [
              "Start time of the stream.",
              "",
              "INVARIANT: >= created_at"
            ],
            "type": "u64"
          },
          {
            "name": "endsAt",
            "docs": [
              "End time of the stream. If the stream is unbounded, this can be 0 to indicate no end time.",
              "",
              "INVARIANT: prepaid: >= starts_at",
              "INVARIANT: unbounded: == 0 || >= starts_at"
            ],
            "type": "u64"
          },
          {
            "name": "initialAmount",
            "docs": [
              "Amount available to the recipient once stream starts."
            ],
            "type": "u64"
          },
          {
            "name": "flowInterval",
            "docs": [
              "Flow interval is the interval in which flow payments are released."
            ],
            "type": "u64"
          },
          {
            "name": "flowRate",
            "docs": [
              "Flow rate is the number of tokens to stream per interval."
            ],
            "type": "u64"
          },
          {
            "name": "isCancelled",
            "docs": [
              "If true, the stream has been cancelled."
            ],
            "type": "bool"
          },
          {
            "name": "isCancelledBeforeStart",
            "docs": [
              "If true, the stream has been cancelled before start.",
              "",
              "INVARIANT: !is_cancelled => == false"
            ],
            "type": "bool"
          },
          {
            "name": "isCancelledBySender",
            "docs": [
              "If true, the stream has been cancelled by the sender.",
              "",
              "INVARIANT: !is_cancelled || !sender_can_cancel => == false"
            ],
            "type": "bool"
          },
          {
            "name": "cancelledAt",
            "docs": [
              "Time at which the stream was cancelled. If it is > 0, it means the stream has been cancelled and any funds in",
              "the escrow account not available to be withdrawn by the recipient have been retrieved.",
              "",
              "INVARIANT: cancelled_at > 0 iff is_cancelled == true"
            ],
            "type": "u64"
          },
          {
            "name": "senderCanCancel",
            "docs": [
              "True if a solvent stream can be cancelled by the sender."
            ],
            "type": "bool"
          },
          {
            "name": "senderCanCancelAt",
            "docs": [
              "Time at which the sender is allowed to cancel a solvent stream."
            ],
            "type": "u64"
          },
          {
            "name": "senderCanChangeSender",
            "docs": [
              "True if the sender can change the sender of the stream who will do the upcoming topups.",
              "",
              "INVARIANT: prepaid: false"
            ],
            "type": "bool"
          },
          {
            "name": "senderCanChangeSenderAt",
            "docs": [
              "Time at which the sender is allowed to change the sender.",
              "",
              "INVARIANT: prepaid: == 0"
            ],
            "type": "u64"
          },
          {
            "name": "isPaused",
            "docs": [
              "If true, the stream is paused.",
              "",
              "INVARIANT: prepaid: == false"
            ],
            "type": "bool"
          },
          {
            "name": "isPausedBySender",
            "docs": [
              "If true, the stream is paused by sender.",
              "",
              "INVARIANT: prepaid: == false",
              "INVARIANT: runtime: unbounded: !is_paused || !sender_can_pause => == false"
            ],
            "type": "bool"
          },
          {
            "name": "senderCanPause",
            "docs": [
              "True if a stream can be paused by the sender.",
              "",
              "INVARIANT: prepaid: false"
            ],
            "type": "bool"
          },
          {
            "name": "senderCanPauseAt",
            "docs": [
              "Time at which the sender is allowed to pause a stream.",
              "",
              "INVARIANT: prepaid: == 0"
            ],
            "type": "u64"
          },
          {
            "name": "recipientCanResumePauseBySender",
            "docs": [
              "True if a stream can be resumed by the recipient if it was paused by the sender.",
              "",
              "INVARIANT: prepaid: false"
            ],
            "type": "bool"
          },
          {
            "name": "recipientCanResumePauseBySenderAt",
            "docs": [
              "Time at which the recipient is allowed to resume a stream which was paused by the sender.",
              "",
              "INVARIANT: prepaid: == 0"
            ],
            "type": "u64"
          },
          {
            "name": "anyoneCanWithdrawForRecipient",
            "docs": [
              "True if anyone can withdraw on behalf of the recipient. The amount will go in recipients' account."
            ],
            "type": "bool"
          },
          {
            "name": "anyoneCanWithdrawForRecipientAt",
            "docs": [
              "Time at which anyone can withdraw on behalf of the recipient."
            ],
            "type": "u64"
          },
          {
            "name": "lastResumedAt",
            "docs": [
              "Time at which the stream was last resumed.",
              "",
              "INVARIANT: prepaid: == 0",
              "INVARIANT: unbounded: (== 0 || >= starts_at) && (ends_at == 0 || < ends_at)"
            ],
            "type": "u64"
          },
          {
            "name": "accumulatedActiveTime",
            "docs": [
              "Total accumulated active (!is_paused) time since starts_at. This does not include (current_time -",
              "last_resumed_at) time if the stream is not paused.",
              "",
              "INVARIANT: prepaid: == 0",
              "INVARIANT: unbounded: == 0 || (current_time > starts_at && == current_time - starts_at - total_paused_time)"
            ],
            "type": "u64"
          },
          {
            "name": "totalWithdrawnAmount",
            "docs": [
              "Total amount withdrawn by the recipient.",
              "",
              "INVARIANT: runtime: prepaid: <= amount_owed && <= prepaid_amount_needed",
              "INVARIANT: runtime: unbounded: <= amount_owed && <= total_topup_amount"
            ],
            "type": "u64"
          },
          {
            "name": "lastWithdrawnAt",
            "docs": [
              "Last time at which recipient withdrew any amount."
            ],
            "type": "u64"
          },
          {
            "name": "lastWithdrawnAmount",
            "docs": [
              "Last amount which recipient withdrew."
            ],
            "type": "u64"
          },
          {
            "name": "totalTopupAmount",
            "docs": [
              "Total topup amount added for the stream.",
              "",
              "INVARIANT: prepaid: == total_prepaid_amount",
              "INVARIANT: unbounded: >= initial_amount + streaming_amount_owed"
            ],
            "type": "u64"
          },
          {
            "name": "lastTopupAt",
            "docs": [
              "Last time at which sender topped up the stream."
            ],
            "type": "u64"
          },
          {
            "name": "lastTopupAmount",
            "docs": [
              "Last topup amount."
            ],
            "type": "u64"
          },
          {
            "name": "depositNeeded",
            "docs": [
              "Total deposit amount needed for the non-prepaid stream. These are needed in case the sender does not topup the",
              "stream in time and the amount owed becomes > total topup amount. When that happens, anyone can cancel the",
              "stream. The deposit amount will be distributed as a reward to whoever finds the insolvency and cancels the",
              "stream.",
              "",
              "INVARIANT: prepaid: == 0",
              "INVARIANT: unbounded: == DEPOSIT_AMOUNT_PERIOD_IN_SECS of streaming payments"
            ],
            "type": "u64"
          },
          {
            "name": "reserved",
            "docs": [
              "Extra space for program upgrades."
            ],
            "type": {
              "array": [
                "u64",
                16
              ]
            }
          },
          {
            "name": "seed",
            "docs": [
              "Seed of the stream PDA. It's upto the client how they choose the seed. Each tuple (seed, mint, name) corresponds",
              "to a unique stream."
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "The PDA bump."
            ],
            "type": "u8"
          },
          {
            "name": "name",
            "docs": [
              "Name of the stream. Should be unique for a particular set of (seed, mint).",
              "",
              "INVARIANT: Length <= 100 unicode chars or 400 bytes"
            ],
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EmptyRecipient",
      "msg": "The stream recipient is empty. Should be a valid address"
    },
    {
      "code": 6001,
      "name": "SameSenderAndRecipient",
      "msg": "The stream recipient is the same as the sender. Should be different addresses"
    },
    {
      "code": 6002,
      "name": "SameSenders",
      "msg": "The stream sender is the same as the new sender. Should be different addresses"
    },
    {
      "code": 6003,
      "name": "SameRecipients",
      "msg": "The stream recipient is the same as the new recipient. Should be different addresses"
    },
    {
      "code": 6004,
      "name": "InvalidNewSender",
      "msg": "The new sender is invalid"
    },
    {
      "code": 6005,
      "name": "InvalidSender",
      "msg": "The sender is invalid"
    },
    {
      "code": 6006,
      "name": "InvalidRecipient",
      "msg": "The recipient is invalid"
    },
    {
      "code": 6007,
      "name": "StreamNameTooShort",
      "msg": "The stream name is too short. Should be >= 2 chars"
    },
    {
      "code": 6008,
      "name": "StreamNameTooLong",
      "msg": "The stream name is too long. Should be <= 100 chars"
    },
    {
      "code": 6009,
      "name": "ZeroFlowInterval",
      "msg": "The flow interval is 0. Should be > 0"
    },
    {
      "code": 6010,
      "name": "InvalidEndsAt",
      "msg": "The end time is either 0 with prepaid = true, in the past or < starts_at. Should be >= current_time and >= starts_at or if the stream is not prepaid, it can be 0"
    },
    {
      "code": 6011,
      "name": "ZeroLifetimeAmount",
      "msg": "The stream will never lead to any payments. Either there should be a initial amount or flow rate and flow duration should be > 0"
    },
    {
      "code": 6012,
      "name": "ZeroAmount",
      "msg": "The amount cannot be 0. Should be > 0"
    },
    {
      "code": 6013,
      "name": "PrepaidAmountNeededOutOfBounds",
      "msg": "The prepaid amount needed by the stream is out of bounds"
    },
    {
      "code": 6014,
      "name": "DepositAmountNeededOutOfBounds",
      "msg": "The deposit amount needed by the non-prepaid stream is out of bounds"
    },
    {
      "code": 6015,
      "name": "AmountLessThanAmountNeeded",
      "msg": "The amount is less than the minimum initial amount needed"
    },
    {
      "code": 6016,
      "name": "UserUnauthorizedToWithdraw",
      "msg": "The user is not allowed to withdraw. Should be the recipient of the stream"
    },
    {
      "code": 6017,
      "name": "WithdrawnAmountGreaterThanAmountOwed",
      "msg": "The withdrawn amount by recipient is more than the amount owed. THIS SHOULD NOT HAVE HAPPENED!!!"
    },
    {
      "code": 6018,
      "name": "WithdrawAmountOutOfBounds",
      "msg": "The total withdrawn amount by the recipient of the stream is out of bounds"
    },
    {
      "code": 6019,
      "name": "AmountAvailableToWithdrawOutOfBounds",
      "msg": "The amount available to be withdrawn by the recipient of the stream is out of bounds"
    },
    {
      "code": 6020,
      "name": "CancellationRefundOutOfBounds",
      "msg": "The cancellation refund amount to the sender of the stream is out of bounds"
    },
    {
      "code": 6021,
      "name": "TopupAmountOutOfBounds",
      "msg": "The total topup amount by the sender of the stream is out of bounds"
    },
    {
      "code": 6022,
      "name": "TopupAmountMoreThanMaxAcceptable",
      "msg": "The topup amount is more than what is needed by the stream"
    },
    {
      "code": 6023,
      "name": "SenderInsufficientFunds",
      "msg": "The sender has insufficient balance in their token account"
    },
    {
      "code": 6024,
      "name": "EscrowInsufficientFunds",
      "msg": "The token escrow account has insufficient balance. THIS SHOULD NOT HAVE HAPPENED!!!"
    },
    {
      "code": 6025,
      "name": "EscrowNotRentExempt",
      "msg": "The token escrow account is not rent exempt"
    },
    {
      "code": 6026,
      "name": "StreamAlreadyCancelled",
      "msg": "The stream has already been cancelled"
    },
    {
      "code": 6027,
      "name": "UserUnauthorizedToCancel",
      "msg": "The user is not allowed to cancel. Should be the sender or the recipient of the stream"
    },
    {
      "code": 6028,
      "name": "SenderCannotCancel",
      "msg": "The sender is not allowed to cancel permanently or at the moment"
    },
    {
      "code": 6029,
      "name": "StreamIsPrepaid",
      "msg": "The stream is prepaid. Should be a non-prepaid stream"
    },
    {
      "code": 6030,
      "name": "StreamHasStopped",
      "msg": "The stream has already stopped. Should be an unstopped stream"
    },
    {
      "code": 6031,
      "name": "StreamIsPaused",
      "msg": "The stream is already paused. Should be a non-paused stream"
    },
    {
      "code": 6032,
      "name": "StreamIsNotPaused",
      "msg": "The stream is not paused. Should be a paused stream"
    },
    {
      "code": 6033,
      "name": "StreamHasNoFlowPayments",
      "msg": "The stream has no flow payments. Should be a stream stream with a positive flow rate and flow period"
    },
    {
      "code": 6034,
      "name": "SenderCannotChangeSender",
      "msg": "The sender is not allowed to change sender of the stream permanently or at the moment"
    },
    {
      "code": 6035,
      "name": "SenderCannotPause",
      "msg": "The sender is not allowed to pause stream permanently or at the moment"
    },
    {
      "code": 6036,
      "name": "RecipientCannotResumePauseBySender",
      "msg": "The recipient is not allowed resume a stream paused by sender permanently or at the moment"
    },
    {
      "code": 6037,
      "name": "UserUnauthorizedToPause",
      "msg": "The user is not allowed to pause. Should be the sender or the recipient of the stream"
    },
    {
      "code": 6038,
      "name": "UserUnauthorizedToResume",
      "msg": "The user is not allowed to resume. Should be the sender or the recipient of the stream"
    },
    {
      "code": 6039,
      "name": "StreamNotEnded",
      "msg": "The stream has not ended. Should have ended and nat been cancelled"
    }
  ]
};

export const IDL: Superstream = {
  "version": "0.3.3",
  "name": "superstream",
  "docs": [
    "Module for superstream cpi methods and other utilities."
  ],
  "instructions": [
    {
      "name": "createPrepaid",
      "docs": [
        "Create a new prepaid stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account. This is initialized by the program."
          ]
        },
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Stream sender wallet."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "senderToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the sender."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Solana system program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        },
        {
          "name": "startsAt",
          "type": "u64"
        },
        {
          "name": "endsAt",
          "type": "u64"
        },
        {
          "name": "initialAmount",
          "type": "u64"
        },
        {
          "name": "flowInterval",
          "type": "u64"
        },
        {
          "name": "flowRate",
          "type": "u64"
        },
        {
          "name": "senderCanCancel",
          "type": "bool"
        },
        {
          "name": "senderCanCancelAt",
          "type": "u64"
        },
        {
          "name": "senderCanChangeSender",
          "type": "bool"
        },
        {
          "name": "senderCanChangeSenderAt",
          "type": "u64"
        },
        {
          "name": "senderCanPause",
          "type": "bool"
        },
        {
          "name": "senderCanPauseAt",
          "type": "u64"
        },
        {
          "name": "recipientCanResumePauseBySender",
          "type": "bool"
        },
        {
          "name": "recipientCanResumePauseBySenderAt",
          "type": "u64"
        },
        {
          "name": "anyoneCanWithdrawForRecipient",
          "type": "bool"
        },
        {
          "name": "anyoneCanWithdrawForRecipientAt",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createNonPrepaid",
      "docs": [
        "Create a new non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "* `topup_amount` - Initial topup amount for the stream. The topup amount should be >= minimum deposit required.",
        "See [`DEPOSIT_AMOUNT_PERIOD_IN_SECS`](crate::state::DEPOSIT_AMOUNT_PERIOD_IN_SECS) for more information.",
        "",
        "For more information on the other arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account. This is initialized by the program."
          ]
        },
        {
          "name": "sender",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Stream sender wallet."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "senderToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the sender."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Solana system program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        },
        {
          "name": "startsAt",
          "type": "u64"
        },
        {
          "name": "endsAt",
          "type": "u64"
        },
        {
          "name": "initialAmount",
          "type": "u64"
        },
        {
          "name": "flowInterval",
          "type": "u64"
        },
        {
          "name": "flowRate",
          "type": "u64"
        },
        {
          "name": "senderCanCancel",
          "type": "bool"
        },
        {
          "name": "senderCanCancelAt",
          "type": "u64"
        },
        {
          "name": "senderCanChangeSender",
          "type": "bool"
        },
        {
          "name": "senderCanChangeSenderAt",
          "type": "u64"
        },
        {
          "name": "senderCanPause",
          "type": "bool"
        },
        {
          "name": "senderCanPauseAt",
          "type": "u64"
        },
        {
          "name": "recipientCanResumePauseBySender",
          "type": "bool"
        },
        {
          "name": "recipientCanResumePauseBySenderAt",
          "type": "u64"
        },
        {
          "name": "anyoneCanWithdrawForRecipient",
          "type": "bool"
        },
        {
          "name": "anyoneCanWithdrawForRecipientAt",
          "type": "u64"
        },
        {
          "name": "topupAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancel",
      "docs": [
        "Cancel a stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Either the sender or the receiver can cancel the stream till it's solvent. After insolvency,",
            "anyone can cancel."
          ]
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Stream sender account.",
            "",
            "to the stream sender."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "signerToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the signer."
          ]
        },
        {
          "name": "senderToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the sender."
          ]
        },
        {
          "name": "recipientToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the recipient."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "withdrawExcessTopupNonPrepaidEnded",
      "docs": [
        "Withdraw excess sender topup from a non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet."
          ]
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "Stream sender account.",
            "",
            "to the stream sender."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "senderToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the sender."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "topupNonPrepaid",
      "docs": [
        "Topup a non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "* `topup_amount` - Topup amount for the stream. The topup amount should be <= maximum acceptable topup amount.",
        "",
        "For more information on the other arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Anyone can topup a stream. But the refund when the stream gets cancelled will only go to the",
            "stream sender."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "signerToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the signer."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "topupAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "changeSenderNonPrepaid",
      "docs": [
        "Change sender of a non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "* `new_sender` - The new sender",
        "",
        "For more information on the other arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "newSender",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "withdraw",
      "docs": [
        "Withdraw recipient funds from a stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Anybody can call the withdraw method. The recipient of the withdrawn amount is not related to the",
            "signer. Recipient is passed as an argument, based on which the stream PDA is accessed, so if a malicious user",
            "tries to send themselves as a recipient, but a different stream account, the constraint for the stream account",
            "will fail."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "recipientToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the recipient."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "withdrawAndChangeRecipient",
      "docs": [
        "Withdraw recipient funds from a stream and change recipient of a stream.",
        "",
        "# Arguments",
        "",
        "* `new_recipient` - The new recipient",
        "",
        "For more information on the other arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Anybody can call the withdraw method. The recipient of the withdrawn amount is not related to the",
            "signer. Recipient is passed as an argument, based on which the stream PDA is accessed, so if a malicious user",
            "tries to send themselves as a recipient, but a different stream account, the constraint for the stream account",
            "will fail."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        },
        {
          "name": "recipientToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token account of the recipient."
          ]
        },
        {
          "name": "escrowToken",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Associated token escrow account holding the funds for this stream."
          ]
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token program."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "recipient",
          "type": "publicKey"
        },
        {
          "name": "newRecipient",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "pauseNonPrepaid",
      "docs": [
        "Pause a non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Signer needs to be either the sender (if they are allowed to) or the recipient."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "resumeNonPrepaid",
      "docs": [
        "Resume a non-prepaid stream.",
        "",
        "# Arguments",
        "",
        "For more information on the arguments, see fields of the [`Stream`] struct."
      ],
      "accounts": [
        {
          "name": "stream",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Stream PDA account."
          ]
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "Signer wallet. Signer needs to be either the sender (if they are allowed to) or the recipient (exception is if",
            "the stream was paused by the sender and recipient is not allowed to resume a stream paused by sender)."
          ]
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "SPL token mint account."
          ]
        }
      ],
      "args": [
        {
          "name": "seed",
          "type": "u64"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "stream",
      "docs": [
        "A payment stream with support for SPL tokens, prepaid and limited upfront payment, unlimited lifetime, cliffs and",
        "cancellations.",
        "",
        "Possible states of a stream:",
        "- Not started",
        "- Scheduled",
        "- Cancelled before start",
        "- Started but not stopped",
        "- Streaming",
        "- Paused",
        "- Stopped",
        "- Cancelled after start",
        "- Ended"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isPrepaid",
            "docs": [
              "If true, the stream is prepaid - all the required amount needs to be deposited on creation. Prepaid streams",
              "cannot have unlimited lifetime."
            ],
            "type": "bool"
          },
          {
            "name": "mint",
            "docs": [
              "SPL token mint address."
            ],
            "type": "publicKey"
          },
          {
            "name": "sender",
            "docs": [
              "Sender address."
            ],
            "type": "publicKey"
          },
          {
            "name": "recipient",
            "docs": [
              "Recipient address."
            ],
            "type": "publicKey"
          },
          {
            "name": "createdAt",
            "docs": [
              "Time at which the stream was created."
            ],
            "type": "u64"
          },
          {
            "name": "startsAt",
            "docs": [
              "Start time of the stream.",
              "",
              "INVARIANT: >= created_at"
            ],
            "type": "u64"
          },
          {
            "name": "endsAt",
            "docs": [
              "End time of the stream. If the stream is unbounded, this can be 0 to indicate no end time.",
              "",
              "INVARIANT: prepaid: >= starts_at",
              "INVARIANT: unbounded: == 0 || >= starts_at"
            ],
            "type": "u64"
          },
          {
            "name": "initialAmount",
            "docs": [
              "Amount available to the recipient once stream starts."
            ],
            "type": "u64"
          },
          {
            "name": "flowInterval",
            "docs": [
              "Flow interval is the interval in which flow payments are released."
            ],
            "type": "u64"
          },
          {
            "name": "flowRate",
            "docs": [
              "Flow rate is the number of tokens to stream per interval."
            ],
            "type": "u64"
          },
          {
            "name": "isCancelled",
            "docs": [
              "If true, the stream has been cancelled."
            ],
            "type": "bool"
          },
          {
            "name": "isCancelledBeforeStart",
            "docs": [
              "If true, the stream has been cancelled before start.",
              "",
              "INVARIANT: !is_cancelled => == false"
            ],
            "type": "bool"
          },
          {
            "name": "isCancelledBySender",
            "docs": [
              "If true, the stream has been cancelled by the sender.",
              "",
              "INVARIANT: !is_cancelled || !sender_can_cancel => == false"
            ],
            "type": "bool"
          },
          {
            "name": "cancelledAt",
            "docs": [
              "Time at which the stream was cancelled. If it is > 0, it means the stream has been cancelled and any funds in",
              "the escrow account not available to be withdrawn by the recipient have been retrieved.",
              "",
              "INVARIANT: cancelled_at > 0 iff is_cancelled == true"
            ],
            "type": "u64"
          },
          {
            "name": "senderCanCancel",
            "docs": [
              "True if a solvent stream can be cancelled by the sender."
            ],
            "type": "bool"
          },
          {
            "name": "senderCanCancelAt",
            "docs": [
              "Time at which the sender is allowed to cancel a solvent stream."
            ],
            "type": "u64"
          },
          {
            "name": "senderCanChangeSender",
            "docs": [
              "True if the sender can change the sender of the stream who will do the upcoming topups.",
              "",
              "INVARIANT: prepaid: false"
            ],
            "type": "bool"
          },
          {
            "name": "senderCanChangeSenderAt",
            "docs": [
              "Time at which the sender is allowed to change the sender.",
              "",
              "INVARIANT: prepaid: == 0"
            ],
            "type": "u64"
          },
          {
            "name": "isPaused",
            "docs": [
              "If true, the stream is paused.",
              "",
              "INVARIANT: prepaid: == false"
            ],
            "type": "bool"
          },
          {
            "name": "isPausedBySender",
            "docs": [
              "If true, the stream is paused by sender.",
              "",
              "INVARIANT: prepaid: == false",
              "INVARIANT: runtime: unbounded: !is_paused || !sender_can_pause => == false"
            ],
            "type": "bool"
          },
          {
            "name": "senderCanPause",
            "docs": [
              "True if a stream can be paused by the sender.",
              "",
              "INVARIANT: prepaid: false"
            ],
            "type": "bool"
          },
          {
            "name": "senderCanPauseAt",
            "docs": [
              "Time at which the sender is allowed to pause a stream.",
              "",
              "INVARIANT: prepaid: == 0"
            ],
            "type": "u64"
          },
          {
            "name": "recipientCanResumePauseBySender",
            "docs": [
              "True if a stream can be resumed by the recipient if it was paused by the sender.",
              "",
              "INVARIANT: prepaid: false"
            ],
            "type": "bool"
          },
          {
            "name": "recipientCanResumePauseBySenderAt",
            "docs": [
              "Time at which the recipient is allowed to resume a stream which was paused by the sender.",
              "",
              "INVARIANT: prepaid: == 0"
            ],
            "type": "u64"
          },
          {
            "name": "anyoneCanWithdrawForRecipient",
            "docs": [
              "True if anyone can withdraw on behalf of the recipient. The amount will go in recipients' account."
            ],
            "type": "bool"
          },
          {
            "name": "anyoneCanWithdrawForRecipientAt",
            "docs": [
              "Time at which anyone can withdraw on behalf of the recipient."
            ],
            "type": "u64"
          },
          {
            "name": "lastResumedAt",
            "docs": [
              "Time at which the stream was last resumed.",
              "",
              "INVARIANT: prepaid: == 0",
              "INVARIANT: unbounded: (== 0 || >= starts_at) && (ends_at == 0 || < ends_at)"
            ],
            "type": "u64"
          },
          {
            "name": "accumulatedActiveTime",
            "docs": [
              "Total accumulated active (!is_paused) time since starts_at. This does not include (current_time -",
              "last_resumed_at) time if the stream is not paused.",
              "",
              "INVARIANT: prepaid: == 0",
              "INVARIANT: unbounded: == 0 || (current_time > starts_at && == current_time - starts_at - total_paused_time)"
            ],
            "type": "u64"
          },
          {
            "name": "totalWithdrawnAmount",
            "docs": [
              "Total amount withdrawn by the recipient.",
              "",
              "INVARIANT: runtime: prepaid: <= amount_owed && <= prepaid_amount_needed",
              "INVARIANT: runtime: unbounded: <= amount_owed && <= total_topup_amount"
            ],
            "type": "u64"
          },
          {
            "name": "lastWithdrawnAt",
            "docs": [
              "Last time at which recipient withdrew any amount."
            ],
            "type": "u64"
          },
          {
            "name": "lastWithdrawnAmount",
            "docs": [
              "Last amount which recipient withdrew."
            ],
            "type": "u64"
          },
          {
            "name": "totalTopupAmount",
            "docs": [
              "Total topup amount added for the stream.",
              "",
              "INVARIANT: prepaid: == total_prepaid_amount",
              "INVARIANT: unbounded: >= initial_amount + streaming_amount_owed"
            ],
            "type": "u64"
          },
          {
            "name": "lastTopupAt",
            "docs": [
              "Last time at which sender topped up the stream."
            ],
            "type": "u64"
          },
          {
            "name": "lastTopupAmount",
            "docs": [
              "Last topup amount."
            ],
            "type": "u64"
          },
          {
            "name": "depositNeeded",
            "docs": [
              "Total deposit amount needed for the non-prepaid stream. These are needed in case the sender does not topup the",
              "stream in time and the amount owed becomes > total topup amount. When that happens, anyone can cancel the",
              "stream. The deposit amount will be distributed as a reward to whoever finds the insolvency and cancels the",
              "stream.",
              "",
              "INVARIANT: prepaid: == 0",
              "INVARIANT: unbounded: == DEPOSIT_AMOUNT_PERIOD_IN_SECS of streaming payments"
            ],
            "type": "u64"
          },
          {
            "name": "reserved",
            "docs": [
              "Extra space for program upgrades."
            ],
            "type": {
              "array": [
                "u64",
                16
              ]
            }
          },
          {
            "name": "seed",
            "docs": [
              "Seed of the stream PDA. It's upto the client how they choose the seed. Each tuple (seed, mint, name) corresponds",
              "to a unique stream."
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "The PDA bump."
            ],
            "type": "u8"
          },
          {
            "name": "name",
            "docs": [
              "Name of the stream. Should be unique for a particular set of (seed, mint).",
              "",
              "INVARIANT: Length <= 100 unicode chars or 400 bytes"
            ],
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EmptyRecipient",
      "msg": "The stream recipient is empty. Should be a valid address"
    },
    {
      "code": 6001,
      "name": "SameSenderAndRecipient",
      "msg": "The stream recipient is the same as the sender. Should be different addresses"
    },
    {
      "code": 6002,
      "name": "SameSenders",
      "msg": "The stream sender is the same as the new sender. Should be different addresses"
    },
    {
      "code": 6003,
      "name": "SameRecipients",
      "msg": "The stream recipient is the same as the new recipient. Should be different addresses"
    },
    {
      "code": 6004,
      "name": "InvalidNewSender",
      "msg": "The new sender is invalid"
    },
    {
      "code": 6005,
      "name": "InvalidSender",
      "msg": "The sender is invalid"
    },
    {
      "code": 6006,
      "name": "InvalidRecipient",
      "msg": "The recipient is invalid"
    },
    {
      "code": 6007,
      "name": "StreamNameTooShort",
      "msg": "The stream name is too short. Should be >= 2 chars"
    },
    {
      "code": 6008,
      "name": "StreamNameTooLong",
      "msg": "The stream name is too long. Should be <= 100 chars"
    },
    {
      "code": 6009,
      "name": "ZeroFlowInterval",
      "msg": "The flow interval is 0. Should be > 0"
    },
    {
      "code": 6010,
      "name": "InvalidEndsAt",
      "msg": "The end time is either 0 with prepaid = true, in the past or < starts_at. Should be >= current_time and >= starts_at or if the stream is not prepaid, it can be 0"
    },
    {
      "code": 6011,
      "name": "ZeroLifetimeAmount",
      "msg": "The stream will never lead to any payments. Either there should be a initial amount or flow rate and flow duration should be > 0"
    },
    {
      "code": 6012,
      "name": "ZeroAmount",
      "msg": "The amount cannot be 0. Should be > 0"
    },
    {
      "code": 6013,
      "name": "PrepaidAmountNeededOutOfBounds",
      "msg": "The prepaid amount needed by the stream is out of bounds"
    },
    {
      "code": 6014,
      "name": "DepositAmountNeededOutOfBounds",
      "msg": "The deposit amount needed by the non-prepaid stream is out of bounds"
    },
    {
      "code": 6015,
      "name": "AmountLessThanAmountNeeded",
      "msg": "The amount is less than the minimum initial amount needed"
    },
    {
      "code": 6016,
      "name": "UserUnauthorizedToWithdraw",
      "msg": "The user is not allowed to withdraw. Should be the recipient of the stream"
    },
    {
      "code": 6017,
      "name": "WithdrawnAmountGreaterThanAmountOwed",
      "msg": "The withdrawn amount by recipient is more than the amount owed. THIS SHOULD NOT HAVE HAPPENED!!!"
    },
    {
      "code": 6018,
      "name": "WithdrawAmountOutOfBounds",
      "msg": "The total withdrawn amount by the recipient of the stream is out of bounds"
    },
    {
      "code": 6019,
      "name": "AmountAvailableToWithdrawOutOfBounds",
      "msg": "The amount available to be withdrawn by the recipient of the stream is out of bounds"
    },
    {
      "code": 6020,
      "name": "CancellationRefundOutOfBounds",
      "msg": "The cancellation refund amount to the sender of the stream is out of bounds"
    },
    {
      "code": 6021,
      "name": "TopupAmountOutOfBounds",
      "msg": "The total topup amount by the sender of the stream is out of bounds"
    },
    {
      "code": 6022,
      "name": "TopupAmountMoreThanMaxAcceptable",
      "msg": "The topup amount is more than what is needed by the stream"
    },
    {
      "code": 6023,
      "name": "SenderInsufficientFunds",
      "msg": "The sender has insufficient balance in their token account"
    },
    {
      "code": 6024,
      "name": "EscrowInsufficientFunds",
      "msg": "The token escrow account has insufficient balance. THIS SHOULD NOT HAVE HAPPENED!!!"
    },
    {
      "code": 6025,
      "name": "EscrowNotRentExempt",
      "msg": "The token escrow account is not rent exempt"
    },
    {
      "code": 6026,
      "name": "StreamAlreadyCancelled",
      "msg": "The stream has already been cancelled"
    },
    {
      "code": 6027,
      "name": "UserUnauthorizedToCancel",
      "msg": "The user is not allowed to cancel. Should be the sender or the recipient of the stream"
    },
    {
      "code": 6028,
      "name": "SenderCannotCancel",
      "msg": "The sender is not allowed to cancel permanently or at the moment"
    },
    {
      "code": 6029,
      "name": "StreamIsPrepaid",
      "msg": "The stream is prepaid. Should be a non-prepaid stream"
    },
    {
      "code": 6030,
      "name": "StreamHasStopped",
      "msg": "The stream has already stopped. Should be an unstopped stream"
    },
    {
      "code": 6031,
      "name": "StreamIsPaused",
      "msg": "The stream is already paused. Should be a non-paused stream"
    },
    {
      "code": 6032,
      "name": "StreamIsNotPaused",
      "msg": "The stream is not paused. Should be a paused stream"
    },
    {
      "code": 6033,
      "name": "StreamHasNoFlowPayments",
      "msg": "The stream has no flow payments. Should be a stream stream with a positive flow rate and flow period"
    },
    {
      "code": 6034,
      "name": "SenderCannotChangeSender",
      "msg": "The sender is not allowed to change sender of the stream permanently or at the moment"
    },
    {
      "code": 6035,
      "name": "SenderCannotPause",
      "msg": "The sender is not allowed to pause stream permanently or at the moment"
    },
    {
      "code": 6036,
      "name": "RecipientCannotResumePauseBySender",
      "msg": "The recipient is not allowed resume a stream paused by sender permanently or at the moment"
    },
    {
      "code": 6037,
      "name": "UserUnauthorizedToPause",
      "msg": "The user is not allowed to pause. Should be the sender or the recipient of the stream"
    },
    {
      "code": 6038,
      "name": "UserUnauthorizedToResume",
      "msg": "The user is not allowed to resume. Should be the sender or the recipient of the stream"
    },
    {
      "code": 6039,
      "name": "StreamNotEnded",
      "msg": "The stream has not ended. Should have ended and nat been cancelled"
    }
  ]
};
