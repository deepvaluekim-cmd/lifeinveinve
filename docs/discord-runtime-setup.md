# Discord Runtime Setup

This repository assumes you are using the built-in Discord integration that already exists in `dot-studio`.

## Steps

1. Run `npm install`
2. Run `npm run bootstrap`
3. Open this workspace with `dot-studio .`
4. Import the generated local Act and performers into the Studio canvas
5. Configure model settings for the imported performers if your runtime does not provide defaults
6. Open Studio settings and enable Discord integration
7. Save the bot token, choose the Discord server, and sync the current workspace
8. Open the synced Discord channels and run the analysis threads from there

## Current Runtime Shape

- Discord can operate performer and Act threads that already exist in the synced workspace
- follow-up messages should stay in the same mapped Discord thread
- approval and question prompts should be handled through the existing Studio Discord surfaces

## Current Gap

The dedicated `/analyze` slash command is not added by this repository.
That command must be implemented in the `dot-studio` codebase itself.
