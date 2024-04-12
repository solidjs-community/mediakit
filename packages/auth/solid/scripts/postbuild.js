import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const root = path.join(__dirname, '../')
  const distClient = path.join(root, 'dist', 'client')
  const distIndex = path.join(root, 'dist', 'index')
  await fs.cp(distClient, root, {
    recursive: true,
  })
  await fs.cp(distIndex, root, {
    recursive: true,
  })
  const files = await fs.readdir(root)
  for (const file of files) {
    if (file.endsWith('.map')) {
      await fs.unlink(path.join(root, file))
    }
  }
}

main()
