# GovernOps Runtime Adapter

This directory contains the initial GovernOps Runtime Adapter structure.

The adapter is intentionally limited to TypeScript interfaces, placeholder functions, and TODO comments in this phase. Runtime behavior is not implemented yet.

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
