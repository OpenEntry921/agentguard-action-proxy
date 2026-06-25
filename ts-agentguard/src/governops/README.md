# GovernOps Runtime Adapter

This directory contains the KGLD demo typed adapter surface only for the GovernOps Runtime Adapter.

The adapter is intentionally limited to TypeScript interfaces, placeholder functions, and TODO comments in this phase. Runtime behavior is not implemented yet, and the KGLD demo typed adapter surface does not compile, evaluate, persist, issue tokens, or execute policies.

## Planned flow

```text
AGAF
↓
Runtime Policy
↓
Harness
↓
Token
↓
AgentGuard
```

## Files

- `compiler.ts` — TODO placeholder for compiling AGAF artifacts into runtime policy artifacts.
- `context.ts` — TODO placeholder for mapping AgentGuard request context into GovernOps runtime context.
- `decision-record.ts` — TODO placeholder for recording policy decisions in a GovernOps-compatible shape.
- `harness.ts` — TODO placeholder for connecting runtime policy evaluation, token generation, and AgentGuard execution.
- `index.ts` — Barrel exports for the adapter surface.
- `sample-kgld.ts` — Static KGLD GovernOps demo sample data for the 5M request → 50M agent decision BLOCK scenario.
- `preview-adapter.ts` — Read-only adapter that assembles static GovernOps preview data for future UI integration.
