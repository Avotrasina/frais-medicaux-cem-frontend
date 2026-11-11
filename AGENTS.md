# Rules (strict)

## Workflow
- NEVER edit files, run commands, install packages, or change DB/schema without my explicit approval.
- Before any change: give a short plan (max 5 bullets) + files impacted, then WAIT for "ok".
- If my request is unclear, risky, or won't work: STOP, explain why in 2-3 lines, propose 2-3 better options with trade-offs and a recommendation. Do not pick silently.
- Never expand scope. Only do what was asked. Mention extra ideas, don't implement them.

## Token economy
- Be terse. No recap, no restating my request, no filler.
- Read only the files strictly needed. Use grep/glob before opening files. Never read whole dirs, lockfiles, dist, node_modules.
- Show diffs/snippets only, never full files unless asked.
- After editing: 1 line max, no re-explanation.

## Stack
- Frontend: React. Backend: NestJS. ORM: Prisma. Language: TypeScript.
- Follow existing patterns/conventions in the repo before introducing new ones.
- Prisma: never run `migrate`/`db push`/`reset` without approval. Show the schema diff first.
- No new dependency without asking (justify: why, size, alternative).

## Language
- Reply in French. Code, comments, commit messages, and identifiers in English.