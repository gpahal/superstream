import { ok, strictEqual } from 'node:assert'

import { AnchorError, AnchorProvider, BN, Program, setProvider, web3, workspace } from '@coral-xyz/anchor'
import { splTokenProgram } from '@coral-xyz/spl-token'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

import { Superstream } from '@/target/types/superstream'

const STREAM_ACCOUNT_SEED = 'stream'

describe('superstream', () => {
  const provider = AnchorProvider.env()
  setProvider(provider)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const program = workspace.Superstream as Program<Superstream>
  const sender = provider.wallet

  const tokenProgram = splTokenProgram({ provider })
  const fetchTokenAccount = async (publicKey: web3.PublicKey) => {
    return await tokenProgram.account.account.fetch(publicKey)
  }

  let mint = web3.PublicKey.default
  let senderToken = web3.PublicKey.default
  let senderTokenAmount = new BN(1e10)

  it('Initializes test setup', async () => {
    mint = await createMint(provider)
    senderToken = await createAssociatedTokenAccount(provider, mint, sender.publicKey)
    await mintTo(provider, mint, senderToken, Number(senderTokenAmount))
  })

  it('Creates a prepaid stream', async () => {
    const recipient = web3.Keypair.generate()
    const recipientToken = await createAssociatedTokenAccount(provider, mint, recipient.publicKey)

    const seed = new BN(0)
    const name = 's1'
    const [streamPublicKey] = getStreamPublicKey(program.programId, seed, mint, name)
    const escrowToken = await createAssociatedTokenAccount(provider, mint, streamPublicKey)
    const startAt = Math.floor(Date.now() / 1000)
    const secsInAYear = 365 * 24 * 60 * 60
    const endsAt = startAt + secsInAYear

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
        true,
        new BN(0),
      )
      .accounts({
        stream: streamPublicKey,
        sender: sender.publicKey,
        mint,
        senderToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()

    let senderTokenAccount = await fetchTokenAccount(senderToken)
    approximatelyEqualBN(senderTokenAccount.amount, new BN(1e10 - 1000 - secsInAYear * 10))
    let recipientTokenAccount = await fetchTokenAccount(recipientToken)
    strictEqualBN(recipientTokenAccount.amount, new BN(0))

    await sleep(4000)
    const diffOnWithdraw = Math.floor(Date.now() / 1000) - startAt

    await program.methods
      .withdraw(new BN(0), name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        mint,
        recipientToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    senderTokenAccount = await fetchTokenAccount(senderToken)
    approximatelyEqualBN(senderTokenAccount.amount, new BN(1e10 - 1000 - secsInAYear * 10))
    recipientTokenAccount = await fetchTokenAccount(recipientToken)
    approximatelyEqualBN(recipientTokenAccount.amount, new BN(1000 + diffOnWithdraw * 10))

    await program.methods
      .cancel(seed, name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        sender: sender.publicKey,
        mint,
        signerToken: senderToken,
        senderToken,
        recipientToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    const diffOnCancel = Math.floor(Date.now() / 1000) - startAt

    senderTokenAccount = await fetchTokenAccount(senderToken)
    approximatelyEqualBN(senderTokenAccount.amount, new BN(1e10 - 1000 - diffOnCancel * 10))
    recipientTokenAccount = await fetchTokenAccount(recipientToken)
    approximatelyEqualBN(recipientTokenAccount.amount, new BN(1000 + diffOnCancel * 10))

    await sleep(4000)

    await program.methods
      .withdraw(seed, name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        mint,
        recipientToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    senderTokenAccount = await fetchTokenAccount(senderToken)
    senderTokenAmount = senderTokenAccount.amount
    approximatelyEqualBN(senderTokenAmount, new BN(1e10 - 1000 - diffOnCancel * 10))
    recipientTokenAccount = await fetchTokenAccount(recipientToken)
    approximatelyEqualBN(recipientTokenAccount.amount, new BN(1000 + diffOnCancel * 10))
  })

  it('Creates a non-prepaid stream', async () => {
    const recipient = web3.Keypair.generate()
    const recipientToken = await createAssociatedTokenAccount(provider, mint, recipient.publicKey)

    const seed = new BN(0)
    const name = 's2'
    const [streamPublicKey] = getStreamPublicKey(program.programId, seed, mint, name)
    const escrowToken = await createAssociatedTokenAccount(provider, mint, streamPublicKey)

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
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc()
    } catch (e) {
      ok(e instanceof AnchorError)
      strictEqual(e.error.errorCode.number, 6012)
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
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc()
    } catch (e) {
      ok(e instanceof AnchorError)
      strictEqual(e.error.errorCode.number, 6015)
    }

    const startAt = Math.floor(Date.now() / 1000)

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
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()

    let senderTokenAccount = await fetchTokenAccount(senderToken)
    strictEqualBN(senderTokenAccount.amount, senderTokenAmount.sub(new BN(1e7)))
    let recipientTokenAccount = await fetchTokenAccount(recipientToken)
    strictEqualBN(recipientTokenAccount.amount, new BN(0))

    await sleep(4000)
    const diffOnWithdraw = Math.floor(Date.now() / 1000) - startAt

    await program.methods
      .withdraw(seed, name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        mint,
        recipientToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    senderTokenAccount = await fetchTokenAccount(senderToken)
    strictEqualBN(senderTokenAccount.amount, senderTokenAmount.sub(new BN(1e7)))
    recipientTokenAccount = await fetchTokenAccount(recipientToken)
    approximatelyEqualBN(recipientTokenAccount.amount, new BN(1000 + diffOnWithdraw * 10))

    const randomSigner = web3.Keypair.generate()
    const randomSignerToken = await createAssociatedTokenAccount(provider, mint, randomSigner.publicKey)

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
          recipientToken,
          escrowToken,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([randomSigner])
        .rpc()
    } catch (e) {
      ok(e instanceof AnchorError)
      strictEqual(e.error.errorCode.number, 6027)
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
        recipientToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    const diffOnCancel = Math.floor(Date.now() / 1000) - startAt

    senderTokenAccount = await fetchTokenAccount(senderToken)
    approximatelyEqualBN(senderTokenAccount.amount, senderTokenAmount.sub(new BN(1000 + diffOnCancel * 10)))
    recipientTokenAccount = await fetchTokenAccount(recipientToken)
    approximatelyEqualBN(recipientTokenAccount.amount, new BN(1000 + diffOnCancel * 10))

    await sleep(4000)

    await program.methods
      .withdraw(seed, name, recipient.publicKey)
      .accounts({
        stream: streamPublicKey,
        signer: sender.publicKey,
        mint,
        recipientToken,
        escrowToken,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    senderTokenAccount = await fetchTokenAccount(senderToken)
    approximatelyEqualBN(senderTokenAccount.amount, senderTokenAmount.sub(new BN(1000 + diffOnCancel * 10)))
    recipientTokenAccount = await fetchTokenAccount(recipientToken)
    approximatelyEqualBN(recipientTokenAccount.amount, new BN(1000 + diffOnCancel * 10))
  })
})

function strictEqualBN(actual: BN, expected: BN) {
  if (!actual.eq(expected)) {
    strictEqual(actual, expected)
  }
}

const DELTA = new BN(15)

function approximatelyEqualBN(actual: BN, expected: BN) {
  if (actual.lt(expected.sub(DELTA)) || actual.gt(expected.add(DELTA))) {
    strictEqual(actual.toString(), expected.toString())
  }
}

function getStreamPublicKey(
  programId: web3.PublicKey,
  seed: BN,
  mint: web3.PublicKey,
  name: string,
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from(STREAM_ACCOUNT_SEED), seed.toArrayLike(Buffer, 'le', 8), mint.toBuffer(), Buffer.from(name)],
    new web3.PublicKey(programId),
  )
}

async function createMint(provider: AnchorProvider): Promise<web3.PublicKey> {
  const authority = provider.wallet.publicKey
  const mint = web3.Keypair.generate()
  const lamports = await getMinimumBalanceForRentExemptMint(provider.connection)

  const transaction = new web3.Transaction().add(
    web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(mint.publicKey, 9, authority, authority, TOKEN_PROGRAM_ID),
  )

  await provider.sendAndConfirm(transaction, [mint])
  return mint.publicKey
}

async function createAssociatedTokenAccount(
  provider: AnchorProvider,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
): Promise<web3.PublicKey> {
  const [instructions, associatedTokenAccountPublicKey] = await createAssociatedTokenAccountInstructions(
    provider,
    mint,
    owner,
  )
  await provider.sendAndConfirm(new web3.Transaction().add(...instructions))
  return associatedTokenAccountPublicKey
}

async function createAssociatedTokenAccountInstructions(
  provider: AnchorProvider,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
): Promise<[web3.TransactionInstruction[], web3.PublicKey]> {
  const associatedToken = await getAssociatedTokenAddress(
    mint,
    owner,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )
  return [
    [
      createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        associatedToken,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    ],
    associatedToken,
  ]
}

async function mintTo(
  provider: AnchorProvider,
  mint: web3.PublicKey,
  destination: web3.PublicKey,
  amount: number,
): Promise<void> {
  const transaction = new web3.Transaction().add(
    createMintToInstruction(mint, destination, provider.wallet.publicKey, amount),
  )
  await provider.sendAndConfirm(transaction)
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
