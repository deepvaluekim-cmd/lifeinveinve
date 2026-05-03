import { promises as fs } from 'node:fs'
import path from 'node:path'
import { assetFilePath, danceAssetDir } from 'dance-of-tal/lib/registry'
import { parseDotAsset } from 'dance-of-tal/contracts'

const cwd = process.cwd()
const manifestPath = path.join(cwd, 'config', 'vibe-investing-manifest.json')

function buildDanceUrn(author, stage, slug) {
  return `dance/@${author}/${stage}/${slug}`
}

function buildPerformerUrn(author, stage, slug) {
  return `performer/@${author}/${stage}/${slug}`
}

function buildActUrn(author, stage, slug) {
  return `act/@${author}/${stage}/${slug}`
}

async function ensureFileExists(filePath) {
  await fs.access(filePath)
  return filePath
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'))
  const { author, stage, importedSkills, customDances, performers, act } = manifest

  for (const skill of [...importedSkills, ...customDances]) {
    const urn = buildDanceUrn(author, stage, skill.slug)
    const skillMdPath = path.join(danceAssetDir(cwd, urn), 'SKILL.md')
    await ensureFileExists(skillMdPath)
  }

  for (const performer of performers) {
    const urn = buildPerformerUrn(author, stage, performer.slug)
    const performerPath = assetFilePath(cwd, urn)
    const payload = JSON.parse(await fs.readFile(await ensureFileExists(performerPath), 'utf-8'))
    parseDotAsset(payload)
  }

  const actUrn = buildActUrn(author, stage, act.slug)
  const actPath = assetFilePath(cwd, actUrn)
  const actPayload = JSON.parse(await fs.readFile(await ensureFileExists(actPath), 'utf-8'))
  parseDotAsset(actPayload)

  console.log('Asset validation passed.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
