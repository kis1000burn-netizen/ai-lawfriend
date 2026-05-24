# AI법친 Product Roadmap — Phase 20~23 (공식 재번호)

**판정일**: 2026-05-24  
**한 줄 기준**: **단기 — 알림·모바일·운영 안정성 → 중기 — 사업화·AI 품질·사건 Pack**

---

## 0. Phase 번호 대조 (혼동 방지)

| Product Phase (본 문서) | 주제 | 코드베이스 **기존** Phase (완료·잠금) |
| --- | --- | --- |
| **17** | 운영 모니터링 / 장애 대응 | **Phase 17** (17-A~F) — `verify:aibeopchin-operations-monitoring-rc` |
| — | Reliability (retry · redelivery · pipeline) | **Phase 18** (18-A~E) — `verify:aibeopchin-reliability-rc` |
| — | Data Governance (retention · redaction · RC) | **Phase 19** (19-A~F) — `verify:aibeopchin-data-governance-rc` |
| **20** | Real External Messaging | **신규** (15-F stub · 18-B redelivery **위에** adapter) |
| **21** | Client Mobile / PWA Portal | **신규** |
| **22** | Tenant / Plan / Metering | **신규** |
| **23** | AI Quality / Case Pack | **신규** |

> 기존 **Phase 18 = Reliability**, **Phase 19 = Data Governance** 번호는 **증빙·verify·RC 잠금** 그대로 유지.  
> 사업화·모바일은 **Product 20~23**으로만 부른다.

---

## 1. 우선순위 (최종)

| 순위 | Product Phase | 이유 |
| --- | --- | --- |
| **1** | **20 — Real External Messaging** | 현장 체감 즉시 · 기반(15-F, 18-B, 19-B/F) 완비 |
| **2** | **21 — Client Mobile / PWA** | 알림 → 링크 → 모바일 포털 → 업로드·보완요청 |
| **3** | **22 — Tenant / Plan / Metering** | 실사용 흐름 확정 후 요금·제한 |
| **4** | **23 — AI Quality / Case Pack** | 중기 차별화 |

**흐름**: 실 알림(20) → 모바일 포털(21) → 사업화(22) → AI 품질·Pack(23)

---

## 2. Phase 20 — Real External Messaging (1순위 · **다음 착수**)

### 한 줄

실 카카오/이메일 adapter — **원본 첨부 금지 · 보안 링크만 · 로그인 후 열람 · 열람 로그 · 동의/수신거부**.

### 현장 체감

- 보완요청 발송
- 문서 공유 알림
- 의뢰인 제출 요청
- 기일/마감 안내
- 채팅 알림
- 재전달/실패 복구

### 선행 기반 (이미 있음)

| 앵커 | 역할 |
| --- | --- |
| **15-F** | Client Portal / Secure Delivery (stub channel) |
| **18-B** | External Message Safe Re-delivery (metadata-only) |
| **19-B** | Redaction (payloadSummaryJson) |
| **19-F** | Data Governance RC (dry-run · audit) |
| **17** | Ops monitoring · external message failure triage |

### Sub-phases

| Phase | 이름 | 산출물 (예정) |
| --- | --- | --- |
| **20-A** | External Message Adapter Contract | **완료** · `verify:aibeopchin-real-messaging-phase20a` |
| **20-B** | Email Adapter | **완료** · `verify:aibeopchin-real-messaging-phase20b` · SMTP/SendGrid · ExternalMessageLog SENT/FAILED |
| **20-C** | Kakao Adapter | **완료** · `verify:aibeopchin-real-messaging-phase20c` · Alimtalk registry · consent · allowlist |
| **20-D** | Provider Webhook / Status Sync | **완료** · `verify:aibeopchin-real-messaging-phase20d` · signature · idempotency · status mapping |
| **20-E** | Secure Delivery Integration | **완료** · `verify:aibeopchin-real-messaging-phase20e` · consent gate · secure link · view audit |
| **20-F** | Real Messaging RC | **완료** · `verify:aibeopchin-real-messaging-rc` · bundled · live send DRY_RUN default |

### 불변 원칙

- 원본 파일 직접 첨부 **금지**
- **보안 링크**만 외부 채널 전송
- **로그인 후** 열람
- **열람 로그** 저장
- **동의/수신거부** 확인 후 발송

### 예상 verify (후속)

```bash
npm run verify:aibeopchin-real-messaging-phase20a   # 20-A adapter contract
npm run verify:aibeopchin-real-messaging-rc         # 20-F bundled RC
```

---

## 3. Phase 21 — Client Mobile / PWA Portal

**선행**: Phase **20-F** (Real Messaging RC)

