import { exec as execLib } from 'node:child_process'
import path from 'node:path'
import util from 'node:util'

import { ensureDir, remove } from 'fs-extra'

const PROGRAM_DIR_PATH = path.join(__dirname, '..', '..', 'program')
const PROGRAM_TARGET_DIR_PATH = path.join(PROGRAM_DIR_PATH, 'target')
const PROGRAM_IDL_JSON_PATH = path.join(PROGRAM_TARGET_DIR_PATH, 'idl/superstream.json')
const PROGRAM_TYPES_TS_PATH = path.join(PROGRAM_TARGET_DIR_PATH, 'types/superstream.ts')
const CLIENT_GEN_DIR_PATH = path.join(__dirname, '..', 'src', 'gen')
const CLIENT_GEN_IDL_JSON_PATH = path.join(CLIENT_GEN_DIR_PATH, 'idl.json')
const CLIENT_GEN_TYPES_TS_PATH = path.join(CLIENT_GEN_DIR_PATH, 'types.ts')

const exec = util.promisify(execLib)

async function main(): Promise<void> {
  console.info(`Copying Superstream program files in [${PROGRAM_TARGET_DIR_PATH}] to [${CLIENT_GEN_DIR_PATH}]...`)
  await remove(CLIENT_GEN_DIR_PATH)
  await ensureDir(CLIENT_GEN_DIR_PATH)
  await exec(`cp ${PROGRAM_IDL_JSON_PATH} ${CLIENT_GEN_IDL_JSON_PATH}`)
  await exec(`cp ${PROGRAM_TYPES_TS_PATH} ${CLIENT_GEN_TYPES_TS_PATH}`)
  console.info(`Copyied Superstream program files in [${PROGRAM_TARGET_DIR_PATH}] to [${CLIENT_GEN_DIR_PATH}]`)
}

void main()
