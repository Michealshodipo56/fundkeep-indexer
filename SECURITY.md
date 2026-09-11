# Security Policy

## Scope

This policy covers the `fundkeep-indexer` service: the event poller and its REST API. Contract-level security lives in [`fundkeep-contract`](https://github.com/Michealshodipo56/fundkeep-contract)'s own `SECURITY.md`.

The indexer is read-only with respect to the chain — it never holds a signing key and never submits transactions. Its database is a derived cache of on-chain events; it is never the source of truth, and can always be rebuilt by re-polling from the contract's deployment ledger.

## Reporting a Vulnerability

If you find an issue — a way to inject data into the SQLite database via a crafted event value, an API endpoint that leaks another owner's data, or a denial-of-service in the poller — please report it privately.

Open a private security advisory on this repository (GitHub → Security → Report a vulnerability) rather than a public issue. Include a description, reproduction steps, and impact.

We aim to acknowledge reports within a few days.
