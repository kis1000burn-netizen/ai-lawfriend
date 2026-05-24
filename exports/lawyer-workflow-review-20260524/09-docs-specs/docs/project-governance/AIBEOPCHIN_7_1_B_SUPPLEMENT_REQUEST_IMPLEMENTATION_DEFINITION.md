# AI법친 7.1-B — 보완 요청 구현 정의서

## 1. 문서 목적

AI법친 7.1-B 보완 요청 구현 정의서는 상태값/데이터 구조/API 명세를 실제 구현 단계로 전개할 때 필요한 레이어별 구현 범위, 파일 후보, 검증 순서, 비기능 요구사항을 고정하기 위한 기준문서다.

이 문서는 코드 구현 문서가 아니다.  
이 문서는 구현 착수 전 체크리스트와 구현 경계 정의 문서다.

## 2. 현재 전제

- AI법친 6.x 사건 패키지 기능군은 운영 배포 및 Smoke Test 14/14 PASS 이후 최종 잠금 완료 상태다.
- 6.x 기능 로직, API, DB, 권한 정책은 변경하지 않는다.
- 7.1-B는 보완 요청 도메인으로 별도 분리해 구현한다.
- 이번 단계는 구현 정의 단계이며 실제 API/DB/UI 코드는 작성하지 않는다.
- 기존 CaseStatus 변경 없음.
- 기존 CasePackageShareStatus 변경 없음.
- 기존 CasePackageAccessAction 변경 없음.

## 3. 구현 범위 요약

구현 범위는 다음 5개 레이어로 분리한다.

1. route layer
2. service layer
3. repository layer
4. validator layer
5. UI layer

공통 원칙:

- 상태 전이는 상태값 정의서 canonical 규칙을 강제한다.
- 필드명은 데이터 구조 정의서/API 명세 정의서 고정 키를 준수한다.
- 로그 기록은 상태 로그/감사 로그를 분리한다.
- 민감정보는 저장/응답/로그 모두 마스킹 규칙을 적용한다.

## 4. route layer 구현 정의

### 4.1 후보 위치

- src/app/api/cases/{caseId}/supplement-requests/route.ts
- src/app/api/cases/{caseId}/supplement-requests/{requestId}/route.ts
- src/app/api/cases/{caseId}/supplement-requests/{requestId}/send/route.ts
- src/app/api/cases/{caseId}/supplement-requests/{requestId}/cancel/route.ts
- src/app/api/cases/{caseId}/supplement-requests/{requestId}/responses/route.ts
- src/app/api/cases/{caseId}/supplement-requests/{requestId}/review/route.ts
- src/app/api/cases/{caseId}/supplement-requests/{requestId}/accept/route.ts
- src/app/api/cases/{caseId}/supplement-requests/{requestId}/needs-more-info/route.ts
- src/app/api/cases/{caseId}/supplement-requests/{requestId}/close/route.ts
- src/app/api/cases/{caseId}/supplement-requests/{requestId}/status-logs/route.ts
- src/app/api/cases/{caseId}/supplement-requests/{requestId}/audit-logs/route.ts

### 4.2 route 책임

- 인증/세션 확인
- path param parse
- request body parse
- validator 호출
- service 호출
- 표준 응답 래핑
- 에러 코드 표준화

### 4.3 route 금지사항

- 비즈니스 상태 전이 로직 직접 구현 금지
- DB 직접 접근 금지
- 민감정보 원문 반환 금지

## 5. service layer 구현 정의

### 5.1 후보 위치

- src/features/supplement-request/supplement-request.service.ts

### 5.2 service 책임

- 상태 전이 정책 검사
- 역할/권한 정책 검사
- 회차(revisionRound) 정책 검사
- 상태 로그/감사 로그 작성 orchestration
- repository transaction 경계 제어

### 5.3 service 함수 후보

- listSupplementRequestsService
- getSupplementRequestDetailService
- createSupplementRequestService
- updateSupplementRequestService
- sendSupplementRequestService
- cancelSupplementRequestService
- submitSupplementResponseService
- startSupplementReviewService
- acceptSupplementRequestService
- markNeedsMoreInfoService
- closeSupplementRequestService
- expireSupplementRequestService

## 6. repository layer 구현 정의

### 6.1 후보 위치

- src/features/supplement-request/supplement-request.repository.ts

### 6.2 repository 책임

- SupplementRequest CRUD
- SupplementRequestItem CRUD
- SupplementResponse/Attachment 저장
- SupplementRequestStatusLog append
- SupplementRequestAuditLog append
- case/user/attachment relation 조회

### 6.3 repository 원칙

