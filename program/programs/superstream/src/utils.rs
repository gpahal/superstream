use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

pub(crate) fn get_current_timestamp() -> Result<u64> {
    let clock = Clock::get()?;
    Ok(clock.unix_timestamp as u64)
}

pub(crate) fn is_token_account_rent_exempt<T: AccountSerialize + AccountDeserialize + Owner + Clone>(
    account: &Account<T>,
) -> Result<bool> {
    Ok(Rent::get()?.is_exempt(account.to_account_info().lamports(), TokenAccount::LEN))
}
