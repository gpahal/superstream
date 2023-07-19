import path from 'node:path'

import { copy, remove } from 'fs-extra'

import { getErrorMessage } from '@gpahal/std/error'

const CLIENT_DIR_PATH = path.join(__dirname, '..', '..', 'client')
const CLIENT_DOCS_DIR_PATH = path.join(CLIENT_DIR_PATH, 'docs')
const CLIENT_DOCS_GEN_DIR_PATH = path.join(__dirname, '..', 'public', 'references', 'client-sdks', 'ts')

async function main(): Promise<void> {
  console.info(`Copying client docs in [${CLIENT_DOCS_DIR_PATH}] to [${CLIENT_DOCS_GEN_DIR_PATH}]...`)
  try {
    await remove(CLIENT_DOCS_GEN_DIR_PATH)
    await copy(CLIENT_DOCS_DIR_PATH, CLIENT_DOCS_GEN_DIR_PATH, {
      overwrite: false,
      errorOnExist: true,
    })
    console.info(`Copied client docs in [${CLIENT_DOCS_DIR_PATH}] to [${CLIENT_DOCS_GEN_DIR_PATH}]...`)
  } catch (e) {
    console.error(`Unable to client docs in [${CLIENT_DOCS_DIR_PATH}]: ${getErrorMessage(e)}`)
    process.exit(1)
  }
}

void main()
