# Triage Labels

This project uses the five canonical triage labels with default names. Labels are stored in the `labels` array of each issue's YAML frontmatter.

## Label definitions

| Label | Meaning |
|-------|---------|
| `needs-triage` | Maintainer needs to evaluate this issue — determine priority, validity, and next step. |
| `needs-info` | Waiting on the reporter to provide more details before the issue can be evaluated. |
| `ready-for-agent` | Fully specified with clear acceptance criteria. An AFK agent can implement without additional human context. |
| `ready-for-human` | Understood and prioritized, but requires human judgment or implementation. |
| `wontfix` | Will not be actioned. Either out of scope, not reproducible, or an intentional non-fix. |

## State machine

```
[new issue]
    │
    ▼
needs-triage ──────────────────► wontfix
    │
    ▼
needs-info ◄────────────────────┘
    │
    ▼
ready-for-agent ──► (agent picks up, status → in-progress)
ready-for-human ──► (human picks up, status → in-progress)
```

The `triage` skill moves issues through this state machine by updating the `labels` field.
