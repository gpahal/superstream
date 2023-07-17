import * as anchor from '@coral-xyz/anchor'

export default function deploy(provider: anchor.Provider) {
  anchor.setProvider(provider)
}
