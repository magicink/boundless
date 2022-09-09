#!/usr/bin/env node
import path, { dirname } from 'node:path'
import dotenv from 'dotenv'
import ejs from 'ejs'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

dotenv.config()
const { DEV_PORT = 9000, NODE_ENV = 'production' } = process.env
const isDev = NODE_ENV !== 'production'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const targetPath = path.join(__dirname, '../dist')
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))

if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath)
}

const { author = {}, description, homepage, version } = packageJson

try {
  const template = fs.readFileSync(path.join(__dirname, 'template.ejs'), 'utf-8')
  const script = !isDev
    ? fs.readFileSync(path.join(targetPath, 'scripts.js'), 'utf-8')
    : `http://localhost:${DEV_PORT}/scripts.js`
  const source = ejs.compile(template, { encoding: 'utf-8' })
  const targetFile = path.join(targetPath, 'format.js')
  const data = {
    author: author.name,
    description: `${description} See <a href="${homepage}" target="_blank" rel="noopener">documentation</a> for more information.`,
    name: 'Boundless',
    proofing: false,
    source: source({
      isDev,
      script
    }),
    version
  }
  fs.writeFileSync(targetFile, `window.storyFormat(${JSON.stringify(data)})`, 'utf-8')
} catch (e) {
  console.error(e)
}
