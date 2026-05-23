# 공부호 Legal Knowledge Compiler 정책 (GONGBUHO_LEGAL_KNOWLEDGE_COMPILER_POLICY)

**상태**: AI법친 공부호 **지식 구축 헌법** — 수집·변환·패킷화·반영의 최상위 원칙

**한 줄 기준**: 공부호는 인터넷 글을 학습하는 엔진이 아니라, 사회에서 드러나는 **법률 수요**를 **공신력 있는 법률 지식**과 **전문가 검수**로 변환하는 **Legal Knowledge Compiler**다.

**관련 문서**: [GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md) · [GONGBUHO_SAFETY_POLICY.md](./GONGBUHO_SAFETY_POLICY.md) · [GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md)

**증빙 태그**: **`[EVIDENCE-20260523-GONGBUHO-LEGAL-KNOWLEDGE-COMPILER-POLICY]`**

---

## 1. 목적

본 문서는 AI법친 **공부호(Gongbuho)** 가 법률 지식을 **어디서 가져오고**, **어떻게 검증·구조화**하며, **제품에 반영**하는지에 대한 **헌법적 원칙**을 고정한다.

공부호의 정체성:

| 용어 | 정의 |
| --- | --- |
| **Legal Knowledge Compiler** | 사회적 법률 수요 신호 → 공신력 출처 기반 지식 → 변호사 검수 → 버전 관리 가능한 **공부호 패킷**으로 **컴파일**하는 체계 |
| **레이더(Radar)** | 검색·트렌드·질문 유형 등 **수요 감지**만 수행. **본문 학습·저장·패킷 원문**으로 사용하지 않음 |
| **공부호 패킷** | 질문 흐름·출력 계약·금지 규칙 등이 묶인 **APPROVED** 가능한 구조화 산출물 ([GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md)) |

공부호는 **네이버·블로그·카페·지식인 등 UGC 본문을 수집·학습하는 엔진이 아니다.**

---

## 2. 금지 원칙

다음은 **공부호 지식 구축·운영·자동화 파이프라인** 전 구간에서 금지한다.

### 2.1 네이버 원문 무단 수집 금지

- 네이버 검색·지식iN·블로그·카페·뉴스 등 **플랫폼 본문**을 크롤링·스크래핑·복제 저장·모델 학습 입력으로 사용하지 않는다.
- 네이버 API·화면 결과의 **제목·스니펫·본문**을 공부호 패킷 필드·프롬프트·few-shot 예시에 **그대로** 넣지 않는다.
- “네이버에서 많이 나온 답”을 **법률 근거 없이** 공부호 질문·답변 템플릿으로 승격하지 않는다.

### 2.2 블로그·카페·지식iN 본문 저장 금지

- 출처가 개인·비공식 커뮤니티인 **UGC 본문**을 DB·파일·로그·벡터 DB에 **영구 저장**하지 않는다.
- 운영 편의를 위한 **임시 메모·스크린샷 보관**도 패킷 SSOT·감사 재현 경로에 포함하지 않는다.
- 인용이 필요하면 **공신력 출처(법령·판례·공공기관)** 로 **재확인·재작성**한 뒤, 출처 메타만 패킷·Trace에 남긴다.

### 2.3 출처 불명 인터넷 글의 공부호 패킷화 금지

- URL만 있고 **법령·판례·공공자료·전문가 검수**와 연결되지 않은 인터넷 글을 패킷 **근거**로 삼지 않는다.
- “인터넷에 이렇게 쓰여 있다” 수준의 문장을 `questionFlow`·`summaryContract`·`forbiddenRules` **직접 입력**으로 넣지 않는다.
- AI 생성 초안이라도 **최종 패킷**에는 §5 검수 게이트를 통과한 내용만 반영한다.

---

## 3. 허용 원칙

네이버 및 유사 채널은 **레이더**로만 사용한다. 허용 범위는 **수요 신호**에 한정한다.

| 허용 | 설명 | 산출 예 |
| --- | --- | --- |
| **검색 트렌드·질문 유형 감지** | 어떤 법률 주제·표현이 **수요**로 드러나는지 관찰 | 키워드 빈도·계절성·지역성(집계·비식별) |
| **키워드·사건 유형 분류** | 수요 신호를 **사건 카테고리·공부호 코드** 후보로 **매핑 제안** | `LAW-FRAUD-001` 후보, 신규 패킷 과제 백로그 |
| **법률 수요 맵 작성** | “무엇이 많이 묻히는가”를 **제품·운영 계획** 입력으로 사용 | 분기별 수요 맵, 질문셋 보강 우선순위 |

**주의**: 허용 산출물은 **집계·분류·우선순위** 수준이며, UGC **원문**이나 **법률 결론**을 담지 않는다.

---

## 4. 지식 변환 절차

공부호 지식은 아래 **단방향 파이프라인**으로만 구축한다.

```text
[1] 네이버·유사 채널 — 수요 감지 (레이더)
        ↓  (키워드·유형·우선순위만)
[2] 법령·판례·공공자료 — 근거 확인
        ↓  (인용·조문·판례 번호·공공 URL/버전)
[3] 변호사 검수 — 법률·표현·고위험 쟁점
        ↓  (승인·수정·반려 기록)
[4] 공부호 패킷 생성 — 구조화·버전·상태
        ↓  (DRAFT → APPROVED, [GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md))
[5] AI법친 반영 — QuestionSet·인터뷰·문서·Trace
        ↓  ([GONGBUHO_ENGINE_SPEC.md](./GONGBUHO_ENGINE_SPEC.md))
```

