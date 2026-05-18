import 'dotenv/config'
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { program } from 'commander'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const EXAMPLES_DIR = resolve(__dirname, 'examples')

const files = await readdir(EXAMPLES_DIR)
await Promise.all(
  files
    .filter((file) => /\.(js|ts)$/.test(file))
    .map(async (file) => {
      const filePath = pathToFileURL(resolve(EXAMPLES_DIR, file)).href
      const module = await import(filePath)
      if (typeof module.main === 'function') {
        const commandName = module.name || file.replace(/\.(ts|js)$/, '')
        const commandDesc = module.description || `Run ${commandName} example`
        const command = program.command(commandName).description(commandDesc)
        if (typeof module.prepare === 'function') {
          module.prepare(command)
        }
        command.action(module.main)
      }
    }),
)

program.version('1.0.0').description('LangChain Examples')
program.parse(process.argv)
