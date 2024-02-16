import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const root = path.join(__dirname, '../')
  const dist = path.join(root, 'dist', 'handler')
  const filesToCopy = ['handler.js', 'handler.d.ts']
  for (const file of filesToCopy) {
    await fs.copyFile(path.join(dist, file), path.join(root, file))
  }
}

main()
