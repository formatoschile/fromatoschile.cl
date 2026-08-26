# Agent Setup

This project uses Claude Code custom sub-agents defined in `.claude/agents/`.

## How It Works

Claude (the main instance) acts as the orchestrator — it decides when to invoke sub-agents. Sub-agents are specialized roles invoked for specific tasks. They cannot spawn each other.

## Agents

| Agent | When to use |
|-------|-------------|
| `implementer` | Building new pages, components, or Sanity content integrations |
| `code-reviewer` | Reviewing implemented code before sign-off |
| `e2e-test-writer` | Writing Playwright tests for page-level flows and user journeys |
| `unit-test-writer` | Writing Vitest + RTL tests for component behavior and interactions |

## Available Skills

Skills provide reusable implementation guidelines. Agents reference them rather than duplicating their content.

| Skill | Purpose |
|-------|---------|
| `/vercel-react-best-practices` | React/Next.js performance patterns |
| `/vercel-composition-patterns` | Component composition and API design |
| `/frontend-design` | Distinctive, production-grade UI |
| `/web-design-guidelines` | Accessibility and UX best practices |
| `/simplify` | Post-implementation complexity review |

## Package Management

- Always use `bun` for dependency installation and updates in this repo.
- Do not use `npm`, `pnpm`, or `yarn` to add or update packages unless the user explicitly asks for a different tool.
- When adding or updating dependencies, pin them to the latest available version at the time of the change.
- Prefer `bun add <package>@latest` and `bun add -d <package>@latest` so the resolved version is explicitly pinned in `package.json`, unless the user explicitly requests a specific version.

## Environment Variables

- Whenever a new environment variable is introduced or used, add it to `src/lib/env.ts` and consume it via the exported `env` object.
- Never read new app environment variables directly from `process.env` outside `src/lib/env.ts`.

## Workflow

For a single task, Claude manually:
1. Invokes `implementer` to build it
2. Invokes appropriate test writer(s) for coverage
3. Invokes `code-reviewer` to validate
4. Handles blockers by re-invoking `implementer` with reviewer feedback
5. Commits when LGTM

For a full task file, use the custom command:

```
/execute-tasks path/to/tasks.md
```

This drives the full implement → test → review → commit loop for every task in the file, in dependency order.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
