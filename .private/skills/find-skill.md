# Skill: find-skill

## Purpose
Meta-skill for locating the best-suited skill for a given task or request.

## Invocation
When a user or orchestrator needs to determine which skill to apply, this skill evaluates:
1. The nature of the request (planning, architecture, security, data modeling, optimization, UI/UX, Flutter)
2. The current project context and active planning state
3. The available skill set

## Decision Matrix

| Request Pattern | Recommended Skill |
|----------------|-------------------|
| Task planning, workflow updates, token optimization | `ai-orchestrator` |
| Query plan debugging, data skew, memory spills, shuffle optimization | `data-pipeline-forensics` |
| System design, scalability, modularity, batch vs streaming | `systems-architecture-lead` |
| Multi-engine architecture, orchestration, connectors, IaC | `data-platform-architect` |
| Schema design, Medallion/Kimball, idempotency, data contracts | `data-modeling-expert` |
| Security audits, PII/PHI, RBAC, secrets management | `security-risk-auditor` |
| Streaming data pipelines, multimodal data flow | `systems-architecture-lead` + `data-pipeline-forensics` |
| New project initialization, planning from scratch | `ai-orchestrator` |
| Code review with security focus | `security-risk-auditor` |
| Performance tuning, resource optimization | `data-pipeline-forensics` |
| Database migration, schema evolution | `data-modeling-expert` |
| Infrastructure provisioning, cloud architecture | `data-platform-architect` |
| **Flutter UI components, design tokens, widget architecture** | **`flutter-ui-architect`** |
| **Flutter state management, Riverpod, providers** | **`flutter-state-architecture`** |
| **Flutter HTTP client, API integration, caching** | **`flutter-api-integration`** |
| **Streaming UX, pairing flows, game library, telemetry** | **`flutter-streaming-ux`** |
| **Flutter responsive layouts, animations, platform polish** | **`flutter-ui-architect`** |
| **Flutter auth, token storage, certificate handling** | **`flutter-api-integration` + `security-risk-auditor`** |
| **Game source integration (Steam, Epic, GOG, Xbox)** | **`steam-integration-flow` + `flutter-api-integration`** |
| **Onboarding wizard, setup flow** | **`flutter-streaming-ux`** |
| **Theme presets, dark/light mode** | **`flutter-ui-architect`** |

## Flutter Migration Pipeline

For the active Flutter migration project, invoke skills in this order:

```
1. ai-orchestrator          → Plan task, update planning.md
2. flutter-state-architecture → Define providers/notifiers needed
3. flutter-ui-architect      → Design component tree (no vibecoding)
4. flutter-api-integration   → Wire API calls
5. flutter-streaming-ux      → Validate UX patterns
6. security-risk-auditor     → Audit auth/secrets/certs
```

## Fallback
If no single skill matches, invoke `ai-orchestrator` to decompose the task into sub-tasks that map to individual skills.

## Context Awareness
This skill reads:
- `.private/docs/planning.md` for active task state (epic-based)
- `.private/docs/workflow.md` for architectural decisions
- `.private/skills/README.md` for available skill inventory
