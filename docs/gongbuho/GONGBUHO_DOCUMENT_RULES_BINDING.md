# 공부호 문서 초안 규칙 바인딩 (GONGBUHO_DOCUMENT_RULES_BINDING)

작업 코드명 · **AI법친 Gongbuho Phase 3-F — Document Validation & Forbidden Rules Binding**

## 목적

`GongbuhoPacket.packetJson` 의 **`validationRules`**(검토 체크리스트)와 **`forbiddenRules`**(차단·경고 패킷 원문)을 **문서 초안 생성** 흐름에 연결하여, 금지 표현·위험 문구 후보·변호사 검토 포인트 연계를 **탐지·표시**하고, 동일 정보를 **문서 생성 응답 및 감사 가능한 저장소**에 남긴다.

- **본 Phase는 자동 수정하지 않는다.** 결과 본문 교체·삭제는 제외(에테르니언 기준 Phase 3-F 범위 외).
- 생성 문서는 **최종 법률문서가 아님** · 기존 가드레일·사용자 고지와 병행한다.

## 적용 경로

| 단계 | 처리 |
|------|------|
| 패킷 조회 | 최신 **`GongbuhoTrace`** → 없으면 **`Case.questionSetId` Gongbuho envelope** (`Phase 3-E` 요약 패킷 선택과 동일 유틸) |
| 프롬프트 | `validationRules` / `forbiddenRules` SSOT 줄을 `buildDocumentGenerationPrompt` appendix로 첨부(참조용 블록) |
| 초안 확정 후 | 본문에 대해 **`forbiddenRules` 트리거 탐지**(인용구 우선 · 없으면 5글자 이상 한글 구간 heuristic) · **통과 여부와 무관히** 탐지만 수행(LLM 교정 금지) |
| 검토 체크리스트 | `validationRules` 는 `PENDING_LEGAL_REVIEW` 만 표시(LLM 또는 코드로 “충족” 자동 단정 안 함) |
| expertReviewPoints | 패킷 루트 배열 그대로 API·`riskFlags` 에 별 종류 플래그로 연계(참조용 목록 · 자동 수정 없음) |

## 출력·저장 위치

- **HTTP 응답**(성공 시 `201`): 기존 페이로드 외 **`gongbuhoDocumentRules`** 에 전체 평가 객체(JSON 직렬화 가능 구조).
- **`LegalDocumentVersion.snapshotJson`**(v1 초안 생성 시점): 필드 **`gongbuhoDocumentRules`** 중복 저장(변호사·품질 감사).
- **`GongbuhoTrace`**(존재하는 경우): **`validationResult.documentDraftGenerations`** 배열 append · **`riskFlags`** 배열에 `GONGBUHO_DOCUMENT_RULES_PHASE3F` 출처 레코드를 누적(패킷 기반 검출 이력).

## `GongbuhoTrace` 병합 정책 (후보 정리)

| 필드 | Phase 3-F 동작 | 향후 후보 |
|------|----------------|-----------|
| `validationResult` | `documentDraftGenerations[]` 에 `{ occurredAtIso, legalDocumentId, documentType, evaluation }` 누적 | 스키마 검증 결과·패킷 `code` 버전 필터 키 분리 저장 |
| `riskFlags` | 평가 `riskFlags`(forbidden 후보 · validation 줄 · expert point)별로 Trace 상위 배열 항목 push | TTL·중복 병합·심각도 컬럼화 |
| `outputSnapshot` | 미변경 · 문서 초안 결과 전체 저장은 차기 과제 |

## 테스트

```bash
npx vitest run src/features/gongbuho/gongbuho-document-rules.service.test.ts
```

증빙: **`[EVIDENCE-20260523-GONGBUHO-PHASE3F-DOCUMENT-RULES-BINDING]`**
