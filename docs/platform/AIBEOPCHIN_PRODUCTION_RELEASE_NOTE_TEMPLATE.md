# AI법친 Production Release Note (Template)

**Release**: `NEXT_PUBLIC_APP_VERSION` / tag  
**Date**: YYYY-MM-DD  
**Deploy commit**: `<full-sha>`  
**Rollback target**: `<rollbackTargetCommit>`

---

## Summary

- Phase **16-C** — Full Legal Ops Platform production cutover
- Domain stack: Voice · Gongbuho · CMB · AI Core · Doc Intelligence · LCC · Client Portal

---

## Migrations

- [ ] `npm run db:deploy` applied
- [ ] Pending migrations: **none**
- Notable dirs: Phase 15 client portal · deadline reminder · secure document delivery

---

## Environment / Provider switches

| Item | Mode |
| --- | --- |
| Kakao Alimtalk | stub / live |
| Email delivery | stub / live |
| OAuth providers | google / kakao / naver (list active) |

---

## Verification

- [ ] `ops:production-release-cutover-live-check` PASS
- [ ] Staging live smoke (16-B) PASS on same commit

---

## Known issues / follow-ups

- (none)

---

## Operator notice

- (optional — maintenance window, new client portal features, etc.)

---

## Rollback

If critical failure within 24h: redeploy **`rollbackTargetCommit`** per [minimum-rollback-playbook.md](../minimum-rollback-playbook.md).
