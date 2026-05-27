@AGENTS.md

---

# 3. CLAUDE.md Content

Your current `CLAUDE.md` only has `@AGENTS.md`. That is okay, but I would improve it slightly.

Put this inside `apps/web/CLAUDE.md`:

```md
# Claude Instructions for Ikhora Fluent

Read and follow `AGENTS.md` before making any changes.

## Important Claude Behavior

When working on this repo:

1. First inspect the existing project structure.
2. Identify relevant files before editing.
3. Do not make random duplicate components.
4. Prefer shared reusable components.
5. Replace hardcoded page data with centralized seed data and service functions.
6. Preserve current routes and user flows unless a better structure is clearly needed.
7. Keep the UI premium, black-and-white dominant, and B2B-ready.
8. Do not expose API secrets in frontend code.
9. Use TypeScript types wherever possible.
10. Run lint/build/typecheck if available.
11. Summarize changed files and testing steps.

## Primary Goal

Move Ikhora Fluent from a static prototype to a production-grade SaaS foundation.

Focus areas:
- product architecture
- data-driven UI
- admin content management
- question bank
- student submissions
- scoring reports
- teacher/institute workflows
- premium design system
- Azure OpenAI integration readiness

## Do Not Do

- Do not only change colors.
- Do not only polish UI while leaving everything static.
- Do not remove key modules.
- Do not convert Ikhora Fluent into a generic chatbot.
- Do not publish AI-generated content directly without review status.
- Do not overwrite AI scores when teacher override is added.
- Do not hardcode API keys.