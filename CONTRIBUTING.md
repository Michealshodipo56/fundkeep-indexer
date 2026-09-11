# Contributing

## Branch Naming

```
feat/your-feature-name
fix/what-you-are-fixing
docs/page-or-section-name
refactor/scope-of-change
test/what-is-being-tested
```

## Commit Message Format

Conventional Commits, one logical change per commit:

```
type(scope): short description in lowercase
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.

## Pull Request Process

1. Fork and branch off `main` using the naming rules above.
2. Run `npm run typecheck` and `npm test` and confirm both pass before opening the PR.
3. Open a PR against `main`, referencing the issue it addresses.
4. Push follow-up changes to the same branch rather than opening a new PR.

## Ideas for Contribution

- **Postgres backend** — swap the SQLite `src/db.ts` for Postgres, for multi-instance deployments.
- **Keeper endpoint** — an authenticated route that triggers `check_deadline` sweeps, complementing the frontend's own on-load check. See `fundkeep-app/docs/concepts/deadline-unlock.md` for context.
- **Pagination** on `/api/activity/:owner` beyond the current `limit` param (cursor-based).
