# Litigation Operations RC Runbook (Product Phase **24-F**)

**한 줄**: Product Phase 24-A~E를 bundled verify로 묶어 배포 전 Litigation Operations 게이트를 운영한다.

---

## 1. Operator checklist

1. 선행 RC PASS: `npm run verify:aibeopchin-ai-quality-rc`
2. Sub-phase verify (자동 순차): 24-A ~ 24-E
3. Master RC: `npm run verify:aibeopchin-litigation-ops-rc`
4. 증빙: `IMPLEMENTATION_EVIDENCE.md` 24-A~F tags

---

## 2. 검증

```bash
npm run verify:aibeopchin-litigation-ops-rc
```

**버전** **`24-F.1`**