- transaction 단위 함수 제공
- soft-delete 정책 준수
- DB enum 확정 전 string literal guard 유지

## 7. validator layer 구현 정의

### 7.1 후보 위치

- src/features/supplement-request/supplement-request.validator.ts

### 7.2 validator 책임

- request body schema 검증
- 필수 필드 검증
- maxLength/형식 검증
- 상태별 허용 입력 검증
- 오류 코드 매핑(SUPPLEMENT_REQUEST_VALIDATION_FAILED)

### 7.3 validator 스키마 후보

- createSupplementRequestSchema
- updateSupplementRequestSchema
- sendSupplementRequestSchema
- cancelSupplementRequestSchema
- submitSupplementResponseSchema
- markNeedsMoreInfoSchema

## 8. UI layer 구현 정의

### 8.1 후보 위치

- src/components/lawyer/supplement-request/
- src/components/client/supplement-request/
- src/components/admin/supplement-request/

### 8.2 화면 후보

- 보완 요청 목록 화면
- 보완 요청 상세 화면
- 보완 요청 작성/수정 화면
- 의뢰인 응답 제출 화면
- 변호사 재검토 화면
- 상태 이력/감사 이력 패널

### 8.3 UI 원칙

- 상태 배지는 상태값 정의서 기준 고정
- 금지 전이는 버튼 비활성화로 선차단
- 민감정보 마스킹 표시
- AI 제안은 draft 작성 보조만 허용

## 9. 권한/인증 구현 정의

- requireSessionUser() 기반 인증
- Case/CasePackageShare 기반 접근권한 검증
- USER는 본인 대상 요청만 조회/응답
- LAWYER는 담당 사건 요청 생성/전이
- ADMIN/SUPER_ADMIN은 운영상 전이 허용(감사 로그 필수)
- SYSTEM은 만료 배치 전이만 허용

## 10. 상태 전이 구현 가드

구현 시 아래 가드를 반드시 적용한다.

- 허용 전이 외 전이는 SUPPLEMENT_REQUEST_INVALID_STATE 반환
- 최종 상태(CLOSED/CANCELLED/EXPIRED/ACCEPTED 이후 정책 상태) 재전이 금지
- SENT/CLIENT_VIEWED 만료 전이는 배치 또는 권한 사용자만 허용
- CLIENT_RESPONDED 없이 UNDER_REVIEW 진입 금지
- ACCEPTED 이후 NEEDS_MORE_INFO 역전이 금지

## 11. 로그/감사 구현 정의

- 상태 변경 시 SupplementRequestStatusLog 필수 기록
- 중요 행위(create/send/cancel/respond/accept/close)는 SupplementRequestAuditLog 필수 기록
- reasonCode/reasonMemo 표준화
- actorRole, actorUserId, createdAt 누락 금지
- ip/userAgent는 마스킹 후 저장

## 12. 테스트 구현 정의

### 12.1 단위 테스트

- service 상태 전이 테스트
- validator 입력 검증 테스트
- repository mapping 테스트

### 12.2 통합 테스트

- route -> service -> repository 성공 경로
- 권한 오류 경로
- 금지 전이 오류 경로

### 12.3 회귀 검증

- 기존 6.x verifier 체인 유지
- 7.1-B verifier 체인 누적 실행

## 13. 배포/마이그레이션 구현 원칙

- Prisma schema 변경은 구현 시작 시점 별도 commit으로 분리
- migration 생성/적용은 명세 잠금 이후 수행
- API 코드와 migration 동시 대량 반영 금지
- 단계별 PR 분리: schema -> repository -> service -> route -> UI

## 14. 구현 단계 순서

1. schema 초안 + migration 계획
2. repository 골격
3. validator 구현
4. service 구현
5. route 구현
6. UI 구현
7. 테스트/검증 체인
8. 증빙/운영 가이드 업데이트

## 15. 비변경 원칙 재확인

- 6.x 기능 로직 변경 없음
- 기존 CaseStatus 변경 없음
- 기존 CasePackageShareStatus 변경 없음
- 기존 CasePackageAccessAction 변경 없음
- Prisma schema 변경 없음(이번 단계)
- DB migration 없음(이번 단계)
- API 구현 없음(이번 단계)
- 화면 구현 없음(이번 단계)
- 권한 정책 변경 없음(이번 단계)

## 16. 최종 판정

AI법친 7.1-B 보완 요청 구현 정의서 작성 완료.
이번 단계는 코드 구현이 아니라 구현 정의 단계다.
다음 작업은 "AI법친 7.1-B — 보완 요청 구현 착수(스키마/레포지토리 1단계)"다.
