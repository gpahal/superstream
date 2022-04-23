import { BN, web3 } from "@project-serum/anchor";

export async function getCurrentTimeInSecsBN(connection: web3.Connection): Promise<BN> {
  try {
    const slot = await connection.getSlot("recent");
    const time = await connection.getBlockTime(slot);
    if (time) {
      return new BN(time);
    }
  } catch (e) {
    console.error(e);
  }
  return new BN(Math.floor(Date.now() / 1000));
}