| Phase | 이름 | 상태 |
| --- | --- | --- |
| **21-A** | Mobile Client Portal Baseline | **완료** · `verify:aibeopchin-client-mobile-phase21a` |
| **21-B** | Mobile Upload UX | **완료** · `verify:aibeopchin-client-mobile-phase21b` |
| **21-C** | PWA Install / Home Screen | **완료** · `verify:aibeopchin-client-mobile-phase21c` |
| **21-D** | Push-ready Notification Surface | **완료** · `verify:aibeopchin-client-mobile-phase21d` |
| **21-E** | Mobile Accessibility / Low-end Device Smoke | **완료** · `verify:aibeopchin-client-mobile-phase21e` |
| **21-F** | Client Mobile / PWA RC | **완료** · `verify:aibeopchin-client-mobile-rc` |

**흐름**: 카카오/이메일 알림 → 링크 클릭 → 모바일 포털 → 사진·캡처 업로드 → 보완요청 응답

```bash
npm run verify:aibeopchin-client-mobile-phase21a   # 21-A baseline
npm run verify:aibeopchin-client-mobile-phase21b   # 21-B upload UX
npm run verify:aibeopchin-client-mobile-phase21c   # 21-C PWA install
npm run verify:aibeopchin-client-mobile-phase21d   # 21-D push surface
npm run verify:aibeopchin-client-mobile-phase21e   # 21-E a11y smoke
npm run verify:aibeopchin-client-mobile-rc          # 21-F RC bundled
```

---

## 4. Phase 22 — Tenant / Plan / Metering

**선행**: Phase **20~21** (실사용 흐름)

**한 줄 기준**: AI법친 Product Phase 22는 법무법인·변호사·의뢰인 사용 구조를 tenant 단위로 분리하고, 요금제·기능 권한·사용량 집계·과금 안전 원장을 하나의 사업화 RC로 잠그는 단계다.

| Phase | 이름 |
| --- | --- |
| **22-A** | Tenant / Organization Model |
| **22-B** | Plan / Feature Entitlement |
| **22-C** | Usage Metering |
| **22-D** | Billing-safe Usage Ledger |
| **22-E** | Admin Plan Console |
| **22-F** | Tenant / Plan / Metering RC |

**제한 예**: 사건 수 · 문서 분석 · 카카오 알림 · AI 호출 · Staff seat · tenant plan tier

**검증 (22-A)**:

```bash
npm run verify:aibeopchin-tenant-phase22a
```

**검증 (22-B)**:

```bash
npm run verify:aibeopchin-tenant-phase22b
```

**검증 (22-C)**:

```bash
npm run verify:aibeopchin-tenant-phase22c
```

**검증 (22-D)**:

```bash
npm run verify:aibeopchin-tenant-phase22d
```

**검증 (22-E)**:

```bash
npm run verify:aibeopchin-tenant-phase22e
```

**검증 (22-F RC)**:

```bash
npm run verify:aibeopchin-tenant-rc
```

---

## 5. Phase 23 — AI Quality / Case Pack

**선행**: Phase **20~22** (운영 현장 · 사업화 RC)

**한 줄 기준**: AI 출력 품질 evaluation·변호사 feedback loop·Case Pack builder·Evidence/Timeline/Issue pack·Client-safe progress pack을 Product Phase 23 RC로 묶어 현장 적합성을 잠근다.

| Phase | 이름 |
| --- | --- |
| **23-A** | AI Output Quality Evaluation |
| **23-B** | Lawyer Review Feedback Loop |
| **23-C** | Case Pack Builder |
| **23-D** | Evidence / Timeline / Issue Pack |
| **23-E** | Client-safe Case Progress Pack |
| **23-F** | AI Quality / Case Pack RC |

**검증 (23-A~E)**:

```bash
npm run verify:aibeopchin-ai-quality-phase23a
npm run verify:aibeopchin-ai-quality-phase23b
npm run verify:aibeopchin-ai-quality-phase23c
npm run verify:aibeopchin-ai-quality-phase23d
npm run verify:aibeopchin-ai-quality-phase23e
```

**검증 (23-F bundled)**:

```bash
npm run verify:aibeopchin-ai-quality-rc
```

---

## 6. Phase 24 — Litigation Operations

**선행**: Phase **23-F** · Code **14-E** Litigation Command Center

**한 줄 기준**: 소송 Task/Deadline 자동화·법원 제출 준비 pack·변호사 workbench·기일/제출 checklist·의뢰인 소송 진행 sync를 Product Phase 24 RC로 묶는다.

