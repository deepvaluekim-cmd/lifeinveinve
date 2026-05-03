# Discord Vibe Investing Integration Design

## Summary

Build a personal-use Discord-first investing workflow on top of DOT Studio.
Discord is the primary operating surface. DOT Studio remains the runtime, session, and asset hub. `vibe-investing` remains the source repository for reusable investing skills that we map into DOT Studio Dances, Performers, and one core Act.

The first version should support:

- slash-command-driven analysis start
- follow-up natural-language refinement inside the same Discord thread
- task-centric team selection with optional style bias
- final delivery as a short Discord summary, a Markdown report, and chart/table artifacts

## Goals

- Start analysis from Discord with a small, predictable command surface
- Reuse DOT Studio's existing Discord-to-Act runtime path instead of inventing a parallel execution stack
- Represent `vibe-investing` skills as DOT assets that can be inspected and evolved in Studio
- Support US equities, Korean equities, ETFs, indexes, and macro-oriented requests
- Make the system usable by one person without multi-tenant complexity

## Non-Goals

- Full asset authoring from Discord
- Team collaboration and role-based access workflows for multiple users
- Per-request arbitrary dynamic Act generation
- Production-grade brokerage, portfolio execution, or trading automation

## Architecture

The system has three layers.

### 1. Discord layer

Discord is the user-facing control surface.

- `/analyze` starts a new analysis thread
- optional slash-command parameters select task focus and style bias
- follow-up natural-language prompts continue in the mapped Discord thread
- the bot posts progress, approvals/questions when needed, and final artifacts

### 2. DOT Studio runtime layer

DOT Studio is the execution and orchestration layer.

- owns the Discord integration, session lifecycle, thread mapping, and runtime state
- runs one core investing Act per analysis thread
- routes follow-up messages to the same Act thread
- reuses existing performer and Act participant chat runtime services

### 3. Skill and asset layer

`vibe-investing` is the source of analysis capability.

- selected `SKILL.md` folders are imported as Dances
- Dances are composed into investing-focused Performers
- Performers are attached to one reusable `investment-analysis-team` Act

## Core Asset Model

### Dances

Map `vibe-investing` skills into DOT Dances with minimal transformation.

Initial Dance set:

- `openbb-data-fetcher`
- `company-analysis`
- `traditional-market-analysis`
- `quant-research`
- `financial-report`
- investor-style overlays such as `buffett`, `graham`, `damodaran`, and `druckenmiller`

### Performers

Create task-centric Performers that each own one primary responsibility.

Initial Performer set:

- `data-analyst`: gathers and validates market or company data
- `fundamental-analyst`: narrative, business quality, valuation
- `quant-analyst`: factor, price, signal, technical, and regime analysis
- `macro-analyst`: market, liquidity, macro, and cross-asset context
- `risk-analyst`: downside cases, uncertainty, and contradiction checks
- `report-editor`: final synthesis, report formatting, chart/table packaging

Style bias is implemented as Dance overlays or prompt instructions on top of these Performers rather than as entirely separate teams.

### Act

Create one reusable Act:

- `investment-analysis-team`

The Act owns:

- participant list
- relations between analysis participants
- runtime messaging rules
- shared output contract for the final report bundle

The Act stays structurally stable. Request options influence prompts, priorities, and output emphasis, not the Act topology.

## Command Design

Discord is slash-command-first.

### Primary command

```text
/analyze symbol:<ticker-or-topic> team:<fundamental|quant|macro|risk|report> style:<optional> market:<optional> horizon:<optional>
```

Examples:

```text
/analyze symbol:NVDA team:fundamental style:damodaran
/analyze symbol:KOSPI team:macro
/analyze symbol:QQQ team:quant horizon:swing
```

### Command behavior

- `/analyze` creates a new Discord thread or mapped runtime thread for the request
- the command payload is normalized into a structured kickoff prompt
- Studio starts the `investment-analysis-team` Act thread
- the selected `team` value controls which participant leads first and which outputs are required
- the optional `style` value biases the judgment framework

### Follow-up flow

After kickoff, the user continues with natural language in the same Discord thread.

Examples:

