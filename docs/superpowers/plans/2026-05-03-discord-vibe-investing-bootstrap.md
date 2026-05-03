# Discord Vibe Investing Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap this repository as a DOT Studio-compatible investing workspace with imported `vibe-investing` skills, local Performer/Act assets, and setup docs for Discord runtime use.

**Architecture:** Keep `dot-studio` itself unchanged in this repository. This repo becomes the portable workspace layer: a small Node-based bootstrap tool clones `vibe-investing`, copies selected skills into local Dance bundles, and writes local Performer/Act assets that Studio can import and run through its existing Discord integration.

**Tech Stack:** Node.js, ESM scripts, `dance-of-tal`, Markdown docs, DOT local asset files

---

### Task 1: Scaffold the workspace repo

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Add package metadata and scripts**

```json
{
  "name": "discord-vibe-investing-bootstrap",
  "private": true,
  "type": "module",
  "scripts": {
    "bootstrap": "node scripts/bootstrap-vibe-investing-workspace.mjs",
    "validate:assets": "node scripts/validate-assets.mjs"
  },
  "dependencies": {
    "dance-of-tal": "^4.0.4"
  }
}
```

- [ ] **Step 2: Ignore generated vendor and runtime directories**

```gitignore
node_modules/
.vendor/
```

- [ ] **Step 3: Add a top-level README with setup and Discord usage**

```md
# Discord Vibe Investing Bootstrap

This repository bootstraps a local DOT Studio workspace for `vibe-investing`.
Run `npm install`, then `npm run bootstrap`, then open the repo with `dot-studio .`.
```

- [ ] **Step 4: Commit**

```bash
git add package.json .gitignore README.md
git commit -m "chore: scaffold discord investing workspace"
```

### Task 2: Add skill import and asset bootstrap scripts

**Files:**
- Create: `scripts/bootstrap-vibe-investing-workspace.mjs`
- Create: `scripts/validate-assets.mjs`

- [ ] **Step 1: Write a bootstrap script that clones `vibe-investing` and copies selected skills**

```js
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { shallowClone, copySkillDir } from 'dance-of-tal/lib/add'
import { danceAssetDir, ensureDotDir, assetFilePath } from 'dance-of-tal/lib/registry'
```

- [ ] **Step 2: Generate local Dance, Performer, and Act assets**

```js
const AUTHOR = 'deepvaluekim-cmd'
const STAGE = 'vibe-investing'
const ACT_URN = `act/@${AUTHOR}/${STAGE}/investment-analysis-team`
```

- [ ] **Step 3: Add a validation script that checks required asset files exist and parse as JSON where applicable**

```js
import { promises as fs } from 'node:fs'
const requiredFiles = [
  '.dance-of-tal/assets/act/@deepvaluekim-cmd/vibe-investing/investment-analysis-team.json'
]
```

- [ ] **Step 4: Run the scripts**

Run: `npm install`
Expected: installs `dance-of-tal`

Run: `npm run bootstrap`
Expected: creates `.dance-of-tal/` local assets and copied Dance bundles

Run: `npm run validate:assets`
Expected: prints a success message and exits `0`

- [ ] **Step 5: Commit**

```bash
git add scripts package.json package-lock.json .dance-of-tal
git commit -m "feat: bootstrap local vibe investing assets"
```

### Task 3: Document Studio and Discord operating flow

**Files:**
- Modify: `README.md`
- Create: `docs/discord-runtime-setup.md`

- [ ] **Step 1: Expand README with bootstrap and Studio import flow**

```md
## Quick Start

1. `npm install`
2. `npm run bootstrap`
3. `dot-studio .`
4. Import the local `investment-analysis-team` Act into the canvas
```

- [ ] **Step 2: Add Discord runtime setup notes**

```md
# Discord Runtime Setup

Use DOT Studio's built-in Discord integration after the workspace is bootstrapped.
Sync the current workspace, then operate the saved Act threads from Discord.
```

- [ ] **Step 3: Commit**

```bash
git add README.md docs/discord-runtime-setup.md
git commit -m "docs: add studio and discord runtime setup"
```

### Task 4: Record the upstream gap for `/analyze`

**Files:**
- Create: `docs/upstream-dot-studio-gap.md`

- [ ] **Step 1: Document the required upstream change**

```md
# Upstream DOT Studio Gap

This workspace repo can provide local assets and Discord-ready operating docs,
but the `/analyze` slash command itself must be implemented in the DOT Studio codebase.
```

- [ ] **Step 2: Capture the minimum upstream scope**

```md
- add `/analyze` slash command
- map command options into Act thread kickoff prompts
- route follow-up Discord thread messages into the same Act thread
```

- [ ] **Step 3: Commit**

```bash
git add docs/upstream-dot-studio-gap.md
git commit -m "docs: capture upstream dot-studio analyze gap"
```
