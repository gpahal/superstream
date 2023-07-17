import * as anchor from '@coral-xyz/anchor'

export default function (provider: anchor.Provider) {
  anchor.setProvider(provider)
}
