# AI법친 7.1-B — 보완 요청 데이터 구조 정의서

## 1. 문서 목적

AI법친 7.1-B 보완 요청 데이터 구조 정의서는 보완 요청 기능에서 사용할 데이터 모델 후보, 필드 후보, relation 기준, 마스킹 기준, migration 보류 원칙, API 참조 필드명을 고정하기 위한 기준문서다.

이 문서는 코드 구현 문서가 아니다.  
이 문서는 Prisma schema 변경 전의 구조 정의 단계 문서다.

## 2. 현재 전제

- AI법친 6.x 사건 패키지 기능군은 운영 배포 및 Smoke Test 14/14 PASS 이후 최종 잠금 완료 상태다.
- 6.x 기능 로직, API, DB, 권한 정책은 변경하지 않는다.
- 이번 단계는 7.1-B 데이터 구조 정의 단계이며 DB migration, API 구현, 화면 구현은 하지 않는다.
- 기존 CaseStatus 변경 없음.
- 기존 CasePackageShareStatus 변경 없음.
- 기존 CasePackageAccessAction 변경 없음.

## 3. 데이터 구조 범위

이번 문서에서 고정하는 범위는 다음과 같다.

1. SupplementRequest 후보 모델
2. SupplementRequestItem 후보 모델
3. SupplementResponse 후보 모델
4. SupplementResponseAttachment 후보 모델
5. SupplementRequestStatusLog 후보 모델
6. SupplementRequestAuditLog 후보 모델
7. 기존 Case / User / CaseAttachment / CasePackageShare relation 기준
8. 민감정보 마스킹 기준
9. Prisma schema 변경 전제와 migration 보류 원칙
10. 이후 API 명세서에서 참조할 필드명 고정

## 4. SupplementRequest 후보 모델

보완 요청의 마스터 엔터티다.

| 필드명 | 타입 후보 | 필수 | 설명 |
|---|---|---:|---|
| id | string(cuid) | 예 | 보완 요청 ID |
| caseId | string | 예 | 기준 사건 ID |
| requesterUserId | string | 예 | 요청 생성자 사용자 ID |
| requesterRole | enum | 예 | 요청 생성 시 역할 |
| targetUserId | string | 예 | 응답 대상 사용자 ID(의뢰인) |
| status | enum | 예 | 보완 요청 상태값 |
| requestType | enum | 예 | 요청 유형 코드 |
| title | string(200) | 예 | 요청 제목 |
| description | text | 예 | 요청 상세 설명 |
| dueAt | datetime | 아니오 | 응답 기한 |
| sentAt | datetime | 아니오 | 발송 시각 |
| clientViewedAt | datetime | 아니오 | 의뢰인 열람 시각 |
| lastRespondedAt | datetime | 아니오 | 마지막 응답 제출 시각 |
| acceptedAt | datetime | 아니오 | 수용 시각 |
| closedAt | datetime | 아니오 | 종료 시각 |
| cancelledAt | datetime | 아니오 | 취소 시각 |
| expiredAt | datetime | 아니오 | 만료 시각 |
| revisionRound | int | 예 | 재요청 회차(기본 0) |
| isDeleted | boolean | 예 | 소프트 삭제 여부 |
| createdAt | datetime | 예 | 생성 시각 |
| updatedAt | datetime | 예 | 수정 시각 |

추가 원칙:

- status는 7.1-B 상태값 정의서의 canonical 목록만 사용한다.
- requesterRole은 감사 추적을 위해 별도 보존한다.
- title, description은 법률 판단 확정 문구가 아니라 보완 요청 문구여야 한다.

## 5. SupplementRequestItem 후보 모델

보완 요청 내 세부 요청 항목을 저장한다.

| 필드명 | 타입 후보 | 필수 | 설명 |
|---|---|---:|---|
| id | string(cuid) | 예 | 요청 항목 ID |
| requestId | string | 예 | SupplementRequest FK |
| itemType | enum | 예 | 항목 유형(MISSING_FACT 등) |
| itemLabel | string(200) | 예 | 항목 라벨 |
| itemPrompt | text | 예 | 의뢰인에게 보여줄 보완 문구 |
| isRequired | boolean | 예 | 필수 응답 여부 |
| sortOrder | int | 예 | 표시 순서 |
| expectedFormat | enum | 아니오 | 답변 기대 형식(TEXT, DATE, MONEY 등) |
| maxLength | int | 아니오 | 최대 입력 길이 |
| createdAt | datetime | 예 | 생성 시각 |
| updatedAt | datetime | 예 | 수정 시각 |

