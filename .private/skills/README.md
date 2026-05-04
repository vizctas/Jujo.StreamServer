# Skills Repository

This directory contains the specialized agent skills available for the Jujo.StreamServer project.
Each skill is a deterministic protocol that can be invoked by the Master Orchestrator.

## Available Skills

| Skill | File | Domain |
|-------|------|--------|
| `ai-orchestrator` | `ai-orchestrator.md` | Meta-agent: workflows, token optimization, state management |
| `data-pipeline-forensics` | `data-pipeline-forensics.md` | Distributed systems analysis, throughput optimization |
| `systems-architecture-lead` | `systems-architecture-lead.md` | Scalable, modular system architectures |
| `data-platform-architect` | `data-platform-architect.md` | Multi-engine architecture, orchestration, IaC |
| `data-modeling-expert` | `data-modeling-expert.md` | Database schemas, data quality, idempotency |
| `security-risk-auditor` | `security-risk-auditor.md` | Defensive programming, PII masking, RBAC |
| `find-skill` | `find-skill.md` | Meta-skill: locate best skill for a task |
| `steam-integration-flow` | `steam-integration-flow.md` | Steam game source integration reference |
| `steam` | `steam.md` | Steam platform specifics |
| **`flutter-ui-architect`** | `flutter-ui-architect.md` | **Premium Flutter UI/UX, anti-vibecoding, design tokens** |
| **`flutter-state-architecture`** | `flutter-state-architecture.md` | **Riverpod state management, layer separation** |
| **`flutter-api-integration`** | `flutter-api-integration.md` | **Type-safe API clients, caching, offline resilience** |
| **`flutter-streaming-ux`** | `flutter-streaming-ux.md` | **Streaming UX patterns, pairing, telemetry, library** |

## Invocation Pipeline (Flutter Migration)

For the Flutter migration project, skills are invoked in this order:

1. **PLAN** → `ai-orchestrator` (epic decomposition, task tracking)
2. **ARCHITECTURE** → `systems-architecture-lead` + `flutter-state-architecture` (app structure, provider graph)
3. **UI/UX** → `flutter-ui-architect` + `flutter-streaming-ux` (design system, screens, flows)
4. **INTEGRATION** → `flutter-api-integration` + `data-platform-architect` (API layer, server communication)
5. **SECURE** → `security-risk-auditor` (auth, token storage, cert handling)

## Skill Selection Matrix (Flutter Project)

| Request Pattern | Recommended Skill(s) |
|----------------|---------------------|
| Design system, tokens, components | `flutter-ui-architect` |
| State management, providers, notifiers | `flutter-state-architecture` |
| API client, HTTP, caching, discovery | `flutter-api-integration` |
| Pairing UX, streaming config, dashboard | `flutter-streaming-ux` |
| Project planning, epics, task tracking | `ai-orchestrator` |
| Security, auth, certificates | `security-risk-auditor` |
| Backend architecture decisions | `systems-architecture-lead` |
| Game source integration details | `steam-integration-flow` |
