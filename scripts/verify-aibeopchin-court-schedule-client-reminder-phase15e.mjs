import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFileExists(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`Missing Phase 15-E file: ${relativePath}`);
  }
}

function assertIncludes(relativePath, terms) {
  const content = readFile(relativePath);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing term "${term}" in ${relativePath}`);
    }
  }
}

function main() {
  const required = [
    "prisma/migrations/20260525170000_litigation_deadline_client_reminder_phase15d/migration.sql",
    "src/features/litigation-deadline-reminder/litigation-deadline-reminder.schema.ts",
    "src/features/litigation-deadline-reminder/litigation-deadline-reminder.service.ts",
    "src/features/litigation-deadline-reminder/litigation-deadline-reminder.repository.ts",
    "src/app/api/cases/[caseId]/deadlines/route.ts",
    "src/app/api/cases/[caseId]/deadlines/[deadlineId]/notify-client/route.ts",
    "src/app/api/client/cases/[caseId]/deadlines/route.ts",
  ];

  for (const file of required) {
    assertFileExists(file);
  }

  assertIncludes("prisma/schema.prisma", [
    "model LitigationDeadlineNotification",
    "model ClientNotificationPreference",
    "courtName",
    "hearingKind",
    "clientVisible",
  ]);

  assertIncludes("src/features/litigation-deadline-reminder/litigation-deadline-reminder.schema.ts", [
    "PHASE15E_LITIGATION_DEADLINE_REMINDER",
    'LITIGATION_DEADLINE_REMINDER_VERSION = "15-E.1"',
    "computeReminderScheduledAt",
    "formatClientDeadlineDisplayLine",
    "DEADLINE_REMINDER_OFFSETS",
  ]);

  assertIncludes("src/features/litigation-deadline-reminder/litigation-deadline-reminder.service.ts", [
    "PHASE15E_LITIGATION_DEADLINE_REMINDER_SERVICE",
    "SKIPPED_NO_CONSENT",
    "scheduleDeadlineClientNotificationsService",
    "getNextClientVisibleDeadlineForPortalSummary",
  ]);

  assertIncludes("src/features/client-portal/client-portal.schema.ts", [
    "nextCourtDeadlineDisplay",
  ]);

  assertIncludes("src/components/client-portal/client-portal-client.tsx", [
    "다음 재판기일",
  ]);

  assertIncludes("src/components/cases/litigation-command-center-client.tsx", [
    "CommandCenterDeadlineRow",
    "lcc-deadline-create-open",
    "의뢰인에게 알림 예약",
  ]);

  assertIncludes("src/features/document-intelligence/litigation-command-center-action-feed.ts", [
    "LITIGATION_DEADLINE_MANUAL_CREATED",
    "LITIGATION_DEADLINE_NOTIFY_SCHEDULED",
    "LITIGATION_DEADLINE_IN_APP_SENT",
  ]);

  const evidence = readFile("docs/project-governance/IMPLEMENTATION_EVIDENCE.md");
  if (
    !evidence.includes(
      "[EVIDENCE-20260524-AIBEOPCHIN-COURT-SCHEDULE-CLIENT-REMINDER-PHASE15E]",
    )
  ) {
    throw new Error("IMPLEMENTATION_EVIDENCE.md missing Phase 15-E court schedule evidence");
  }

  console.log("verify:aibeopchin-court-schedule-client-reminder-phase15e — PASS");
}

main();
