# AI법친 6.2 — 고유번호 발급 정책 / 공유 동의 구조 설계

## 0. 신규 문서명

`docs/project-governance/AIBEOPCHIN_6_2_PUBLIC_CODE_AND_SHARE_CONSENT_RULES.md`

## 1. 문서 목적

AI법친 6.2는 6.1에서 정의한 사건 패키지 데이터 구조를 기준으로,
의뢰인이 사건 패키지를 변호사에게 공유할 때 필요한 고유번호 발급 정책,
접근 검증 구조, 공유 동의 절차, 공유 범위, 만료일, 취소 기준을 설계하는 문서다.

이번 단계의 목적은 다음과 같다.

1. 사건 패키지 공유용 고유번호(`publicCode`) 발급 규칙을 정의한다.
2. `publicCode`만으로 열람되지 않도록 `accessToken` / `PIN` / 로그인 검증 구조를 정의한다.
3. 의뢰인의 명시적 공유 동의 절차를 정의한다.
4. 공유 범위와 다운로드 허용 여부를 분리한다.
5. 공유 만료일과 공유 취소 정책을 정의한다.
6. 변호사 조회 전 검증 조건을 정의한다.
7. 공유 실패 / 만료 / 취소 / 권한 없음 처리 기준을 정리한다.
8. 후속 6.3 CasePackageShare Prisma 모델 / API 구현의 기준을 확정한다.

이번 6.2는 실제 DB 변경이나 API 구현이 아니라 고유번호·공유 동의 정책 설계 단계다.

## 2. 6.2의 위치

- 6.0 — 사건 패키지 / 고유번호 공유 / 변호사 열람 연계 기획서
- 6.1 — 사건 패키지 데이터 구조 / 생성 기준 설계
- 6.2 — 고유번호 발급 정책 / 공유 동의 구조 설계
- 6.3 — CasePackageShare Prisma 모델 / API 구현
- 6.4 — 의뢰인 공유 설정 화면 구현
- 6.5 — 변호사 고유번호 조회 / 열람 화면 구현
- 6.6 — 첨부파일 열람 / 다운로드 권한 분리
- 6.7 — 열람 로그 / 다운로드 로그 / 공유 취소
- 6.8 — 사건 패키지 PDF / 요약본 출력
- 6.9 — 개인정보 / 보안 / 동의문구 최종 정리

## 3. 기본 원칙

고유번호는 사건 패키지를 찾기 위한 식별자일 뿐,
그 자체로 열람 권한을 부여하는 비밀번호가 아니다.

### 핵심 원칙

1. 고유번호만으로 사건 패키지를 열람할 수 없다.
2. 변호사 로그인은 필수다.
3. 의뢰인의 공유 동의가 있어야 한다.
4. 공유 상태가 `ACTIVE`여야 한다.
5. 공유 만료일이 지나지 않아야 한다.
6. 공유가 취소된 경우 즉시 접근을 차단한다.
7. 다운로드 권한은 열람 권한과 별도로 관리한다.
8. 민감정보는 기본 비공유 또는 마스킹한다.
9. 열람 / 다운로드 / 접근 실패는 로그를 남길 수 있도록 설계한다.
10. 대시보드 3.x 봉인은 재오픈하지 않는다.
11. 기존 CaseStatus canonical source는 변경하지 않는다.

## 4. 고유번호 개념 정의

고유번호(`publicCode`)는 의뢰인이 변호사에게 사건 패키지를 전달할 때 사용하는 사람이 읽을 수 있는 사건 공유 식별자다.

### 권장 표시명

의뢰인 화면:
사건 고유번호

변호사 화면:
사건 패키지 고유번호 입력

관리자 화면:
공유 고유번호

### 권장 형식

`AIF-2026-000184`

### 구성 요소

`AIF`:
AI법친 공유 코드 접두어

`2026`:
발급 연도

`000184`:
연도별 순번 또는 난수 기반 표시 번호

## 5. publicCode 발급 규칙

### 기본 규칙