## 6. SupplementResponse 후보 모델

의뢰인의 보완 응답 본문을 저장한다.

| 필드명 | 타입 후보 | 필수 | 설명 |
|---|---|---:|---|
| id | string(cuid) | 예 | 응답 ID |
| requestId | string | 예 | SupplementRequest FK |
| requestItemId | string | 아니오 | SupplementRequestItem FK |
| responderUserId | string | 예 | 응답 제출자 ID |
| responderRole | enum | 예 | 응답 제출 시 역할 |
| responseText | text | 아니오 | 텍스트 응답 |
| responseJson | json | 아니오 | 구조화 응답 |
| submittedAt | datetime | 예 | 제출 시각 |
| revisionRound | int | 예 | 응답 회차 |
| isAcceptedSnapshot | boolean | 예 | 수용 당시 스냅샷 여부 |
| createdAt | datetime | 예 | 생성 시각 |
| updatedAt | datetime | 예 | 수정 시각 |

원칙:

- 응답은 append 중심으로 관리한다.
- 기존 응답 원문 overwrite는 기본 금지한다.
- revisionRound로 재요청 회차를 구분한다.

## 7. SupplementResponseAttachment 후보 모델

보완 응답에 포함된 첨부 자료 연결 모델이다.

| 필드명 | 타입 후보 | 필수 | 설명 |
|---|---|---:|---|
| id | string(cuid) | 예 | 첨부 연결 ID |
| responseId | string | 예 | SupplementResponse FK |
| caseAttachmentId | string | 예 | 기존 CaseAttachment FK |
| attachmentRole | enum | 예 | 첨부 성격(EVIDENCE, REFERENCE 등) |
| note | string(500) | 아니오 | 첨부 메모 |
| uploadedAt | datetime | 예 | 연결 시각 |
| createdAt | datetime | 예 | 생성 시각 |
| updatedAt | datetime | 예 | 수정 시각 |

원칙:

- 파일 원본은 기존 CaseAttachment 정책을 그대로 따른다.
- 보완 요청 도메인에서 파일 원본 URL을 직접 보관하지 않는다.

## 8. SupplementRequestStatusLog 후보 모델

상태 전이 추적용 모델이다.

| 필드명 | 타입 후보 | 필수 | 설명 |
|---|---|---:|---|
| id | string(cuid) | 예 | 상태 로그 ID |
| requestId | string | 예 | SupplementRequest FK |
| fromStatus | enum | 예 | 이전 상태 |
| toStatus | enum | 예 | 변경 상태 |
| actorUserId | string | 아니오 | 전이 수행자 ID |
| actorRole | enum | 예 | 수행자 역할 |
| reasonCode | enum | 아니오 | 전이 사유 코드 |
| reasonMemo | string(1000) | 아니오 | 전이 보충 메모 |
| ipMasked | string | 아니오 | 마스킹된 IP |
| userAgentMasked | string | 아니오 | 마스킹된 UA |
| createdAt | datetime | 예 | 전이 기록 시각 |

원칙:

- 상태 전이는 로그 누락 없이 기록한다.
- fromStatus, toStatus는 상태 정의서와 1:1 매핑해야 한다.

## 9. SupplementRequestAuditLog 후보 모델

상태 전이 외의 중요 행위를 감사 로그로 기록한다.

| 필드명 | 타입 후보 | 필수 | 설명 |
|---|---|---:|---|
| id | string(cuid) | 예 | 감사 로그 ID |
| requestId | string | 예 | SupplementRequest FK |
| actionType | enum | 예 | 행위 코드(CREATE, SEND, COMMENT 등) |
| actorUserId | string | 아니오 | 수행자 ID |
| actorRole | enum | 예 | 수행자 역할 |
| actionSummary | string(300) | 예 | 요약 |
| actionPayloadMasked | json | 아니오 | 마스킹된 payload |
| createdAt | datetime | 예 | 기록 시각 |

