# 공부호 엔진 명세 (GONGBUHO_ENGINE_SPEC)

**상태**: Phase 1 초안 · 코드 연동 전 **동작 계약(contract)** 목적  
**근거 패키지**: [GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md), [GONGBUHO_SAFETY_POLICY.md](./GONGBUHO_SAFETY_POLICY.md)

본 문서는 AI법친 코드베이스(Next.js · Prisma · 질문셋·문서 생성·사건 패키지)에 공부호를 적용할 때의 **표준 처리 순서**를 정의한다.

## 1. 용어

| 이름 | 역할 |
|------|------|
| **Packet** (`GongbuhoPacket` 등) | 공부호 정의 원본(APPROVED 등 상태) |
| **Trace** (`GongbuhoTrace`) | 특정 사건에 패킷이 적용·검증된 **불변에 가까운 스냅샷** |
| **Runtime** | Packet을 로드하여 질문셋 변환·검증·Trace 기록까지 조율하는 서비스 계층 |
| **caseType 매칭** | `Case`의 유형 분류값 ↔ Packet `caseType`(및 선택적 `domain`) |

## 2. 레포지토리 내 연결 후보 (비구속)

실제 디렉터리는 구현 단계에서 확정한다. 현 구조 상 자연스러운 부착 지점 예시:

- **사건 생성/유형 확정 시점**: `Case` 카테고리·세부 타입 선택 직후
- **인터뷰**: QuestionSet 정의 또는 런타임 질문 소스와 `questionFlow` 매핑
- **문서 초안 생성**: 템플릿·프롬프트 조립 시 `outputContract`·`forbiddenRules` 반영
- **사건 패키지 공유 스냅샷**(기존 6.x 설계와 합류): 패키지 DTO 또는 메타 레이어에 `gongbuhoTrace`(요약 블록) 포함 여부 검토
- **감사**: `writeAuditLog` 또는 전용 Trace 테이블이 이중 증거가 되도록 설계

## 3. 런타임 파이프라인(표준 순서)

### 3.1 사건 유형 확인

입력: `caseId`(또는 생성 직후 컨텍스트) 내 **사건 유형 식별자** (`caseType` enum 또는 카테고리 코드).

출력: `caseType`, `domain` 키(기본 `AI법친`).

### 3.2 승인된 공부호 패킷 조회

- 조건: `status === APPROVED`, `domain` 일치, `caseType` 일치  
- 버전 선택: 동일 코드 복수 시 **운영 규칙**(예: 최신 APPROVED, 또는 “고정 패치 버전” 플래그)을 표준 문서 또는 제품 플래그로 잠금.

오류 처리:

| 상황 | 동작 |
|------|------|
| 매칭 실패 | 기존 AI법친 **레거시 질문셋** 폴백 + Trace 없음 또는 `trace.status=SKIPPED_*` 규격 |
| DRAFT만 존재 | 적용 차단 또는 스테이징 플래그 필요 |

### 3.3 `questionFlow` → 질문셋 매핑

- 입력: 패킷 `questionFlow` 항목(`id`, `phase`, `text`, `purpose`, …)
- 출력: 플랫폼 QuestionSet 형식 또는 **실시간 세션 상태**(Phase 6.x와 호환 검토 필요)

매핑 원칙:

- `questionFlow[].id`는 인터뷰 답변 JSON 키·추적 ID로 재사용 가능해야 한다.
- `phase`는 UI 진행 단계 표시와 정렬 순서 보조용.

### 3.4 `reasoningFlow` → 요약 순서 적용

- 요약 생성 시 섹션 생성 순서·필수 섹션 누락 검사의 **기준 순서**.
- 완전 자동 강제는 아니고, 출력 후 **검증 단계**(3.6)와 연결.

### 3.5 `outputContract` → 요약·문서 골격

- 요약 본문: `summary` 배열 순서 또는 키를 섹션 제목 후보로 사용.
- 문서 종류 목록`documents`: 사용 가능 템플릿 후보·문서 작성 워크플로 입구로 전달.

### 3.6 `validationRules` 적용 — 생성물 검증

- 검증 결과는 **구조화 JSON**(통과 여부·경고 목록·차단 근거 코드) 형태를 권장.
- 결과는 반드시 **Trace 일부**(또는 Trace 연결 레코드)로 저장 가능해야 한다.

### 3.7 `forbiddenRules` 적용 — 위험 패턴 차단

- 차단 레벨: `BLOCK`(출력 불가)·`WARN`(변호사 전용)·`REPLACE`(완화 문구) 등 명세 가능.
- 정책 상세는 [GONGBUHO_SAFETY_POLICY.md](./GONGBUHO_SAFETY_POLICY.md).

### 3.8 `expertReviewPoints` 노출

- 변호사 사건 상세·패키지 뷰에 **체크리스트 후보**(사건 상태에 따라 숨김 가능).
- 패킷 변경 시 과거 Trace는 바뀌지 않음 · **표시 버전은 Trace에 저장된 패킷 버전** 우선.

### 3.9 Trace 저장 (필수)

다음 정보를 포함하는 것을 목표로 한다.

- `packetId`(또는 `code + version`), `caseId`
- 적용 일시(`createdAt`), 적용 주체 시스템 actor
- `inputSnapshot`(사건 카테고리·주요 선택값·증거 메타 등)
- `validationResult`, `riskFlags`, `humanApprovalStatus`
- 선택: 요약 해시·문서 생성 trace id와 링크

## 4. API 계약(Phase 2 목표 초안 — 구현 확정 아님)

관리자

- `GET/POST/PATCH …/admin/gongbuho`(목록·생성·수정)
- `POST …/approve`, `POST …/archive`(또는 PATCH status)

사건

- `GET /api/cases/[caseId]/gongbuho` · 적용 상태·패킷 메타 요약  
- `POST …/apply` · 명시 적용 또는 재적용 정책  
- `POST …/validate` · 요약/문서 본문에 대한 패킷 규칙 검증만 수행 가능  
- `GET …/trace` · 노출 가능한 필드만(PII 분리 원칙)

질문셋·템플릿 변환 보조 엔드포인트는 내부 전용 라우트로 두어 CSRF·권한을 관리한다.

## 5. 패키지와 사건 패키지(Case Package) 간 메타 필드 예시(JSON 병렬)

패키지 DTO 또는 별도 `gongbuhoTrace` 객체:

```json
{
  "gongbuhoId": "...",
  "gongbuhoCode": "LAW-FRAUD-001",
  "gongbuhoVersion": "1.0.0",
  "appliedAt": "...",
  "validationSummary": "...",
  "riskFlagCount": 0,
  "humanApprovalStatus": "PENDING_CLIENT"
}
```

서버 간 공유 형식 확정 전까지는 스냅샷 무결성(기존 `snapshotSha256` 패턴)과 별도 검토 필요.

## 6. 테스트·검수 기준(MVP 전)

1. 패킷 `FORBIDDEN` 문자열 포함 시 차단 테스트
2. `APPROVED` 아님 차단 테스트
3. Trace 생성 후 패킷 내용 수정 시 과거 불변 테스트
4. 사기 샘플 `LAW_FRAUD_001` 질문 `id`가 답변 키로 유지되는지

## 7. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 1 초안 |