1. `publicCode`는 사건 패키지 공유 시점에 발급한다.
2. `publicCode`는 중복될 수 없다.
3. `publicCode`는 사람이 전달하기 쉬운 형식이어야 한다.
4. `publicCode`는 내부 DB ID를 직접 노출하지 않는다.
5. `publicCode`는 추측하기 어렵도록 순번만 단독 사용하지 않는다.
6. `publicCode`는 공유 취소 후 재사용하지 않는다.
7. 만료된 `publicCode`도 재사용하지 않는다.

### 추천 형식 1 — 순번형 + 난수 보강

`AIF-2026-0184-K7Q`

구성:

`AIF`:
서비스 접두어

`2026`:
발급 연도

`0184`:
연도별 표시 순번

`K7Q`:
짧은 난수 suffix

### 추천 형식 2 — 완전 난수형

`AIF-2026-X9K2-M7QA`

장점:

- 추측 가능성이 낮다.
- 순번 노출 위험이 줄어든다.
- 외부 공유에 더 안전하다.

### 최종 추천

`AIF-YYYY-XXXX-XXXX`

예시:

`AIF-2026-K7Q2-M9RA`

이 형식을 추천한다.

이유:

- 사건 수량이 외부에 노출되지 않는다.
- 사람이 읽고 전달하기 쉽다.
- 내부 `caseId`나 `packageId`가 노출되지 않는다.
- 변호사 입력 화면에서 검증하기 쉽다.

## 6. accessToken / PIN 정책

### accessToken

`accessToken`은 서버 내부에서 공유 접근 검증에 사용할 랜덤 토큰이다.

기준:

1. `accessToken` 원문은 저장하지 않는다.
2. `accessTokenHash`만 저장한다.
3. `publicCode`와 `accessToken`을 분리한다.
4. 링크 기반 공유를 도입할 경우 `accessToken`을 URL token으로 사용할 수 있다.
5. 6.2에서는 링크 공유를 구현하지 않고 후보로만 둔다.

### optionalPin

`optionalPin`은 의뢰인이 선택적으로 설정할 수 있는 추가 접근 PIN이다.

기준:

1. PIN은 선택 기능으로 둔다.
2. PIN 원문은 저장하지 않는다.
3. `optionalPinHash`만 저장한다.
4. PIN은 변호사 로그인 이후 추가 확인용으로만 사용한다.
5. PIN 오류 횟수 제한은 6.7 접근 로그 / 보안 정책에서 확장한다.

### 6.2 최종 추천

1차 구현 기준:

- `publicCode` 필수
- 변호사 로그인 필수
- 의뢰인 공유 동의 필수
- 공유 상태 `ACTIVE` 필수
- 만료일 검증 필수
- PIN은 선택 기능으로 설계만 반영

후속 보안 강화:

- `accessToken` 기반 링크 공유
- PIN 필수화 옵션
- 접근 실패 횟수 제한
- 공유 링크 만료 토큰

## 7. 공유 상태값

공유 상태값 후보는 아래로 고정한다.

`ACTIVE`:
공유 중

`EXPIRED`:
공유 기간 만료

`REVOKED`:
의뢰인이 공유 취소

`PENDING`:
공유 생성 전 또는 동의 전

`LOCKED`:
접근 실패 또는 보안 사유로 임시 잠금

`ARCHIVED`:
보관 처리

### 공유 상태 전이

`PENDING`
→ `ACTIVE`
→ `EXPIRED`

`ACTIVE`
→ `REVOKED`

`ACTIVE`
→ `LOCKED`

`EXPIRED / REVOKED / LOCKED`
→ `ARCHIVED`

## 8. 공유 범위 구조

공유 범위는 열람 권한과 다운로드 권한을 분리한다.

### 열람 범위

`allowSummary`:
사건 요약 열람

`allowInterview`:
AI 인터뷰 요약 / 답변 열람

`allowAttachmentList`:
첨부자료 목록 열람

`allowDocumentDraft`:
문서 초안의 기초 열람

