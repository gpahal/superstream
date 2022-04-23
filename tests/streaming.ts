import { ok, strictEqual } from "assert";

import * as anchor from "@project-serum/anchor";
import { BN, Program, web3 } from "@project-serum/anchor";
import { SplTokenAccountsCoder } from "@project-serum/anchor/dist/cjs/coder/spl-token/accounts";
import * as tokenLib from "@solana/spl-token";

import { Streaming } from "../target/types/streaming";

const STREAM_ACCOUNT_SEED = "stream";

describe("streaming", () => {
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Streaming as Program<Streaming>;
  const sender = provider.wallet;

  let mint = web3.PublicKey.default;
  let senderToken = web3.PublicKey.default;
  let senderTokenAmount = BigInt(1e10);

  it("Initializes test setup", async () => {
    mint = await createMint(provider);
    senderToken = await createAssociatedTokenAccount(provider, mint, sender.publicKey);
    await mintTo(provider, mint, senderToken, Number(senderTokenAmount));
  });

  it("Creates a prepaid stream", async () => {
    const recipient = web3.Keypair.generate();
    const recipientToken = await createAssociatedTokenAccount(provider, mint, recipient.publicKey);

    const seed = new BN(0);
    const name = "s1";
    const [streamPublicKey] = getStreamPublicKey(program.programId, seed, mint, name);
    const escrowToken = await createAssociatedTokenAccount(provider, mint, streamPublicKey);
    const startAt = Math.floor(Date.now() / 1000);
    const secsInAYear = 365 * 24 * 60 * 60;
    const endsAt = startAt + secsInAYear;

    await program.methods
      .createPrepaid(
        seed,
        name,
        recipient.publicKey,
        new BN(0),
        new BN(endsAt),
        new BN(1000),
        new BN(2),
        new BN(20),
        true,
        new BN(0),
        true,
        new BN(0),
        true,
        new BN(0),
        true,
        new BN(0),
      )
      .accounts({
        stream: streamPublicKey,
        sender: sender.publicKey,
        mint,
        senderToken,
        escrowToken,
        tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    let senderTokenAccount = await fetchTokenAccount(provider, senderToken);
    approximatelyEqual(senderTokenAccount.amount, BigInt(1e10 - 1000 - secsInAYear * 10));
    let recipientTokenAccount = await fetchTokenAccount(provider, recipientToken);
    strictEqual(recipientTokenAccount.amount, BigInt(0));

    await sleep(4000);
    const diffOnWithdraw = Math.floor(Date.now() / 1000) - startAt;

    await program.methods
      .withdraw(new BN(0), name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        mint,
        recipientToken,
        escrowToken,
        tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
      })
      .rpc();

    senderTokenAccount = await fetchTokenAccount(provider, senderToken);
    approximatelyEqual(senderTokenAccount.amount, BigInt(1e10 - 1000 - secsInAYear * 10));
    recipientTokenAccount = await fetchTokenAccount(provider, recipientToken);
    approximatelyEqual(recipientTokenAccount.amount, BigInt(1000 + diffOnWithdraw * 10));

    await program.methods
      .cancel(seed, name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        sender: sender.publicKey,
        mint,
        signerToken: senderToken,
        senderToken,
        escrowToken,
        tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
      })
      .rpc();

    const diffOnCancel = Math.floor(Date.now() / 1000) - startAt;

    senderTokenAccount = await fetchTokenAccount(provider, senderToken);
    approximatelyEqual(senderTokenAccount.amount, BigInt(1e10 - 1000 - diffOnCancel * 10));
    recipientTokenAccount = await fetchTokenAccount(provider, recipientToken);
    approximatelyEqual(recipientTokenAccount.amount, BigInt(1000 + diffOnWithdraw * 10));

    await sleep(4000);

    await program.methods
      .withdraw(seed, name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        mint,
        recipientToken,
        escrowToken,
        tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
      })
      .rpc();

    senderTokenAccount = await fetchTokenAccount(provider, senderToken);
    senderTokenAmount = senderTokenAccount.amount;
    approximatelyEqual(senderTokenAmount, BigInt(1e10 - 1000 - diffOnCancel * 10));
    recipientTokenAccount = await fetchTokenAccount(provider, recipientToken);
    approximatelyEqual(recipientTokenAccount.amount, BigInt(1000 + diffOnCancel * 10));
  });

  it("Creates a non-prepaid stream", async () => {
    const recipient = web3.Keypair.generate();
    const recipientToken = await createAssociatedTokenAccount(provider, mint, recipient.publicKey);

    const seed = new BN(0);
    const name = "s2";
    const [streamPublicKey] = getStreamPublicKey(program.programId, seed, mint, name);
    const escrowToken = await createAssociatedTokenAccount(provider, mint, streamPublicKey);

    try {
      await program.methods
        .createNonPrepaid(
          seed,
          name,
          recipient.publicKey,
          new BN(0),
          new BN(0),
          new BN(1000),
          new BN(1),
          new BN(10),
          true,
          new BN(0),
          true,
          new BN(0),
          true,
          new BN(0),
          true,
          new BN(0),
          new BN(0),
        )
        .accounts({
          stream: streamPublicKey,
          sender: sender.publicKey,
          mint,
          senderToken,
          escrowToken,
          tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
    } catch (e) {
      ok(e instanceof anchor.AnchorError);
      strictEqual(e.error.errorCode.number, 6011);
    }

    try {
      await program.methods
        .createNonPrepaid(
          seed,
          name,
          recipient.publicKey,
          new BN(0),
          new BN(0),
          new BN(1000),
          new BN(1),
          new BN(10),
          true,
          new BN(0),
          true,
          new BN(0),
          true,
          new BN(0),
          true,
          new BN(0),
          new BN(1),
        )
        .accounts({
          stream: streamPublicKey,
          sender: sender.publicKey,
          mint,
          senderToken,
          escrowToken,
          tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
    } catch (e) {
      ok(e instanceof anchor.AnchorError);
      strictEqual(e.error.errorCode.number, 6014);
    }

    const startAt = Math.floor(Date.now() / 1000);

    await program.methods
      .createNonPrepaid(
        seed,
        name,
        recipient.publicKey,
        new BN(0),
        new BN(0),
        new BN(1000),
        new BN(1),
        new BN(10),
        true,
        new BN(0),
        true,
        new BN(0),
        true,
        new BN(0),
        true,
        new BN(0),
        new BN(1e7),
      )
      .accounts({
        stream: streamPublicKey,
        sender: sender.publicKey,
        mint,
        senderToken,
        escrowToken,
        tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    let senderTokenAccount = await fetchTokenAccount(provider, senderToken);
    strictEqual(senderTokenAccount.amount, senderTokenAmount - BigInt(1e7));
    let recipientTokenAccount = await fetchTokenAccount(provider, recipientToken);
    strictEqual(recipientTokenAccount.amount, BigInt(0));

    await sleep(4000);
    const diffOnWithdraw = Math.floor(Date.now() / 1000) - startAt;

    await program.methods
      .withdraw(seed, name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        mint,
        recipientToken,
        escrowToken,
        tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
      })
      .rpc();

    senderTokenAccount = await fetchTokenAccount(provider, senderToken);
    strictEqual(senderTokenAccount.amount, senderTokenAmount - BigInt(1e7));
    SplTokenAccountsCoder;
    recipientTokenAccount = await fetchTokenAccount(provider, recipientToken);
    approximatelyEqual(recipientTokenAccount.amount, BigInt(1000 + diffOnWithdraw * 10));

    const randomSigner = web3.Keypair.generate();
    const randomSignerToken = await createAssociatedTokenAccount(provider, mint, randomSigner.publicKey);

    try {
      await program.methods
        .cancel(seed, name, recipient.publicKey)
        .accounts({
          stream: streamPublicKey,
          signer: randomSigner.publicKey,
          sender: sender.publicKey,
          mint,
          signerToken: randomSignerToken,
          senderToken,
          escrowToken,
          tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
        })
        .signers([randomSigner])
        .rpc();
    } catch (e) {
      ok(e instanceof anchor.AnchorError);
      strictEqual(e.error.errorCode.number, 6024);
    }

    await program.methods
      .cancel(seed, name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        sender: sender.publicKey,
        mint,
        signerToken: senderToken,
        senderToken,
        escrowToken,
        tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
      })
      .rpc();

    const diffOnCancel = Math.floor(Date.now() / 1000) - startAt;

    senderTokenAccount = await fetchTokenAccount(provider, senderToken);
    approximatelyEqual(senderTokenAccount.amount, senderTokenAmount - BigInt(1000 + diffOnCancel * 10));
    recipientTokenAccount = await fetchTokenAccount(provider, recipientToken);
    approximatelyEqual(recipientTokenAccount.amount, BigInt(1000 + diffOnWithdraw * 10));

    await sleep(4000);

    await program.methods
      .withdraw(seed, name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        mint,
        recipientToken,
        escrowToken,
        tokenProgram: tokenLib.TOKEN_PROGRAM_ID,
      })
      .rpc();

    senderTokenAccount = await fetchTokenAccount(provider, senderToken);
    approximatelyEqual(senderTokenAccount.amount, senderTokenAmount - BigInt(1000 + diffOnCancel * 10));
    recipientTokenAccount = await fetchTokenAccount(provider, recipientToken);
    approximatelyEqual(recipientTokenAccount.amount, BigInt(1000 + diffOnCancel * 10));
  });
});

function approximatelyEqual(actual: bigint, expected: bigint) {
  const delta = BigInt(15);
  if (actual < expected - delta || actual > expected + delta) {
    strictEqual(actual, expected);
  }
}

function getStreamPublicKey(
  programId: web3.PublicKey,
  seed: BN,
  mint: web3.PublicKey,
  name: string,
): [web3.PublicKey, number] {
  return anchor.utils.publicKey.findProgramAddressSync(
    [Buffer.from(STREAM_ACCOUNT_SEED), seed.toBuffer("le", 8), mint.toBuffer(), Buffer.from(name)],
    programId,
  );
}

async function fetchTokenAccount(provider: anchor.Provider, publicKey: web3.PublicKey): Promise<tokenLib.RawAccount> {
  const accountInfo = await provider.connection.getAccountInfo(publicKey);
  if (!accountInfo) {
    throw new Error(`Invalid token account: ${publicKey.toString()}`);
  }
  return tokenLib.AccountLayout.decode(accountInfo.data);
}

async function createMint(provider: anchor.Provider): Promise<web3.PublicKey> {
  const authority = provider.wallet.publicKey;
  const mint = anchor.web3.Keypair.generate();
  const lamports = await tokenLib.getMinimumBalanceForRentExemptMint(provider.connection);

  const transaction = new web3.Transaction().add(
    web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: tokenLib.MINT_SIZE,
      lamports,
      programId: tokenLib.TOKEN_PROGRAM_ID,
    }),
    tokenLib.createInitializeMintInstruction(mint.publicKey, 9, authority, authority, tokenLib.TOKEN_PROGRAM_ID),
  );

  await provider.send(transaction, [mint]);
  return mint.publicKey;
}

async function createAssociatedTokenAccount(
  provider: anchor.Provider,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
): Promise<web3.PublicKey> {
  const [instructions, associatedTokenAccountPublicKey] = await createAssociatedTokenAccountInstructions(
    provider,
    mint,
    owner,
  );
  await provider.send(new web3.Transaction().add(...instructions));
  return associatedTokenAccountPublicKey;
}

async function createAssociatedTokenAccountInstructions(
  provider: anchor.Provider,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
): Promise<[web3.TransactionInstruction[], web3.PublicKey]> {
  const associatedToken = await tokenLib.getAssociatedTokenAddress(
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
        associatedToken,
        owner,
        mint,
        tokenLib.TOKEN_PROGRAM_ID,
        tokenLib.ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    ],
    associatedToken,
  ];
}

async function mintTo(
  provider: anchor.Provider,
  mint: web3.PublicKey,
  destination: web3.PublicKey,
  amount: number,
): Promise<void> {
  const transaction = new web3.Transaction().add(
    tokenLib.createMintToInstruction(mint, destination, provider.wallet.publicKey, amount),
  );
  await provider.send(transaction);
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
