# AI법친 Legal Reliability Production Migration Runbook

## Phase

**53-B** Production Migration Apply & Live Status Evidence

**Marker**: `phase53b-production-migration-runbook`

## Preconditions

- Phase 53-A Production Go-Live Approval Gate PASS
- Approver ledger recorded
- Rollback owner acknowledged
- Production `DATABASE_URL` confirmed
- No destructive reset allowed (`NO_DESTRUCTIVE_RESET_IN_PRODUCTION`)

## Forbidden Commands

The following commands are forbidden in production validation:

- `prisma migrate reset`
- `prisma db push --force-reset`
- `DROP DATABASE`
- `TRUNCATE` production tables for validation
- Any manual destructive schema operation without separate emergency approval

## Required Commands

### 1. Validate Prisma schema

```bash
npx prisma validate
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Check migration status before apply

```bash
npx prisma migrate status
```

### 4. Apply production migration

```bash
npx prisma migrate deploy
```

### 5. Check migration status after apply

```bash
npx prisma migrate status
```

### 6. Run production migration evidence gate

```bash
npm run verify:aibeopchin-legal-reliability-production-migration-evidence
```

## Required Evidence

- Command execution timestamp
- Operator
- Masked production `DATABASE_URL`
- Migration names
- Exit code
- Command output reference
- Migration status after apply (clean)
- Prisma validate/generate result
- Rollback impact review
- Rollback owner acknowledgement

## Final Rule

Production migration is not complete until post-apply migration status is clean and no schema drift is detected.

**버전** **`53-B.1`**
