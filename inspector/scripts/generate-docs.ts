import { exec as execLib } from 'node:child_process'
import path from 'node:path'
import util from 'node:util'

import { appendFile, ensureDir, remove, writeFile } from 'fs-extra'

const INSPECTOR_CLI_JS_PATH = path.join(__dirname, '..', 'build', 'cli.js')
const INSPECTOR_DOCS_DIR_PATH = path.join(__dirname, '..', 'docs')

const exec = util.promisify(execLib)

const COMMANDS = ['run', 'stats']

async function generateCommandDocs(command: string): Promise<void> {
  const commandPath = path.join(INSPECTOR_DOCS_DIR_PATH, `${command}.md`)
  await writeFile(commandPath, `# \`inspector ${command}\`\n\n\`\`\`txt\n`, { mode: 0o644 })
  await exec(`node ${INSPECTOR_CLI_JS_PATH} ${command} -h >> ${commandPath}`)
  await appendFile(commandPath, '```\n')
}

async function main(): Promise<void> {
  console.info(`Generating inspector docs in [${INSPECTOR_DOCS_DIR_PATH}]...`)
  await remove(INSPECTOR_DOCS_DIR_PATH)
  await ensureDir(INSPECTOR_DOCS_DIR_PATH)
  await Promise.all(COMMANDS.map(generateCommandDocs))
  console.info(`Generated inspector docs in [${INSPECTOR_DOCS_DIR_PATH}]`)
}

void main()
