import { BN } from "@project-serum/anchor";

export const STREAMING_PROGRAM_ID = "GTfyzwZX2vRFcqbTWqiv2k7vNgd6yWq269USRWYbHSB8";
export const STREAM_ACCOUNT_SEED = "stream";

export const MAX_STREAM_NAME_LENGTH = 100;
export const DEPOSIT_AMOUNT_PERIOD = 8 * 60 * 60; // 8 hours
export const DEPOSIT_AMOUNT_PERIOD_BN = new BN(DEPOSIT_AMOUNT_PERIOD);