`allowClientContact`:
의뢰인 연락처 열람

`allowOpponentInfo`:
상대방 상세 정보 열람

### 다운로드 범위

`allowAttachmentDownload`:
첨부파일 원본 다운로드

`allowDocumentPdf`:
문서 초안 또는 승인 문서 PDF 다운로드

`allowPackagePdf`:
사건 패키지 요약본 PDF 다운로드

### 기본값

기본 허용:

- 사건 요약 열람
- 첨부자료 목록 열람
- AI 인터뷰 요약 열람
- 추가 확인 필요 항목 열람

기본 비허용:

- 첨부파일 원본 다운로드
- 문서 PDF 다운로드
- 전체 패키지 PDF 다운로드
- 의뢰인 상세 연락처
- 상세 주소
- 민감식별정보

## 9. 공유 기간 / 만료일 정책

### 기본 공유 기간

기본 공유 기간:
`7일`

### 선택 가능한 공유 기간 후보

- 3일
- 7일
- 14일
- 30일
- 직접 지정

### 만료 기준

1. `expiresAt`이 현재 시각보다 이전이면 접근 차단
2. 만료된 공유는 `EXPIRED`로 표시
3. 만료 후 변호사는 사건 패키지를 열람할 수 없음
4. 의뢰인은 만료된 공유를 재발급할 수 있음
5. 만료된 `publicCode`는 재사용하지 않음

### 만료 안내 문구

이 사건 패키지 공유는 만료되었습니다.
의뢰인에게 공유 재발급을 요청해 주세요.

## 10. 공유 취소 정책

의뢰인은 언제든 공유를 취소할 수 있어야 한다.

### 취소 기준

1. `ACTIVE` 상태에서만 취소 가능
2. 취소 시 `status`는 `REVOKED`
3. `revokedAt` 기록
4. `revokeReason` 선택 기록
5. 취소 즉시 변호사 접근 차단
6. 취소 후 동일 `publicCode` 재사용 금지

### 취소 사유 후보

- 잘못 공유함
- 공유 기간을 변경하고 싶음
- 공유 범위를 변경하고 싶음
- 다른 변호사에게 공유 예정
- 사건 정보 수정 필요
- 기타

### 취소 안내 문구

공유가 취소되었습니다.
해당 고유번호로는 더 이상 사건 패키지를 열람할 수 없습니다.

## 11. 의뢰인 공유 동의 구조

공유 동의는 체크박스 하나로 끝내면 안 된다.
공유 범위, 다운로드 허용, 만료일, 열람 로그 안내를 포함해야 한다.

### 동의 화면 구성

1. 공유 대상 사건 표시
2. 공유 대상 변호사 지정 여부
3. 공유 범위 선택
4. 다운로드 허용 여부 선택
5. 공유 기간 선택
6. 민감정보 포함 가능성 안내
7. 열람 / 다운로드 기록 저장 안내
8. 공유 취소 가능 안내
9. 최종 동의 체크
10. 사건 고유번호 발급 버튼

### 필수 동의 항목

- 선택한 사건 정보가 변호사에게 제공될 수 있음
- 선택한 범위의 자료만 공유됨
- 첨부파일 다운로드 허용 여부를 직접 선택함
- 공유 기간이 지나면 접근이 차단됨
- 공유 취소 시 접근이 차단됨
- 변호사의 열람 / 다운로드 기록이 남을 수 있음
- AI 정리 내용은 법률 판단이 아니라 검토용 자료임

## 12. 동의 문구 최종안

본인은 선택한 사건 정보, 사건 요약, AI 인터뷰 내용, 첨부자료 목록,
문서 초안의 기초가 지정한 변호사 또는 전문가에게 제공될 수 있음을 확인합니다.

본인은 공유 범위, 첨부파일 다운로드 허용 여부, 공유 기간을 확인했습니다.

