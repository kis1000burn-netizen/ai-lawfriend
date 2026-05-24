# AI법친 6.2 — 고유번호 발급 정책 / 공유 동의 구조 설계

## 1. 목적

본 문서는 AI법친 6.2의 기준문서다.
6.0에서 정의한 사건 패키지 / 고유번호 공유 / 변호사 열람 연계 기획과 6.1에서 정의한 사건 패키지 DTO 구조를 바탕으로,
사건 패키지를 외부 변호사에게 공유하기 위한 고유번호 발급 정책, 접근 토큰/PIN 보안 정책,
의뢰인 공유 동의 snapshot 구조, 공유 상태 전이 기준을 정의한다.

이번 단계는 실제 Prisma schema 변경이나 API 구현이 아니라,
이후 6.3의 CasePackageShare 모델/API 구현 전에 반드시 고정해야 할 정책과 순수 유틸을 확정하는 단계다.

---

## 2. 전제

현재까지의 공식 기준은 다음과 같다.

| 항목 | 상태 |
|---|---|
| AI법친 6.0 사건 패키지 기획서 | 완료 |
| AI법친 6.1 사건 패키지 DTO / 생성 기준 | 완료 |
| Prisma schema 변경 | 아직 없음 |
| CasePackageShare 모델 | 아직 없음 |
| 공유 API 구현 | 아직 없음 |
| 공유 화면 구현 | 아직 없음 |

---

## 3. 고유번호 발급 정책

사건 패키지 공유에는 사람이 전달하기 쉬운 고유번호가 필요하다.

### 3.1 publicCode 형식

기본 형식은 아래로 고정한다.

```text
AIF-YYYY-NNNNNN
```

예시:

AIF-2026-000184

구성:

| 구성 | 설명 |
|---|---|
| AIF | AI법친 공유 식별 prefix |
| YYYY | 발급 연도 |
| NNNNNN | 6자리 순번 또는 난수 기반 숫자 |

### 3.2 publicCode 원칙

- 사람에게 전달 가능한 값이다.
- 고유해야 한다.
- publicCode만으로 사건 패키지를 열람할 수 없어야 한다.
- publicCode는 변호사 로그인, 공유 상태, 만료일, 동의 상태, 권한 범위와 함께 검증되어야 한다.

## 4. accessToken 정책

accessToken은 서버 내부 검증용 랜덤 토큰이다.

원칙:

- 원문 token은 DB에 저장하지 않는다.
- DB에는 hash만 저장한다.
- 토큰 원문은 발급 직후 한 번만 보여준다.
- 검증 시 입력 token을 hash 후 비교한다.
- 토큰은 publicCode와 분리된 보안 요소다.

추천 구조:

```ts
type CasePackageAccessTokenIssue = {
  plainToken: string;
  tokenHash: string;
};
```

## 5. optionalPin 정책

선택형 PIN은 보안 강화를 위한 추가 입력값이다.

원칙:

- PIN 사용 여부는 공유 설정에서 결정한다.
- PIN 원문은 저장하지 않는다.
- DB에는 hash만 저장한다.
- PIN은 최소 4자리 이상을 권장한다.
- PIN은 accessToken을 대체하지 않고 보조 검증 요소다.

기본 정책:

| 항목 | 기준 |
|---|---|
| 사용 여부 | 선택 |
| 최소 길이 | 4 |
| 저장 방식 | hash |
| 노출 방식 | 원문 재노출 금지 |

## 6. 공유 동의 snapshot 구조

의뢰인이 사건 패키지를 공유할 때는 동의 시점의 설정값을 snapshot으로 남겨야 한다.

Consent Snapshot 구조:

```ts
type CasePackageConsentSnapshot = {
  consentText: string;
  consentedAt: string;
  ownerUserId: string;
  caseId: string;
  targetLawyerUserId?: string | null;
  scope: CasePackageShareScope;
  downloadPermissions: CasePackageDownloadPermissions;
  expiresAt?: string | null;
};
```

동의 snapshot에 반드시 포함할 항목:

- 어떤 사건을 공유하는지
- 누가 공유하는지
- 누구에게 공유하는지
- 어떤 범위를 공유하는지
- 첨부파일 다운로드 허용 여부
- 문서 초안 다운로드 허용 여부
- 패키지 PDF 다운로드 허용 여부
- 공유 만료일
- 공유 취소 가능 안내
- 열람 로그 저장 안내

## 7. 공유 범위 구조

```ts
type CasePackageShareScope = {
  allowSummary: boolean;
  allowInterview: boolean;
  allowAttachmentList: boolean;
  allowDocumentDraft: boolean;
};
```

기본값:

