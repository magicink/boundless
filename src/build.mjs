#!/usr/bin/env node
import ejs from 'ejs'
import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const targetPath = path.join(__dirname, '../dist')
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))

if (!fs.existsSync(targetPath)) {
  throw new Error('Target path does not exist')
}

const { author = {}, description, homepage, version } = packageJson

try {
  const template = fs.readFileSync(path.join(__dirname, 'template.ejs'), 'utf-8')
  const script = fs.readFileSync(path.join(targetPath, 'scripts.js'), 'utf-8')
  const source = ejs.compile(template, { encoding: 'utf-8' })
  const targetFile = path.join(targetPath, 'format.js')
  const data = {
    author: author.name,
    description: `${description} See ${homepage} for more information.`,
    name: 'Boundless',
    proofing: false,
    source: source({
      sampleData: null,
      script
    }),
    version
  }
  fs.writeFileSync(targetFile, `window.storyFormat(${JSON.stringify(data)})`, 'utf-8')
} catch (e) {
  console.error(e)
}