본인은 공유된 사건 패키지가 변호사의 사전 검토를 위한 자료이며,
AI가 정리한 내용이 법률 자문, 소송 대리, 사건 수임 또는 최종 법률 판단이 아님을 이해합니다.

본인은 필요 시 공유를 취소할 수 있으며,
변호사의 열람 및 다운로드 기록이 시스템에 남을 수 있음을 확인합니다.

### 짧은 체크박스 문구

위 내용을 확인했으며, 선택한 사건 패키지를 변호사 검토용으로 공유하는 데 동의합니다.

## 13. 변호사 조회 전 검증 조건

변호사가 고유번호를 입력하면 아래 순서로 검증한다.

1. 변호사 로그인 여부 확인
2. 변호사 권한 또는 승인 상태 확인
3. `publicCode` 존재 여부 확인
4. 공유 상태 `ACTIVE` 여부 확인
5. `expiresAt` 만료 여부 확인
6. `revokedAt` 존재 여부 확인
7. `lawyerUserId` 지정 여부 확인
8. 지정 변호사가 있는 경우 현재 변호사와 일치 여부 확인
9. `optionalPin`이 있는 경우 PIN 검증
10. 공유 범위에 따라 열람 가능 데이터 필터링
11. 접근 로그 기록

### 실패 시 처리

| 실패 사유 | 응답 |
| --- | --- |
| 로그인 없음 | 로그인 필요 |
| 변호사 권한 없음 | 접근 권한 없음 |
| `publicCode` 없음 | 고유번호를 확인할 수 없음 |
| `EXPIRED` | 공유 기간 만료 |
| `REVOKED` | 공유 취소됨 |
| `lawyerUserId` 불일치 | 지정된 변호사만 열람 가능 |
| PIN 불일치 | PIN 확인 필요 |
| 공유 범위 제한 | 해당 자료 열람 불가 |

## 14. 변호사 지정 방식

공유 방식은 두 가지로 나눈다.

### 14.1 지정 변호사 공유

의뢰인이 특정 변호사를 선택해 공유한다.

특징:

- `lawyerUserId` 저장
- 해당 변호사만 열람 가능
- 보안성이 높음
- 실제 운영 추천 방식

### 14.2 고유번호 기반 일반 공유

의뢰인이 변호사에게 고유번호를 전달하고,
해당 변호사가 로그인 후 조회한다.

특징:

- `lawyerUserId`가 initially `null` 가능
- 최초 열람 변호사에게 귀속할지 정책 필요
- 보안상 PIN 또는 승인 절차 필요

### 최종 추천

1차 구현:
지정 변호사 공유 우선

후속 구현:
일반 고유번호 공유 + PIN + 최초 열람 귀속 정책 검토

## 15. 변호사 최초 열람 귀속 정책

일반 고유번호 공유를 허용할 경우 아래 정책 중 하나를 선택해야 한다.

### A안 — 최초 열람 변호사에게 자동 귀속

장점:

- UX가 단순하다.
- 변호사가 바로 열람 가능하다.

단점:

- 잘못 입력한 변호사가 접근할 위험이 있다.

### B안 — 최초 열람 요청 후 의뢰인 승인

장점:

- 보안성이 높다.
- 의뢰인이 최종 승인한다.

단점:

- 절차가 한 단계 늘어난다.

### 최종 추천

`B안 — 최초 열람 요청 후 의뢰인 승인`

이유:

- 민감한 사건자료 보호에 유리하다.
- 의뢰인의 공유 통제권을 유지한다.
- 잘못된 변호사 접근을 방지한다.

## 16. 공유 알림 문구

### 의뢰인에게 표시

사건 패키지가 생성되었습니다.

사건 고유번호:
`AIF-2026-K7Q2-M9RA`

선택한 공유 범위와 기간에 따라 변호사가 사건 요약과 자료를 열람할 수 있습니다.
공유는 언제든 취소할 수 있습니다.

### 변호사에게 전달할 문구

AI법친 사건 패키지가 공유되었습니다.

사건 고유번호:
`AIF-2026-K7Q2-M9RA`

