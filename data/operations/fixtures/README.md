# Operations monitoring fixtures (Phase 17-F)

Static triage samples for operator training and live smoke shape validation.

| Fixture | Domain | Use |
| --- | --- | --- |
| `operations-monitoring-audit-issue.fixture.json` | AI_USAGE | Audit `*_FAILED` triage |
| `operations-monitoring-cron-failure.fixture.json` | — | CronJobExecutionLog FAIL |
| `operations-monitoring-external-message-failure.fixture.json` | NOTIFICATION | ExternalMessageLog FAIL |

Validate: `npm run verify:operations-monitoring-fixtures`

Do not commit real user IDs or case IDs from production — samples only.