| 단계 | 담당·도구 | 금지 |
| --- | --- | --- |
| 1 수요 감지 | 운영·제품 기획, 집계 도구 | UGC 본문 저장·패킷 직접 입력 |
| 2 근거 확인 | 법무·리서치, 공신력 DB | 출처 없는 AI 환각을 근거로 기록 |
| 3 변호사 검수 | 담당·자문 변호사 | STAFF 단독 `APPROVED` (정책상 ADMIN+ 승인은 [GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md) 참조) |
| 4 패킷 생성 | ADMIN·공부호 관리 UI/API | 검수 전 APPROVED |
| 5 제품 반영 | Case apply·QuestionSet project | 미승인 패킷의 운영 승격 |

---

## 5. 검수 게이트

패킷 **DRAFT → APPROVED** 및 제품 반영 전, 아래 게이트를 **모두** 충족해야 한다.

| 게이트 | 확인 내용 |
| --- | --- |
| **출처 검증** | 질문·요약·문서 규칙의 법적 주장이 **법령·판례·공공자료** 또는 **변호사 검수 메모**에 연결됨 |
| **법률 근거 확인** | 조문·판례·행정 해석 등 **식별 가능한 근거**가 패킷 메타 또는 운영 부록에 기록됨(본문 일괄 복붙 금지 — 요약·포인터 권장) |
| **변호사 승인** | `humanApproval`·승인 API·AuditLog에 **승인자·시각** 남음 ([GONGBUHO_SAFETY_POLICY.md](./GONGBUHO_SAFETY_POLICY.md) §7 교차) |
| **개인정보 제거** | 수요 조사·초안·검수 과정의 **실명·연락처·사건 식별 정보**가 패킷·Trace·로그에 포함되지 않음 |

게이트 미충족 시: **패킷 승격·사건 적용·QuestionSet project**를 중단한다.

---

## 6. 공부호 패킷 생성 기준

패킷 JSON·DB 레코드는 **컴파일 결과물**만 담는다.

1. **입력**: §4 [2]〜[3]에서 확정된 구조(질문 흐름·출력 계약·금지 규칙·humanApproval).
2. **형식**: [GONGBUHO_FIELD_MAPPING.md](./GONGBUHO_FIELD_MAPPING.md) · [GONGBUHO_STANDARD.md](./GONGBUHO_STANDARD.md) 준수.
3. **상태**: 초안 `DRAFT` → 검수 통과 후 `APPROVED` → 폐기 시 `ARCHIVED` ([GONGBUHO_ADMIN_APPROVAL_UI.md](./GONGBUHO_ADMIN_APPROVAL_UI.md)).
4. **금지 내용**: UGC 원문, 출처 불명 URL 본문, 네이버 스니펫, 개인 사건 실명 데이터.
5. **허용 메타**: 사건 유형 코드, 패킷 버전, 근거 포인터(법령 조문·판례 사건번호·공공 문서 ID), 검수자 ID(감사 범위).

패킷은 **“인터넷에서 본 답변 모음”** 이 아니라 **“검증된 법률 지식의 구조화 스키마”** 이다.

---

## 7. 감사 로그 기준

지식 구축 헌법 위반·우회 시도는 **추적 가능**해야 한다.

| 구분 | 기록 대상 | 참조 |
| --- | --- | --- |
| **AuditLog** | 패킷 생성·승인·보관·QuestionSet project | [GONGBUHO_AUDIT_POLICY.md](./GONGBUHO_AUDIT_POLICY.md) |
| **GongbuhoTrace** | 사건 적용·인터뷰 바인딩·문서 규칙 적용 | 동일 |
| **금지 행위** | UGC 원문을 패킷에 넣으려 한 시도, 출처 없는 APPROVED, 검수 생략 | 운영 조사·재발 방지(코드·프로세스 백로그) |

감사 payload에는 **민감 본문·UGC 전문**을 넣지 않고, **행위·패킷 ID·버전·결과 코드** 위주로 남긴다.

---

## 8. 업데이트·폐기 기준

| 상황 | 조치 |
| --- | --- |
| **법령·판례 개정** | 영향 패킷 **버전 업** 또는 신규 패킷; 구버전 `ARCHIVED` 후 Trace로 구버전 적용 이력 유지 |
| **검수 오류·근거 무효** | 즉시 `ARCHIVED` 또는 DRAFT 강등; 이미 적용된 사건은 Trace·운영 런북에 따라 **재검토 안내** |
| **수요 맵만 변경** | 패킷 본문 변경 없이 **백로그 우선순위**만 갱신 가능(§3 허용 범위) |
| **UGC 유입 발견** | 해당 필드 **삭제·재검수**; 원인(프로세스·도구) RCA 후 본 정책 §2 위반 여부 기록 |

폐기·개정 시에도 **네이버·UGC 원문을 대체 근거로 남기지 않는다.**

---

## 9. 변경 이력

| 날짜 | 내용 |
| --- | --- |
| 2026-05-23 | AI법친 공부호 **Legal Knowledge Compiler** 지식 구축 헌법 초안 |

**후속 설계**: [GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_INTAKE_SPEC.md) — Legal Knowledge Intake(수요 신호·매핑·원문 금지 메타). [GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md](./GONGBUHO_LEGAL_KNOWLEDGE_PACKET_PIPELINE_SPEC.md) — Intake → Research Brief → Lawyer Review → GongbuhoPacket APPROVED 파이프라인.
