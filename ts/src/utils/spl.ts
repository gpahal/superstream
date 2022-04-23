import { AnchorProvider, web3 } from "@project-serum/anchor";
import * as tokenLib from "@solana/spl-token";

export async function fetchTokenAccount(
  provider: AnchorProvider,
  publicKey: web3.PublicKey,
): Promise<tokenLib.RawAccount | null> {
  const accountInfo = await provider.connection.getAccountInfo(publicKey);
  return accountInfo == null ? null : tokenLib.AccountLayout.decode(accountInfo.data);
}

export async function getAssociatedTokenAccount(
  provider: AnchorProvider,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
): Promise<web3.PublicKey | null> {
  const tokenAccountPublicKey = await tokenLib.getAssociatedTokenAddress(
    mint,
    owner,
    true,
    tokenLib.TOKEN_PROGRAM_ID,
    tokenLib.ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const tokenAccount = await fetchTokenAccount(provider, tokenAccountPublicKey);
  return tokenAccount ? tokenAccountPublicKey : null;
}

export async function mustGetAssociatedTokenAccount(
  provider: AnchorProvider,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
): Promise<web3.PublicKey> {
  const tokenAccountPublicKey = await tokenLib.getAssociatedTokenAddress(
    mint,
    owner,
    true,
    tokenLib.TOKEN_PROGRAM_ID,
    tokenLib.ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const tokenAccount = await fetchTokenAccount(provider, tokenAccountPublicKey);
  if (!tokenAccount) {
    throw new Error(
      `Owner doesn't have an associated token account: Owner=${owner.toString()}, Mint=${mint.toString()}`,
    );
  }
  return tokenAccountPublicKey;
}

export async function getOrCreateAssociatedTokenAccount(
  provider: AnchorProvider,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
): Promise<web3.PublicKey> {
  const tokenAccountPublicKey = await tokenLib.getAssociatedTokenAddress(
    mint,
    owner,
    true,
    tokenLib.TOKEN_PROGRAM_ID,
    tokenLib.ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const tokenAccount = await fetchTokenAccount(provider, tokenAccountPublicKey);
  return tokenAccount ? tokenAccountPublicKey : await createAssociatedTokenAccount(provider, mint, owner);
}

export async function createAssociatedTokenAccount(
  provider: AnchorProvider,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
): Promise<web3.PublicKey> {
  const [instructions, associatedTokenAccountPublicKey] = await createAssociatedTokenAccountInstructions(
    provider,
    mint,
    owner,
  );
  await provider.sendAndConfirm(new web3.Transaction().add(...instructions));
  return associatedTokenAccountPublicKey;
}

export async function createAssociatedTokenAccountInstructions(
  provider: AnchorProvider,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
): Promise<[web3.TransactionInstruction[], web3.PublicKey]> {
  const tokenAccountPublicKey = await tokenLib.getAssociatedTokenAddress(
    mint,
    owner,
    true,
    tokenLib.TOKEN_PROGRAM_ID,
    tokenLib.ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return [
    [
      tokenLib.createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        tokenAccountPublicKey,
        owner,
        mint,
        tokenLib.TOKEN_PROGRAM_ID,
        tokenLib.ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    ],
    tokenAccountPublicKey,
  ];
}
