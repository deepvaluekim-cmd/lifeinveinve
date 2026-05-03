# Discord Vibe Investing Bootstrap

This repository bootstraps a local `DOT Studio` workspace for `vibe-investing`.

## Quick Start

1. Run `npm install`
2. Run `npm run bootstrap`
3. Open this folder with `dot-studio .`
4. Import the local `investment-analysis-team` Act into the canvas
5. Configure models for the generated performers if needed
6. Enable Discord integration in Studio and sync the workspace

## What Gets Generated

- local Dance bundles copied from `monarchjuno/vibe-investing`
- local custom Dance bundles for coordination and risk review
- local Performer assets for data, fundamental, quant, macro, risk, reporting, and coordination roles
- a local `investment-analysis-team` Act asset

## Scope

This repository gives you the local asset layer and setup flow.
It does not patch `dot-studio` itself.

The existing `dot-studio` Discord integration can run the generated Act and performer threads.
A dedicated `/analyze` slash command still requires an upstream `dot-studio` change.

## Commands

- `npm run bootstrap`: clone the source skills and generate local assets
- `npm run validate:assets`: verify the generated local assets exist and parse