| Phase | 이름 |
| --- | --- |
| **24-A** | Litigation Task / Deadline Automation |
| **24-B** | Court Filing Preparation Pack |
| **24-C** | Lawyer Workbench Integration |
| **24-D** | Hearing / Submission Checklist |
| **24-E** | Client-facing Litigation Progress Sync |
| **24-F** | Litigation Operations RC |

**검증 (24-A~E)**:

```bash
npm run verify:aibeopchin-litigation-ops-phase24a
npm run verify:aibeopchin-litigation-ops-phase24b
npm run verify:aibeopchin-litigation-ops-phase24c
npm run verify:aibeopchin-litigation-ops-phase24d
npm run verify:aibeopchin-litigation-ops-phase24e
```

**검증 (24-F bundled)**:

```bash
npm run verify:aibeopchin-litigation-ops-rc
```

---

## 7. Phase 25 — Production Launch

**선행**: Product **24-F** · Code **16-D** Go/No-Go

**한 줄 기준**: Production launch checklist·tenant onboarding·operator training·live provider smoke·commercial ops readiness를 Product Phase 25 RC로 묶어 상용 출시 게이트를 잠근다.

| Phase | 이름 |
| --- | --- |
| **25-A** | Production Launch Checklist |
| **25-B** | Tenant Onboarding Runbook |
| **25-C** | Operator Training / Admin Playbook |
| **25-D** | Live Provider Smoke Plan |
| **25-E** | Commercial Ops Readiness Review |
| **25-F** | Production Launch RC |

**검증 (25-A~E)**:

```bash
npm run verify:aibeopchin-production-launch-phase25a
npm run verify:aibeopchin-production-launch-phase25b
npm run verify:aibeopchin-production-launch-phase25c
npm run verify:aibeopchin-production-launch-phase25d
npm run verify:aibeopchin-production-launch-phase25e
```

**검증 (25-F bundled)**:

```bash
npm run verify:aibeopchin-production-launch-rc
```

---

## 8. Phase 26 — Pilot Launch

**선행**: Product **25-F** · Code **16-D** Go/No-Go

**한 줄 기준**: Staging E2E commercial smoke·real tenant pilot·legal/terms/privacy·support/CS/incident desk·launch day runbook를 Product Phase 26 RC로 묶어 파일럿 출시 게이트를 잠근다.

| Phase | 이름 |
| --- | --- |
| **26-A** | Staging End-to-End Commercial Smoke |
| **26-B** | Real Tenant Pilot Setup |
| **26-C** | Legal / Terms / Privacy Final Review |
| **26-D** | Support / CS / Incident Desk Setup |
| **26-E** | Production Launch Day Runbook |
| **26-F** | Pilot Launch RC |

**검증 (26-A~E)**:

```bash
npm run verify:aibeopchin-pilot-launch-phase26a
npm run verify:aibeopchin-pilot-launch-phase26b
npm run verify:aibeopchin-pilot-launch-phase26c
npm run verify:aibeopchin-pilot-launch-phase26d
npm run verify:aibeopchin-pilot-launch-phase26e
```

**검증 (26-F bundled)**:

```bash
npm run verify:aibeopchin-pilot-launch-rc
```

---

## 9. Phase 27 — Pilot Operations

**선행**: Product **26-F** · Product **25-F**

**한 줄 기준**: Pilot usage monitoring·feedback intake·satisfaction review·issue triage/hotfix·conversion readiness를 Product Phase 27 RC로 묶어 파일럿 운영·상용 전환 게이트를 잠근다.

| Phase | 이름 |
| --- | --- |
| **27-A** | Pilot Usage Monitoring |
| **27-B** | Pilot Feedback Intake |
| **27-C** | Lawyer / Client Satisfaction Review |
| **27-D** | Pilot Issue Triage & Hotfix Loop |
| **27-E** | Conversion Readiness Review |
| **27-F** | Pilot Operations RC |

**검증 (27-A~E)**:

```bash
npm run verify:aibeopchin-pilot-operations-phase27a
npm run verify:aibeopchin-pilot-operations-phase27b
npm run verify:aibeopchin-pilot-operations-phase27c
npm run verify:aibeopchin-pilot-operations-phase27d
npm run verify:aibeopchin-pilot-operations-phase27e
```

**검증 (27-F bundled)**:

```bash
npm run verify:aibeopchin-pilot-operations-rc
```

---

## 10. Phase 28 — Paid Conversion / Scale

**선행**: Product **27-F** · Product **26-F**

**한 줄 기준**: Paid conversion contract·tenant migration·SLA tier·sales handoff·scale risk를 Product Phase 28 RC로 묶어 유료 전환·스케일 게이트를 잠근다.

