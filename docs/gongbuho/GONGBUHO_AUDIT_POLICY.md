# GONGBUHO_AUDIT_POLICY.md

## AI법친 Gongbuho Audit Policy

본 문서는 공부호 운영 과정에서 발생하는 주요 행위의 감사 기준과 `AuditLog` / `GongbuhoTrace` 역할 분리를 정의한다.

이벤트 이름의 SSOT: [`src/lib/gongbuho/gongbuho-audit-events.ts`](../../src/lib/gongbuho/gongbuho-audit-events.ts).

---

## 1. 감사 정책 목적

공부호는 사건 유형별 질문 흐름, 출력 계약, 문서 생성 규칙, 금지 규칙을 포함하는 구조화 패킷이다.

다음 행위는 반드시 추적 가능해야 한다.

- 누가 공부호를 생성했는가
- 누가 공부호를 승인했는가
- 누가 공부호를 보관했는가
- 누가 공부호를 QuestionSet으로 Project 했는가
- 어떤 공부호가 사건에 적용되었는가
- 어떤 QuestionSet이 인터뷰에 바인딩되었는가
- 어떤 validationRules / forbiddenRules가 문서 생성 흐름에 적용되었는가

**주의**: Phase 4-F에서 관리자 경로에 **`writeGongbuhoAuditLog` → `auditLog`**(생성·승인·보관·Project)와 사건 측 Trace **`validationResult.gongbuhoPhase4Flow`** 마커(적용·인터뷰 바인드·문서 규칙)를 장착했다. 그 외 보조 감사·세부 무결성은 [GONGBUHO_OPERATIONS_QA](./GONGBUHO_OPERATIONS_QA.md) 및 백로그로 계속 좁혀 간다.

---

## 2. AuditLog와 GongbuhoTrace 역할 분리

| 구분 | AuditLog | GongbuhoTrace |
|---|---|---|
| 목적 | 운영자 행위 감사 | 공부호 적용 흐름 추적 |
| 중심 질문 | 누가 어떤 운영 행위를 했는가 | 어떤 공부호가 어떤 사건/질문셋/문서 흐름에 연결되었는가 |
| 주요 대상 | 관리자, STAFF, ADMIN, SUPER_ADMIN | packet, case, questionSet, interview, document |
| 보존 성격 | 감사/책임/권한 확인 | 재현성/설명가능성/운영 추적 |
| 예시 | 승인, 보관, Project 생성 | 사건 적용, 인터뷰 바인딩, 문서 규칙 적용 |

---

## 3. AuditLog 기록 대상

아래 이벤트는 AuditLog에 기록한다.

| 이벤트 | 설명 | 권장 행위자 |
|---|---|---|
| GONGBUHO_PACKET_CREATED | 공부호 패킷 생성 | ADMIN 이상 |
| GONGBUHO_PACKET_APPROVED | 공부호 승인 | ADMIN 이상 |
| GONGBUHO_PACKET_ARCHIVED | 공부호 보관 | ADMIN 이상 |
| GONGBUHO_QUESTION_SET_PROJECTED | QuestionSet Project 생성 | ADMIN 이상 |

---

## 4. GongbuhoTrace 기록 대상

아래 이벤트는 GongbuhoTrace에 기록한다.

| 이벤트 | 설명 |
|---|---|
| GONGBUHO_APPLIED_TO_CASE | 공부호가 사건 후보 또는 적용 흐름에 연결됨 |
| GONGBUHO_INTERVIEW_BOUND | 활성 QuestionSet이 인터뷰에 바인딩됨 |
| GONGBUHO_DOCUMENT_RULES_APPLIED | validationRules / forbiddenRules가 문서 생성 흐름에 적용됨 |

---

## 5. 전체 감사 이벤트 목록 (코드 참조)

`GONGBUHO_AUDIT_EVENTS` 상수 및 `AUDIT_LOG_EVENTS` · `GONGBUHO_TRACE_EVENTS` 분할은 다음 파일을 참고한다.

- `src/lib/gongbuho/gongbuho-audit-events.ts`

```ts
export const GONGBUHO_AUDIT_EVENTS = [
  "GONGBUHO_PACKET_CREATED",
  "GONGBUHO_PACKET_APPROVED",
  "GONGBUHO_PACKET_ARCHIVED",
  "GONGBUHO_QUESTION_SET_PROJECTED",
  "GONGBUHO_APPLIED_TO_CASE",
  "GONGBUHO_INTERVIEW_BOUND",
  "GONGBUHO_DOCUMENT_RULES_APPLIED",
] as const;
```

---

## 6. 이벤트별 필수 메타데이터

| 이벤트 | 필수 메타데이터 |
|---|---|
| GONGBUHO_PACKET_CREATED | packetId, actorId, role, createdAt |
| GONGBUHO_PACKET_APPROVED | packetId, actorId, role, approvedAt |
| GONGBUHO_PACKET_ARCHIVED | packetId, actorId, role, archivedAt |
| GONGBUHO_QUESTION_SET_PROJECTED | packetId, questionSetId, actorId, projectedAt |
| GONGBUHO_APPLIED_TO_CASE | packetId, caseId, actorId, appliedAt |
| GONGBUHO_INTERVIEW_BOUND | packetId, caseId, questionSetId, actorId, boundAt |
| GONGBUHO_DOCUMENT_RULES_APPLIED | packetId, caseId, documentId, rulesHash, appliedAt |

스키마 상 필드 이름은 저장소 레이아웃과 합치되도록 조정할 수 있다(동등 의미 유지).

---

## 7. 권한 정책

| 역할 | AuditLog 생성 가능 행위 | GongbuhoTrace 생성 가능 행위 |
|---|---|---|
| STAFF | 조회·Preview 등 제한적 기록(설계 선택) | Preview trace 가능(설계 선택) |
| ADMIN | 생성, 승인, 보관, Project | 사건 적용, 인터뷰 연결, 문서 규칙 적용 |
| SUPER_ADMIN | ADMIN 전체 + 운영 복구 | 전체 trace 확인 및 복구 관리 |

역할 문자열 레벨의 공부호 «운영» 권한은 [`gongbuho-permissions.ts`](../../src/lib/gongbuho/gongbuho-permissions.ts)와 교차 검증한다.

---

## 8. 금지 원칙

다음은 금지한다.

- STAFF가 승인, 보관, QuestionSet Project를 **실행**하는 것(403 또는 UI 미노출로 방어)
- 승인되지 않은 공부호를 운영 QuestionSet으로 **카탈로그 승격**하여 사용하는 것
- 검증 규약상 **허용되지 않은** 상태로 승인/보관을 변경하는 것
- GongbuhoTrace·사건 근거 없이 사용자에게 혼합된 공부호 적용을 **주장**하는 것
- validationRules / forbiddenRules 적용 없이 자동 문서를 확정하는 것
- 변호사 검토 없이 법률 문서를 최종 확정하는 것

---

## 9. 운영 판정

AuditLog는 운영자의 책임을 남긴다.

GongbuhoTrace는 공부호가 사건 흐름에 어떻게 적용되었는지를 남긴다.

두 기록은 서로 대체하지 않는다.

증빙 태그: `[EVIDENCE-20260523-GONGBUHO-PHASE4E-OPERATIONS-QA-AUDIT]`