```ts
{
  allowSummary: true,
  allowInterview: true,
  allowAttachmentList: true,
  allowDocumentDraft: false,
}
```

## 8. 다운로드 권한 구조

```ts
type CasePackageDownloadPermissions = {
  allowAttachmentDownload: boolean;
  allowPackagePdf: boolean;
  allowDocumentDownload: boolean;
};
```

기본값:

```ts
{
  allowAttachmentDownload: false,
  allowPackagePdf: false,
  allowDocumentDownload: false,
}
```

## 9. 공유 상태 정책

공유 상태는 아래 3개로 시작한다.

```ts
type CasePackageShareStatus = "ACTIVE" | "EXPIRED" | "REVOKED";
```

상태 의미:

| 상태 | 의미 |
|---|---|
| ACTIVE | 열람 가능한 공유 |
| EXPIRED | 만료일이 지나 열람 불가 |
| REVOKED | 의뢰인이 취소하여 열람 불가 |

상태 전이:

| 현재 | 조건 | 다음 |
|---|---|---|
| ACTIVE | expiresAt 지남 | EXPIRED |
| ACTIVE | 의뢰인 취소 | REVOKED |
| EXPIRED | 재활성화 없음 | EXPIRED |
| REVOKED | 재활성화 없음 | REVOKED |

6.2에서는 재활성화 정책을 두지 않는다.
새 공유가 필요하면 새 publicCode를 발급한다.

## 10. 접근 허용 기준

아래 조건을 모두 만족할 때만 사건 패키지 열람을 허용한다.

- 변호사 로그인 상태
- publicCode 일치
- shareStatus = ACTIVE
- expiresAt 미도래
- revokedAt 없음
- 의뢰인 공유 동의 완료
- 변호사 권한 일치
- optionalPin 사용 시 PIN 검증 성공

## 11. 접근 차단 기준

아래 조건 중 하나라도 해당하면 차단한다.

| 조건 | 차단 사유 |
|---|---|
| publicCode 없음 | INVALID_PUBLIC_CODE |
| 공유 없음 | SHARE_NOT_FOUND |
| 상태 EXPIRED | SHARE_EXPIRED |
| 상태 REVOKED | SHARE_REVOKED |
| expiresAt 지남 | SHARE_EXPIRED |
| 변호사 로그인 아님 | LAWYER_AUTH_REQUIRED |
| 변호사 권한 불일치 | LAWYER_ACCESS_DENIED |
| PIN 불일치 | INVALID_PIN |
| 공유 범위 외 자료 요청 | SHARE_SCOPE_DENIED |

## 12. 로그 기준

접근 시도는 성공/실패 모두 로그로 남길 수 있어야 한다.

로그 action 후보:

```ts
type CasePackageAccessAction =
  | "VIEW"
  | "DOWNLOAD"
  | "DENIED"
  | "EXPIRED"
  | "REVOKED";
```

로그 targetType 후보:

```ts
type CasePackageAccessTargetType =
  | "SUMMARY"
  | "INTERVIEW"
  | "ATTACHMENT_LIST"
  | "ATTACHMENT"
  | "DOCUMENT"
  | "PACKAGE";
```

로그에 남길 항목:

- shareId
- caseId
- actorUserId
- action
- targetType
- targetId
- ip
- userAgent
- resultMessage
- createdAt

## 13. 이번 단계 산출물

6.2 산출물은 다음이다.

- 고유번호 발급 정책 문서
- publicCode 생성 유틸
- accessToken 발급/hash 유틸
- optionalPin hash/검증 유틸
- consent snapshot 타입/생성 유틸
- shareStatus 판정 유틸
- access decision 판정 유틸
- 단위 테스트
- 증빙
- navigator 등록

## 14. 6.2에서 하지 않을 것

- Prisma schema 변경 없음
- migration 생성 없음
- CasePackageShare 모델 생성 없음
- CasePackageAccessLog 모델 생성 없음
- 신규 API 구현 없음
- 신규 화면 구현 없음
- 실제 첨부파일 다운로드 정책 변경 없음

## 15. 완료 기준

| 항목 | 결과 |
|---|---|
| publicCode 정책 정의 | 완료 |
| accessToken 정책 정의 | 완료 |
| optionalPin 정책 정의 | 완료 |
| consent snapshot 구조 정의 | 완료 |
| shareStatus 전이 기준 정의 | 완료 |
| access decision 기준 정의 | 완료 |
| 순수 유틸 추가 | 완료 |
| 단위 테스트 추가 | 완료 |
| Prisma schema 변경 없음 | 유지 |
| 신규 API 구현 없음 | 유지 |
| 신규 화면 구현 없음 | 유지 |