- `밸류에이션 가정만 더 보수적으로 다시 봐줘`
- `리스크 파트만 먼저 요약해줘`
- `표로 비교해줘`
- `한국 시장 기준으로 다시 맥락 붙여줘`

These follow-up prompts stay attached to the same runtime thread and should not create a new analysis unless the user explicitly starts another `/analyze`.

## Data Flow

### Start flow

1. User runs `/analyze` in Discord.
2. Discord adapter validates the command and selected options.
3. Adapter creates or opens a mapped Studio Act thread.
4. Adapter sends a normalized kickoff message to the Act lead participant.
5. Participants collaborate inside the existing Studio runtime.
6. The `report-editor` produces final outputs.
7. Discord receives:
   - a short summary message
   - a Markdown report file
   - generated chart/table artifacts

### Follow-up flow

1. User sends a normal Discord message in the mapped thread.
2. Discord adapter routes it back to the same Act thread context.
3. Studio wakes the relevant participant or lead coordinator.
4. Updated summary or revised artifacts are sent back to Discord.

## Output Contract

Every completed analysis should produce three output layers.

### 1. Discord summary

A concise message with:

- instrument or topic name
- current stance or conclusion
- top 3 supporting points
- top 3 risks

### 2. Markdown report

A structured report file containing:

- request metadata
- analysis scope and assumptions
- fundamental, quant, macro, and risk sections as relevant
- final judgment
- watch items and next questions

### 3. Visual artifacts

Chart and table outputs, such as:

- valuation comparison table
- key metric table
- price or factor chart
- regime summary table

The first version should prefer deterministic file formats such as `.md`, `.csv`, `.png`, or `.svg`.

## Error Handling

The system should fail in a way that is explicit and recoverable from Discord.

### Input errors

- unknown ticker or unsupported symbol format
- missing or invalid slash-command option
- insufficient context for a macro or topic request

Behavior:

- reply with a short correction message
- do not create a long-running runtime session if validation fails early

### Runtime errors

- missing imported Dance or Performer asset
- unavailable data source
- chart generation failure
- timeout or stalled participant

Behavior:

- post a bounded error summary to the Discord thread
- preserve any partial text summary if it exists
- mark which stage failed: data, analysis, or reporting
- allow retry from the same thread with a slash command or follow-up message

### Approval and question handling

If the runtime pauses for permission or user input, Discord should reuse DOT Studio's existing approval and question surfaces.

For personal-use v1, approvals should stay simple:

- allow once
- allow always
- deny

## Testing Strategy

### Unit tests

- slash-command option normalization
- ticker/topic request parsing
- team and style routing logic
- output bundle manifest creation
- Discord thread-to-session mapping behavior

### Integration tests

- `/analyze` creates the expected Act thread and lead routing
- follow-up Discord message resumes the same analysis thread
- completed run emits summary plus file artifacts
- permission/question pauses round-trip correctly through Discord

### Manual verification

- run DOT Studio locally with Discord integration enabled
- invoke `/analyze` for US, KR, ETF, and macro examples
- verify artifact upload and readable thread summary
- verify a follow-up refinement message updates the same thread

## Recommended Implementation Phases

### Phase 1: Runtime-compatible MVP

- import `vibe-investing` skills as Dances
- create initial Performers
- create the core `investment-analysis-team` Act
- add `/analyze` command and kickoff normalization
- return summary plus Markdown report

### Phase 2: Artifact-rich output

- add chart/table generation pipeline
- attach artifacts to Discord responses
- improve report packaging and naming

### Phase 3: Refinement UX

- support richer follow-up instructions
- add retry/revise commands
- tune team routing and style overlays

## Key Design Decisions

- Reuse one stable investing Act instead of dynamic per-request team generation
- Keep Discord as the operating surface, not the asset authoring surface
- Use task-centric teams as the primary selection axis
- Implement style as a bias overlay rather than separate full teams
- Keep the first version personal-use and single-operator oriented

## Acceptance Criteria

The design is successful when:

- a user can start an investing analysis from Discord with `/analyze`
- the request is executed through DOT Studio's existing Act runtime path
- the selected team focus changes the analysis emphasis
- the optional style changes the judgment lens
- the user can refine the same analysis by chatting in the same Discord thread
- the final response includes a Discord summary, a Markdown report, and chart/table artifacts
