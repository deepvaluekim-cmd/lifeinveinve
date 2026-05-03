import { promises as fs } from 'node:fs'
import path from 'node:path'
import { shallowClone, copySkillDir } from 'dance-of-tal/lib/add'
import { assetFilePath, danceAssetDir, ensureDotDir } from 'dance-of-tal/lib/registry'

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

async function writeJsonAsset(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8')
}

async function writeCustomDanceBundle(cwdValue, author, stage, dance) {
  const urn = buildDanceUrn(author, stage, dance.slug)
  const bundleDir = danceAssetDir(cwdValue, urn)
  const skillMdPath = path.join(bundleDir, 'SKILL.md')
  const frontmatter = [
    '---',
    `name: ${JSON.stringify(dance.slug)}`,
    `description: ${JSON.stringify(dance.description)}`,
    '---',
    ''
  ].join('\n')
  await fs.mkdir(bundleDir, { recursive: true })
  await fs.writeFile(skillMdPath, `${frontmatter}\n${dance.content.trim()}\n`, 'utf-8')
  return urn
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'))
  const { sourceRepo, sourceRef, author, stage, importedSkills, customDances, performers, act } = manifest

  await ensureDotDir(cwd)

  const { tempDir, cleanup } = await shallowClone({
    url: sourceRepo,
    ref: sourceRef
  })

  try {
    const danceUrnsBySlug = new Map()

    for (const skill of importedSkills) {
      const sourceDir = path.join(tempDir, skill.sourcePath)
      const urn = buildDanceUrn(author, stage, skill.slug)
      const targetDir = danceAssetDir(cwd, urn)
      await fs.rm(targetDir, { recursive: true, force: true })
      await copySkillDir(sourceDir, targetDir, { repoRoot: tempDir })
      danceUrnsBySlug.set(skill.slug, urn)
    }

    for (const dance of customDances) {
      const urn = await writeCustomDanceBundle(cwd, author, stage, dance)
      danceUrnsBySlug.set(dance.slug, urn)
    }

    const performerUrnsBySlug = new Map()

    for (const performer of performers) {
      const urn = buildPerformerUrn(author, stage, performer.slug)
      const payload = {
        kind: 'performer',
        urn,
        description: performer.description,
        tags: ['investing', 'discord', 'local'],
        payload: {
          dances: performer.danceSlugs.map((slug) => {
            const danceUrn = danceUrnsBySlug.get(slug)
            if (!danceUrn) {
              throw new Error(`Missing dance slug mapping for ${slug}`)
            }
            return danceUrn
          })
        }
      }
      await writeJsonAsset(assetFilePath(cwd, urn), payload)
      performerUrnsBySlug.set(performer.slug, urn)
    }

    const actUrn = buildActUrn(author, stage, act.slug)
    const actPayload = {
      kind: 'act',
      urn: actUrn,
      description: act.description,
      tags: ['investing', 'discord', 'local'],
      payload: {
        actRules: act.actRules,
        participants: act.participants.map((participant) => {
          const performerUrn = performerUrnsBySlug.get(participant.performerSlug)
          if (!performerUrn) {
            throw new Error(`Missing performer slug mapping for ${participant.performerSlug}`)
          }
          return {
            key: participant.key,
            performer: performerUrn
          }
        }),
        relations: act.relations
      }
    }
    await writeJsonAsset(assetFilePath(cwd, actUrn), actPayload)

    console.log('Bootstrap complete.')
    console.log(`Act: ${actUrn}`)
    console.log(`Performers: ${performers.length}`)
    console.log(`Dances: ${danceUrnsBySlug.size}`)
  } finally {
    await cleanup()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
