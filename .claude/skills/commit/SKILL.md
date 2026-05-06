---
name: commit
description: Commit staged changes, push the feature branch, and open a PR via the GitHub MCP. Call this once local verification (tests/lint/typecheck) has passed. Takes ticket id, base branch, and a short change summary from the caller's prompt context.
---

Follow these steps precisely. Do NOT use the `gh` CLI — it is not installed and is explicitly disallowed by the main agent's system prompt. All GitHub writes go through the GitHub MCP (`mcp__github__*` tools). `git` commands via Bash are fine for local operations (diff, commit, push).

## Inputs (read from the caller's prompt)

The caller will give you:

- `ticket_id` — Linear ticket id (e.g. `AXC-660`). Used in commit message and PR body.
- `base_branch` — target branch for the PR (e.g. `dev`, `main`). **Never hardcode `dev`.** If the caller didn't specify, ask before proceeding.
- `summary` — 1-3 sentence description of what changed and why.
- `repo` — `owner/name` slug for the MCP call.

If any of those are missing from the prompt, stop and ask the caller rather than guessing.

## 1. Sanity-check local state

```bash
git status
git diff --cached
git branch --show-current
git log --oneline -5
```

Confirm: you are on a feature branch (NOT `base_branch`, NOT `main`/`master`), the staged diff matches what was intended, and there are no stray files.

## 2. Commit

Write a commit message using conventional commit format:

- Subject: `<type>(<ticket-id>): <short why>` — under 72 chars. Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`.
- Body (if the change is non-trivial): motivation, then what changed.
- Footer: a single line reading `Completed by a bee from Beehuman`.

Commit via HEREDOC so newlines are preserved:

```bash
git commit -m "$(cat <<'EOF'
feat(AXC-660): short why

Optional body paragraph explaining motivation and what changed.

Completed by a bee from Beehuman
EOF
)"
```

Substitute the real ticket id, type, and subject.

## 3. Push the feature branch

The clone's origin URL already contains an OAuth token, so plain `git push` authenticates. Push the current branch only — never push to `base_branch`, `main`, or `master`.

```bash
git push -u origin HEAD
```

The main agent's PreToolUse hook will block any push targeting a protected branch; if you see a denial, you're on the wrong branch.

## 4. Open the PR via the GitHub MCP

Call `mcp__github__create_pull_request` with:

- `owner` — first half of the `repo` slug
- `repo` — second half of the `repo` slug
- `base` — the caller's `base_branch` (do NOT default to `dev`)
- `head` — the current feature branch (from step 1's `git branch --show-current`)
- `title` — `[<TICKET-ID>] <short description>`, under 70 chars
- `body` — the template below

PR body template:

```markdown
## Summary

<2-4 bullets on what changed and why, from the caller's `summary`>

## Changes

- <key file/area 1>
- <key file/area 2>

## Verification

- <commands run locally, e.g. `npm test`, `pnpm lint`>
- <outcome>

Fixes <TICKET-ID>
```

Rules for the body:

- The `Fixes <TICKET-ID>` line is mandatory — it links the PR to the Linear ticket.
- Do NOT mention Claude, AI, Anthropic, or any code assistant anywhere in the title or body.
- Keep it under ~250 words.

## 5. Hand off PR URL to the main workflow

Return the PR URL from the MCP response along with the branch name and commit SHA (`git rev-parse HEAD`).

This skill does NOT touch Linear and does NOT end the run. After returning here, the main workflow MUST continue with its next step (updating the Linear ticket via `mcp__linear__save_issue`). Do not produce a final-style "report back" message that could be mistaken for the run's terminal output — keep the handoff minimal so the main workflow continues uninterrupted.
