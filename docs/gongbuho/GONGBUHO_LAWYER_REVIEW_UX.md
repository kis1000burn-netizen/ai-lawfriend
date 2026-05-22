# 공부호 Phase 3-G — 변호사·운영 검토 UX (Lawyer Review UX)

**목적**: 사건 상세에서 공부호 파이프라인의 상태를 역할별로 과도하게 기술적이거나 부족하게 보이지 않게 요약 노출합니다.  
패킷 신호는 **판단 결과가 아니라 검토·작성 보조 구조화 기준**임을 사용자에게 반복 고지합니다.

## 관련 코드

| 파일 | 역할 |
|------|------|
| `src/features/gongbuho/case-gongbuho-review-ux.ts` | 사건별 집계: 후보(`getCaseGongbuhoCandidates`), 패킷 JSON(`resolveGongbuhoPacketJsonForCaseSummary`), 최신 Trace 상세 필드, 최신 문서 버전 스냅샷의 `gongbuhoDocumentRules` |
| `src/components/cases/case-gongbuho-review-card.tsx` | 사건 상세 공부호 상태 카드 UI |
| `src/app/(protected)/cases/[caseId]/page.tsx` | 서버에서 카드 렌더(세션 역할별 `viewerKind`) |

### Vitest

- `src/features/gongbuho/case-gongbuho-review-ux.test.ts` — 순수 매퍼 `buildCaseGongbuhoReviewUxModel` 카운트·프리뷰 노출 규약

## 노출 레벨(UX 계약)

| 관측자 | 카드 타이틀·톤 | 노출 허용 |
|--------|----------------|----------|
| **의뢰인**(USER → `CLIENT`) | 「사건 정리 기준」 등 비기술 레이블 | 패킷 코드·버전 문자열 숨김. 질문/요약 규격·문서 자동 검토를 **설명형 문장**으로만 요약 |
| **변호사·스태프** (`LAWYER`/`STAFF`) | 「공부호 적용 기준」 | `code`/`version`, Trace 줄임, 후보 패킷 목록(traceApplied·draft 스캔 플래그), 요약 목차 존재 여부, 문서 규칙 카운트·위험 후보 카운트 |
| **플랫폼 관리자** (`ADMIN`/`SUPER_ADMIN`) | 「공부호 적용 기준 (플랫폼 관리자)」 | 위 + `packetJson` 프리뷰(길이 제한), `Trace.validationResult` JSON 문자열, `Trace.expertReviewPoints` 문자열 목록 우선 디코드 |

## 데이터 소스 우선순위(요약)

1. **APPROVED 후보·latestTrace 요약**: `gongbuho-case-candidate.service`
2. **패킷 JSON**: 최신 Gongbuho Trace의 패킷 본문, 없으면 `Case.questionSetId` 공부호 envelope의 `packetId`
3. **outputContract**: `parseGongbuhoSummaryHeadings(packetJson)`
4. **문서 검토 카운트**: 최신 저장 `LegalDocumentVersion.snapshotJson.gongbuhoDocumentRules`가 있고 `applied`이면 해당 체크리스트/`forbiddenHits`/`riskFlags`/`expertReviewPoints`; 없으면 패킷 `validationRules` 길이·`expertReviewPoints`(루트)로 **대체 표시**
5. **Trace 상세**(관리자): 동일 최신 Trace 행의 `validationResult`·`expertReviewPoints`

## 카피 원칙

- 「공부호가 적용되었다」는 의뢰인에게 패킷 ID·코드 라벨로 말하지 않는다 → **유형별 정리 기준 적용 가능** 등 일반 서술.
- 변호사·스태프에게는 **패킷·Trace는 운영·감사·재현 가능성**을 위해 식별자를 보여준다.
- 관리자는 **JSON 디버그** 접근 허용(단 프리뷰 길이 캡).
- 카드 하단 블록: **판단 보조 신호**, 최종 책임은 변호사·사건 당사자 관계 명시.

## SSR 렌더 타이밍과 데이터 신선도(Phase 3-G 설계 전제)

**요지**: 검토 카드에 보이는 수치·Trace·문서 규칙 요약은 **해당 페이지가 서버에서 렌더될 때(`loadCaseGongbuhoReviewUxModel`)의 DB 스냅샷**을 반영합니다. 이는 버그나 결함이 아니라, Phase 3-G에서 **서버 컴포넌트로 한 번에 집계**했기 때문에 생기는 자연스러운 특성입니다.

| 상황 | 사용자가 보는 카드 반영 시점 |
|------|------------------------------|
| 사건 상세에 **처음 진입·전체 새로고침** | 최신 상태에 가깝게 표시 |
| 동일 페이지에 머문 채 클라이언트만 **문서 생성·재생성** 등 API 호출 후 DOM만 갱신 | 카드 영역은 **갱신되지 않을 수 있음**(SSR 결과가 클라 트리에 남음) |

**직후 신선도를 맞추려면**(선택 UX, 차기 Phase 예: **Phase 3-H · UX 리프레시**):

- 문서 생성 성공 처리 직후 `router.refresh()`(또는 동등한 서버 컴포넌트 재페치)로 **사건 상세 전체 재렌더**를 트리거하거나,
- 카드만 `fetch` 하는 경량 **`/api/cases/:id/gongbuho/review-summary`** 등을 두고 클라 컴포넌트로 치환·병합.

요약 재생성(`POST …/summary/generate`) 후에도 동일 원리가 적용됩니다 — 서버 페이지를 다시 그리면 집계가 맞춰집니다.

## 다음 단계 후보

- **Phase 3-H · UX 리프레시**(선택): 위 SSR 한계 완화, 스켈레톤/로딩, 위험 플래그 상세 모달, Trace 확장 패널, tooltip, 클라 플로우와의 정합.
- **Phase 4-A · 관리자 패킷 운영 화면**: API는 갖춰졌으나 운영자가 패킷을 목록·상세·검토·승인·투영하는 UI가 필요 — 프로젝트 후속 로드맵에서 우선 순위 높음(README 「Phase 4」 참조).
- 변호사 전용 `/lawyer/cases/[caseId]`가 생기면 동일 카드를 재사용하거나 역할별 API로 CSR 갱신을 검토.

증빙 태그: `[EVIDENCE-20260523-GONGBUHO-PHASE3G-LAWYER-REVIEW-UX]`