AI법친에 변호사 계정으로 로그인한 뒤,
사건 패키지 조회 화면에서 고유번호를 입력하면
의뢰인이 공유한 사건 요약과 자료를 확인할 수 있습니다.

조회 주소:
`https://ai-lawfriend.netlify.app/lawyer/case-packages/lookup`

## 17. 공유 범위 요약 표시

고유번호 발급 후 의뢰인에게 공유 범위를 명확히 보여줘야 한다.

공유 범위:

- 사건 요약: 허용
- AI 인터뷰 요약: 허용
- AI 인터뷰 전체 답변: 비허용
- 첨부자료 목록: 허용
- 첨부파일 다운로드: 비허용
- 문서 초안의 기초: 허용
- 의뢰인 연락처: 비허용
- 공유 만료일: 2026-05-05

## 18. 접근 로그 설계 기준

6.2에서는 실제 로그 구현은 하지 않지만, 기록 기준을 정한다.

### 로그 대상 이벤트

- 고유번호 조회 시도
- 조회 성공
- 조회 실패
- 만료로 인한 차단
- 취소로 인한 차단
- PIN 실패
- 첨부파일 다운로드
- 문서 PDF 다운로드
- 패키지 PDF 다운로드

### 로그 필드 후보

- `shareId`
- `publicCode`
- `caseId`
- `actorUserId`
- `actorRole`
- `action`
- `targetType`
- `targetId`
- `result`
- `resultMessage`
- `ip`
- `userAgent`
- `createdAt`

## 19. 신규 데이터 구조 후보

6.2에서는 실제 Prisma 변경은 하지 않고 후보만 정리한다.

```prisma
enum CasePackageShareStatus {
  PENDING
  ACTIVE
  EXPIRED
  REVOKED
  LOCKED
  ARCHIVED
}

enum CasePackageShareMode {
  DESIGNATED_LAWYER
  PUBLIC_CODE_REQUEST
}

model CasePackageShare {
  id                         String   @id @default(cuid())
  packageId                  String
  caseId                     String
  ownerUserId                String
  lawyerUserId               String?

  publicCode                 String   @unique
  accessTokenHash            String?
  optionalPinHash            String?

  shareMode                  String
  status                     String

  allowSummary               Boolean  @default(true)
  allowInterviewSummary      Boolean  @default(true)
  allowInterviewFullAnswers  Boolean  @default(false)
  allowAttachmentList        Boolean  @default(true)
  allowAttachmentDownload    Boolean  @default(false)
  allowDocumentDraft         Boolean  @default(true)
  allowDocumentPdf           Boolean  @default(false)
  allowPackagePdf            Boolean  @default(false)
  allowClientContact         Boolean  @default(false)
  allowOpponentDetail        Boolean  @default(false)

  consentText                String
  consentedAt                DateTime
  expiresAt                  DateTime?
  revokedAt                  DateTime?
  revokeReason               String?

  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
}
```

## 20. 신규 API 후보

6.2는 설계 단계이므로 실제 구현하지 않는다.

- `POST   /api/cases/[caseId]/package-shares/preview`
- `POST   /api/cases/[caseId]/package-shares`
- `GET    /api/cases/[caseId]/package-shares`
- `GET    /api/cases/[caseId]/package-shares/[shareId]`
- `PATCH  /api/cases/[caseId]/package-shares/[shareId]`
- `POST   /api/cases/[caseId]/package-shares/[shareId]/revoke`
- `POST   /api/lawyer/case-packages/lookup`
- `POST   /api/lawyer/case-packages/request-access`

### API 역할

`POST preview`:
공유 범위 선택에 따른 미리보기 생성

`POST package-shares`:
의뢰인 동의 후 고유번호 발급

`GET package-shares`:
의뢰인 사건의 공유 목록 조회

`GET shareId`:
공유 상세 조회

`PATCH shareId`:
공유 범위 / 만료일 수정 후보

`POST revoke`:
공유 취소

`POST lawyer lookup`:
변호사가 고유번호로 조회

