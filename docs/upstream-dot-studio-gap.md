# Upstream DOT Studio Gap

This repository provides the local asset layer for an investing workflow.
It does not modify `dot-studio` itself.

## What Still Belongs Upstream

- add a dedicated `/analyze` slash command
- normalize slash-command options into an Act kickoff prompt
- bind follow-up Discord thread messages to the same Act thread automatically
- optionally emit summary, report, and chart/table attachments with a more guided Discord UX

## Why This Is Separate

The current repository is a workspace/bootstrap repo.
The Discord bot implementation and slash-command routing live inside the `dot-studio` application codebase, not inside a workspace asset repo.