| Phase | 이름 |
| --- | --- |
| **28-A** | Paid Conversion Contract Pack |
| **28-B** | Production Tenant Migration Checklist |
| **28-C** | SLA / Support Tier Policy |
| **28-D** | Sales / Onboarding Handoff Pack |
| **28-E** | Scale Risk Review |
| **28-F** | Paid Conversion / Scale RC |

**검증 (28-A~E)**:

```bash
npm run verify:aibeopchin-paid-conversion-scale-phase28a
npm run verify:aibeopchin-paid-conversion-scale-phase28b
npm run verify:aibeopchin-paid-conversion-scale-phase28c
npm run verify:aibeopchin-paid-conversion-scale-phase28d
npm run verify:aibeopchin-paid-conversion-scale-phase28e
```

**검증 (28-F bundled)**:

```bash
npm run verify:aibeopchin-paid-conversion-scale-rc
```

---

## 11. Phase 29 — Revenue Operations / Customer Success

**선행**: Product **28-F** · **27-F** · **22-F**

**한 줄 기준**: 유료 tenant의 매출 상태·사용 활성도·고객 성공 활동·갱신·이탈 위험·확장 기회를 운영 지표로 관리하고 Customer Success RC로 봉인한다.

| Phase | 이름 |
| --- | --- |
| **29-A** | Revenue Account Health Score |
| **29-B** | Customer Success Activity Log |
| **29-C** | Renewal / Churn Risk Monitor |
| **29-D** | Expansion Opportunity Tracker |
| **29-E** | Executive / Partner Success Report |
| **29-F** | Revenue Ops / Customer Success RC |

**검증 (29-A~E)**:

```bash
npm run verify:aibeopchin-revenue-ops-phase29a
npm run verify:aibeopchin-revenue-ops-phase29b
npm run verify:aibeopchin-revenue-ops-phase29c
npm run verify:aibeopchin-revenue-ops-phase29d
npm run verify:aibeopchin-revenue-ops-phase29e
```

**검증 (29-F bundled)**:

```bash
npm run verify:aibeopchin-revenue-ops-rc
```

**경계**: no automatic invoice / no payment mutation (22-D 연계)

---

## 12. Phase 30 — Enterprise Scale

**선행**: Product **29-F** · **28-F** · **22-F**

**한 줄 기준**: Enterprise deployment model·multi-tenant governance·partner/branch network·enterprise security review·scale monitoring/capacity forecast를 하나의 Product Phase 30 RC로 묶어 엔터프라이즈 스케일 게이트·Phase 29-F cross-link를 잠근다.

| Phase | 이름 |
| --- | --- |
| **30-A** | Enterprise Deployment Model |
| **30-B** | Multi-tenant Governance / Role Delegation |
| **30-C** | Partner / Branch Network Operations |
| **30-D** | Enterprise Security Review Pack |
| **30-E** | Scale Monitoring / Capacity Forecast |
| **30-F** | Enterprise Scale RC |

**검증 (30-A~E)**:

```bash
npm run verify:aibeopchin-enterprise-scale-phase30a
npm run verify:aibeopchin-enterprise-scale-phase30b
npm run verify:aibeopchin-enterprise-scale-phase30c
npm run verify:aibeopchin-enterprise-scale-phase30d
npm run verify:aibeopchin-enterprise-scale-phase30e
```

**검증 (30-F bundled)**:

```bash
npm run verify:aibeopchin-enterprise-scale-rc
```

---

## 13. Operator cross-link (17 → 18 → 19 → 20)

| 단계 | Product / Code Phase | 경로·verify |
| --- | --- | --- |
| Triage | 17 | `/admin/operations/monitoring` |
| Recovery | 18 (Reliability) | `/admin/operations/retry-jobs` |
| Retention preview | 19 (Governance) | `/admin/operations/data-governance` |
| **Real send** | **20** | `verify:aibeopchin-real-messaging-rc` · secure delivery + adapter |
| **Mobile portal** | **21** | `/client/cases` · `verify:aibeopchin-client-mobile-phase21a` |

---

## 9. 관련 문서

- [AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_RELIABILITY_RC_LOCK_SUMMARY.md) — Phase 18 · 18-B redelivery
- [AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_DATA_GOVERNANCE_RC_LOCK_SUMMARY.md) — Phase 19
- [AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md](./AIBEOPCHIN_OPERATIONS_MONITORING_RC_LOCK_SUMMARY.md) — Phase 17
- [AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md](../operations/AIBEOPCHIN_EXTERNAL_MESSAGE_REDELIVERY_RUNBOOK.md) — 18-B
- 15-F secure document delivery — `src/features/secure-document-delivery/`

**버전** **`PRODUCT-20-30.1`**