`POST request-access`:
일반 고유번호 공유에서 변호사가 열람 요청

## 21. 신규 화면 후보

### 의뢰인 공유 설정 화면

`/cases/[caseId]/share`

구성:

- 사건 패키지 미리보기
- 공유 대상 변호사 선택
- 공유 방식 선택
- 공유 범위 선택
- 다운로드 허용 여부 선택
- 공유 기간 선택
- 동의문구 확인
- 고유번호 발급

### 의뢰인 공유 상세 화면

`/cases/[caseId]/share/[shareId]`

구성:

- 사건 고유번호
- 공유 상태
- 공유 범위
- 만료일
- 변호사 전달 문구
- 공유 취소
- 열람 로그

### 변호사 조회 화면

`/lawyer/case-packages/lookup`

구성:

- 고유번호 입력
- PIN 입력 후보
- 조회 버튼
- 접근 실패 안내
- 의뢰인 승인 요청 후보

## 22. 개인정보 / 보안 기준

1. `publicCode`는 내부 `caseId`를 노출하지 않는다.
2. 고유번호만으로 열람되지 않는다.
3. 변호사 로그인은 필수다.
4. 의뢰인 동의는 필수다.
5. 공유 범위는 명시적으로 선택한다.
6. 다운로드 권한은 별도 체크한다.
7. 공유 만료일은 필수 또는 기본값 7일로 둔다.
8. 공유 취소 시 즉시 접근 차단한다.
9. 민감정보는 기본 비공유 또는 마스킹한다.
10. 열람 / 다운로드 / 접근 실패 로그를 남길 수 있도록 설계한다.

## 23. 6.2에서 하지 않는 것

- 실제 Prisma schema 변경 없음
- 신규 API 구현 없음
- 신규 화면 구현 없음
- `accessToken` 실제 발급 없음
- PIN 실제 검증 없음
- 변호사 조회 실제 구현 없음
- 공유 동의 실제 저장 없음
- 열람 로그 실제 구현 없음
- 첨부파일 다운로드 정책 실제 변경 없음
- CaseStatus 변경 없음
- UserRole 변경 없음
- 대시보드 3.x 재오픈 없음
- QA closure 작성 없음

## 24. 완료 판정

AI법친 6.2 완료 기준:

- 고유번호 개념 정의 완료
- `publicCode` 발급 규칙 정의 완료
- `accessToken` / PIN 정책 정의 완료
- 공유 상태값 정의 완료
- 공유 범위 구조 정의 완료
- 다운로드 권한 분리 기준 정의 완료
- 공유 기간 / 만료일 정책 정의 완료
- 공유 취소 정책 정의 완료
- 의뢰인 공유 동의 구조 정의 완료
- 동의 문구 작성 완료
- 변호사 조회 전 검증 조건 정의 완료
- 변호사 지정 방식 정의 완료
- 최초 열람 귀속 정책 정의 완료
- 공유 알림 문구 작성 완료
- 접근 로그 설계 기준 작성 완료
- 신규 데이터 구조 후보 정리 완료
- 신규 API / 화면 후보 정리 완료
- 개인정보 / 보안 기준 정리 완료
- 실제 코드 변경 없음

## 25. 다음 후보

AI법친 6.3 — CasePackageShare Prisma 모델 / API 구현

6.3에서 다룰 내용:

- `CasePackageShare` 모델 실제 반영 여부
- `CasePackageAccessLog` 모델 실제 반영 여부
- `publicCode` 생성 유틸
- 공유 생성 API
- 공유 목록 API
- 공유 취소 API
- 변호사 고유번호 조회 API
- 접근 검증 유틸
- 접근 로그 기록 유틸

## 결론

6.2의 핵심은 이것이다.

사건 고유번호는 열람 권한이 아니라 공유 식별자다.
열람 권한은 변호사 로그인, 의뢰인 동의, `ACTIVE` 상태, 만료 검증, 공유 범위 검증을 모두 통과해야 발생한다.