원칙:

- 감사 로그는 법적 분쟁 대응 가능성을 고려해 append-only로 설계한다.
- 민감 원문은 저장하지 않고 masking payload만 저장한다.

## 10. 기존 도메인 relation 기준

### 10.1 Case relation

- SupplementRequest.caseId -> Case.id (N:1)
- 사건 삭제 정책과 충돌하지 않도록 soft-delete 정합성을 유지한다.

### 10.2 User relation

- requesterUserId -> User.id
- targetUserId -> User.id
- responderUserId -> User.id
- actorUserId -> User.id

### 10.3 CaseAttachment relation

- SupplementResponseAttachment.caseAttachmentId -> CaseAttachment.id
- 파일 권한 검증은 기존 CaseAttachment 다운로드 정책을 따른다.

### 10.4 CasePackageShare relation

- 직접 FK를 강제하지 않는다.
- 요청 생성/조회 시점에 CasePackageShare 기반 권한 검증을 수행한다.
- 공유 상태 이력은 기존 CasePackageShare / AccessLog를 참조한다.

## 11. 민감정보 마스킹 기준

다음 항목은 원문 저장 금지 또는 강제 마스킹한다.

- 전화번호 전체: 가운데 4자리 마스킹
- 주민등록/외국인등록 번호: 전체 저장 금지
- 계좌번호: 일부만 노출
- 이메일: 로컬파트 일부 마스킹
- IP: 마지막 옥텟 마스킹
- accessToken, refreshToken, optionalPin, hash: 원문 저장 금지
- 첨부파일 직접 URL: 원문 저장 금지
- AI raw response 전문: 원문 저장 금지

로그/감사 모델에는 mask 처리된 값만 저장한다.

## 12. Prisma schema 변경 전제와 migration 보류 원칙

이번 단계에서는 Prisma schema 변경과 migration 생성을 수행하지 않는다.

원칙:

- Prisma schema 변경은 다음 구현 단계에서 수행한다.
- migration 생성은 데이터 정의서 잠금 이후 별도 단계에서 수행한다.
- 현재 문서의 모델/필드는 후보안으로 고정하며, 구현 전 검증 회의를 거친다.
- 구현 착수 전 `npm run verify:canonical-sources`를 포함한 사전 검증 체인을 통과해야 한다.

## 13. API 명세 참조용 필드명 고정

다음 필드명은 이후 API 명세서에서 고정 키로 참조한다.

### 13.1 SupplementRequest

- id
- caseId
- requesterUserId
- targetUserId
- status
- requestType
- title
- description
- dueAt
- sentAt
- revisionRound
- lastRespondedAt
- acceptedAt
- closedAt
- cancelledAt
- expiredAt
- createdAt
- updatedAt

### 13.2 SupplementRequestItem

- id
- requestId
- itemType
- itemLabel
- itemPrompt
- isRequired
- sortOrder
- expectedFormat

### 13.3 SupplementResponse

- id
- requestId
- requestItemId
- responderUserId
- responseText
- responseJson
- submittedAt
- revisionRound

### 13.4 SupplementResponseAttachment

- id
- responseId
- caseAttachmentId
- attachmentRole
- note

### 13.5 SupplementRequestStatusLog

- id
- requestId
- fromStatus
- toStatus
- actorUserId
- actorRole
- reasonCode
- reasonMemo
- createdAt

### 13.6 SupplementRequestAuditLog

- id
- requestId
- actionType
- actorUserId
- actorRole
- actionSummary
- actionPayloadMasked
- createdAt

## 14. 비변경 원칙 재확인

- 6.x 기능 로직 변경 없음
- 기존 CaseStatus 변경 없음
- 기존 CasePackageShareStatus 변경 없음
- 기존 CasePackageAccessAction 변경 없음
- Prisma schema 변경 없음
- DB migration 없음
- API 구현 없음
- 화면 구현 없음
- 권한 정책 변경 없음

## 15. 최종 판정

AI법친 7.1-B 보완 요청 데이터 구조 정의서 작성 완료.
이번 단계는 코드 구현이 아니라 데이터 구조 정의 단계다.
다음 작업은 “AI법친 7.1-B — 보완 요청 API 명세 정의서” 작성이다.
