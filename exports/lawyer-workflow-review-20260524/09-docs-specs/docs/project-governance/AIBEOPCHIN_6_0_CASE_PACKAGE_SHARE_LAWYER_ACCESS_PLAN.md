# AI법친 6.0 — 사건 패키지 / 고유번호 공유 / 변호사 열람 연계 기획서

## 0. 문서 목적

본 문서는 AI법친 6.0의 핵심 사업가치 기능인 **사건 패키지 / 고유번호 공유 / 변호사 열람 연계 구조**를 정의한다.

이번 단계는 실제 코드 구현이 아니라, 기존 AI법친 시스템의 Case, Attachment, LegalDocument, UserRole, AuditLog 구조를 기반으로 일반 사용자와 변호사를 연결하는 사건 패키지 기능의 기준을 문서로 고정하는 단계다.

---

## 1. 현재 시스템 구조 분석

현재 AI법친은 이미 다음 기반을 갖추고 있다.

- Next.js App Router 기반
- Prisma / PostgreSQL 기반
- UserRole: USER, LAWYER, STAFF, ADMIN, SUPER_ADMIN
- CaseStatus 기반 사건 진행 구조
- 사건 생성 / 상세 / 상태 전이 API
- 사건 인터뷰 API
- 사건 요약 생성 API
- 첨부파일 업로드 / 다운로드 API
- 문서 생성 / 문단 / 버전 / 승인 / PDF / 출력 / 검증 API
- 의뢰인 / 변호사 / 관리자 대시보드
- 관리자 감사로그 / 알림 / 운영 큐 구조
- AI Evidence Assistant 기반 운영 증빙 보조 구조
- Phase 2 운영 완료
- Phase 3 문서 생성 안전성 파이프라인 완료
- Release Candidate 자동 검증 / 수동 QA 완료
- Phase 4 착수 기준 완료
- Phase 4-1 predeploy lock 기준 완료

따라서 AI법친 6.0은 완전히 새로 만드는 기능이 아니라, 기존 사건 흐름을 묶어 **외부 변호사 검토용 사건 패키지**로 확장하는 작업이다.

---

## 2. 기존 사건 / 사용자 / 권한 / 문서 흐름

현재 코드 기준의 핵심 흐름은 다음과 같다.

1. 일반 사용자(USER)가 사건을 생성한다.
2. 사건은 CaseStatus 기준으로 진행된다.
3. 사용자는 AI 인터뷰를 진행한다.
4. AI가 사건 요약을 생성한다.
5. 첨부자료가 CaseAttachment로 연결된다.
6. 문서 초안 또는 LegalDocument가 생성된다.
7. 변호사 / 관리자 / 담당자가 사건을 검토한다.
8. 승인, 전달, 종결 상태로 이어진다.

현재 이미 존재하는 핵심 API 흐름은 다음과 같다.

```text
src/app/api/cases/route.ts
src/app/api/cases/[caseId]/route.ts
src/app/api/cases/[caseId]/detail/route.ts
src/app/api/cases/[caseId]/interview/route.ts
src/app/api/cases/[caseId]/summary/generate/route.ts
src/app/api/cases/[caseId]/attachments/route.ts
src/app/api/cases/[caseId]/attachments/[attachmentId]/download/route.ts
src/app/api/cases/[caseId]/documents/generate/route.ts
src/app/api/documents/[documentId]/pdf/route.ts
src/app/api/documents/[documentId]/print/route.ts
src/app/api/documents/[documentId]/delivery/route.ts
src/app/api/document-verification/route.ts
src/app/api/verification/verify/route.ts
```

따라서 6.0에서 필요한 것은 “사건을 새로 관리하는 구조”가 아니라, 기존 Case를 바탕으로 공유 가능한 사건 패키지 레이어를 추가하는 것이다.

## 3. 일반 사용자가 얻는 핵심 가치

일반 사용자가 AI법친을 통해 얻는 가치는 다음과 같다.

- 혼자 설명하기 어려운 사건을 질문 흐름에 따라 정리한다.
- 사건 경위, 주요 날짜, 금액, 당사자, 피해 내용을 구조화한다.
- 계약서, 문자, 계좌이체 내역, 녹취, 사진 등 증거자료를 정리한다.
- 변호사 상담 전에 사건 요약본을 준비한다.
- 고소장, 진술서, 의견서 등 문서 초안의 기초를 준비한다.
- 변호사에게 전달 가능한 사건 패키지를 만든다.
- 사건 고유번호를 통해 변호사에게 자료를 안전하게 공유한다.

### 홈페이지 핵심 문구

AI법친은 일반인이 혼자 설명하기 어려운 사건을 AI 질문 흐름에 따라 정리하고,
변호사가 검토하기 쉬운 사건 패키지로 만들어주는 플랫폼입니다.

## 4. 사건 패키지 개념 정의

6.0의 핵심 기능명은 다음과 같다.

AI법친 사건 패키지

사건 패키지는 변호사 검토를 위해 기존 사건 데이터를 하나로 묶은 단위다.

### 사건 패키지 구성

- 사건 고유번호
- 사건 유형
- 의뢰인 기본 정보
- 상대방 정보
- 사건 발생 일시
- 사건 경위
- 피해 금액 / 손해 내용
- 주요 쟁점 후보
- AI 인터뷰 답변
- 사건 요약
- 증거자료 목록
- 첨부파일
- 문서 초안의 기초
- 추가 확인 필요 항목
- 공유 범위
- 다운로드 허용 여부
- 공유 만료일
- 열람 로그

핵심은 “법률문서 완성본”이 아니라 변호사 검토용 사건 정리 패키지다.

## 5. 고유번호 발급 정책

사건 패키지에는 사람이 전달하기 쉬운 고유번호가 필요하다.

### 추천 형식

AIF-2026-000184

보안을 강화하는 경우 다음 구조를 사용한다.

AIF-2026-000184 + 접근 PIN

### 최종 추천 구조

- publicCode: AIF-2026-000184
- accessToken: 서버 내부 검증용 랜덤 토큰
- optionalPin: 선택형 접근 PIN
- expiresAt: 공유 만료일
- shareStatus: ACTIVE / EXPIRED / REVOKED

### 중요 원칙

고유번호만으로 바로 열람되면 안 된다.

아래 조건을 모두 만족해야 열람 가능해야 한다.

- 변호사 로그인
- 사건 고유번호 확인
- 공유 상태 ACTIVE
- 의뢰인 공유 승인 상태
- 공유 만료일 미도래
- 권한 범위 일치
- 취소 상태 아님

## 6. 의뢰인 공유 동의 구조

의뢰인이 사건 패키지를 변호사에게 공유할 때 반드시 동의 절차가 있어야 한다.

### 공유 동의 필수 항목

- 어떤 사건을 공유하는지
- 누구에게 공유하는지
- 어떤 자료를 공유하는지
- 첨부파일 다운로드를 허용하는지
- 공유 기간은 언제까지인지
- 언제든 공유를 중단할 수 있는지
- 변호사가 열람한 기록이 남는지

### 동의 문구 예시

본인은 선택한 사건 정보, 사건 요약, 인터뷰 답변, 첨부자료 및 문서 초안의 기초가
지정한 변호사 또는 전문가에게 제공될 수 있음을 확인합니다.

공유 범위, 다운로드 허용 여부, 공유 기간을 확인했으며,
필요 시 공유를 중단할 수 있음을 안내받았습니다.

## 7. 변호사 고유번호 조회 흐름

변호사 흐름은 단순해야 한다.

1. 변호사 로그인
2. 사건 고유번호 입력
3. 시스템이 공유 상태 확인
4. 변호사 계정 권한 확인
5. 의뢰인 공유 승인 여부 확인
6. 사건 패키지 열람
7. 필요 시 첨부자료 다운로드
8. 검토 메모 작성
9. 의뢰인에게 보완 요청

### 변호사 화면에서 먼저 보여야 할 항목

- 사건 고유번호
- 사건 유형
- 의뢰인 이름 또는 비식별 표시
- 사건 요약
- 주요 날짜
- 주요 금액
- 당사자 정보
- 증거자료 목록
- 첨부파일
- 문서 초안의 기초
- 추가 확인 필요 항목

## 8. 열람 / 다운로드 권한 분리

열람과 다운로드는 반드시 분리한다.

### 권한 구분

- 열람만 허용
- PDF 요약본 다운로드 허용
- 첨부파일 다운로드 허용
- 문서 초안 다운로드 허용
- 전체 패키지 다운로드 허용

### 공유 범위

- 사건 요약만 공유
- 사건 요약 + AI 인터뷰 답변 공유
- 사건 요약 + 첨부자료 목록 공유
- 첨부파일 다운로드 허용
- 문서 초안의 기초 공유
- 전체 패키지 공유

### 추천 기본값

- 사건 요약 열람 허용
- 첨부자료 목록 열람 허용
- 첨부파일 다운로드는 별도 체크
- 공유 기간 7일
- 의뢰인 언제든 공유 취소 가능

## 9. 첨부자료 / 문서 초안 / 사건 요약 연계

기존 구조상 다음 모델과 API를 활용할 수 있다.

### 기존 활용 대상

- Case
- CaseAttachment
- CaseTimelineMemo
- LegalDocument
- LegalDocumentParagraph
- LegalDocumentVersion
- CaseTimelineEvent

### 사건 패키지 데이터 구성

- Case 기본 정보
- Case 상태
- 인터뷰 답변
- AI 요약
- CaseAttachment 목록
- LegalDocument 목록
- 승인된 문서 버전
- 문서 초안의 기초
- 타임라인 메모

### 다운로드 후보

- 사건 요약 PDF
- 첨부자료 원본
- 첨부자료 목록 CSV 또는 PDF
- 문서 초안 PDF
- 변호사 검토용 사건 패키지 PDF

## 10. 개인정보 / 보안 / 열람 로그 / 만료일 정책

6.0은 개인정보와 민감 사건자료를 다루므로 아래 정책이 필수다.

### 필수 보안 정책

- 변호사 로그인 필수
- 의뢰인 공유 동의 필수
- 공유 범위 설정
- 다운로드 허용 여부 설정
- 공유 만료일 설정
- 공유 취소 기능
- 열람 로그 저장
- 다운로드 로그 저장
- 접근 실패 로그 저장
- 첨부파일 직접 URL 노출 금지
- 만료된 공유 접근 차단
- 취소된 공유 접근 차단

### 열람 / 다운로드 로그 항목

- shareId
- caseId
- lawyerUserId
- action: VIEW / DOWNLOAD / DENIED / EXPIRED / REVOKED
- targetType: SUMMARY / ATTACHMENT / DOCUMENT / PACKAGE
- targetId
- ip
- userAgent
- createdAt

## 11. 기존 코드 기준 변경 필요 파일 후보

6.0 이후 구현 단계에서 영향을 받을 파일 후보는 다음과 같다.

- prisma/schema.prisma
- src/app/api/cases/[caseId]/route.ts
- src/app/api/cases/[caseId]/detail/route.ts
- src/app/api/cases/[caseId]/attachments/[attachmentId]/download/route.ts
- src/app/api/cases/[caseId]/documents/route.ts
- src/app/api/documents/[documentId]/pdf/route.ts
- src/app/api/documents/[documentId]/print/route.ts
- src/app/(protected)/cases/[caseId]/page.tsx
- src/components/cases/*
- src/components/lawyer/*
- src/components/admin/*
- src/lib/auth/*
- src/lib/get-session-user.ts
- src/lib/permissions/*
- src/lib/cases/*
- src/lib/documents/*
- src/lib/definitions/case-status.ts

### 신규 후보 폴더

- src/lib/case-package/
- src/app/api/case-packages/
- src/app/api/lawyer/case-packages/
- src/components/case-package/
- src/components/lawyer/case-package/

## 12. 신규 DB 모델 후보

6.x 사건 패키지는 결국 DB 모델이 필요하다.
단, 6.0에서는 후보로만 둔다. 실제 Prisma 변경은 6.2 또는 6.3에서 진행하는 것이 안전하다.

```prisma
enum CasePackageShareStatus {
  ACTIVE
  EXPIRED
  REVOKED
}

enum CasePackageAccessAction {
  VIEW
  DOWNLOAD
  DENIED
  EXPIRED
  REVOKED
}

model CasePackageShare {
  id                         String                 @id @default(cuid())
  caseId                     String
  ownerUserId                String
  lawyerUserId               String?
  publicCode                 String                 @unique
  accessTokenHash            String?
  optionalPinHash            String?
  status                     CasePackageShareStatus @default(ACTIVE)
  allowSummary               Boolean                @default(true)
  allowInterview             Boolean                @default(true)
  allowAttachmentList        Boolean                @default(true)
  allowAttachmentDownload    Boolean                @default(false)
  allowDocumentDraft         Boolean                @default(false)
  allowPackagePdf            Boolean                @default(false)
  consentText                String                 @db.Text
  consentedAt                DateTime
  expiresAt                  DateTime?
  revokedAt                  DateTime?
  revokeReason               String?
  createdAt                  DateTime               @default(now())
  updatedAt                  DateTime               @updatedAt

  case                       Case                   @relation(fields: [caseId], references: [id], onDelete: Cascade)
  owner                      User                   @relation("CasePackageShareOwner", fields: [ownerUserId], references: [id], onDelete: Cascade)
  lawyer                     User?                  @relation("CasePackageShareLawyer", fields: [lawyerUserId], references: [id], onDelete: SetNull)
  accessLogs                 CasePackageAccessLog[]

  @@index([caseId, status])
  @@index([ownerUserId, createdAt])
  @@index([lawyerUserId, createdAt])
  @@index([publicCode])
}

model CasePackageAccessLog {
  id              String                  @id @default(cuid())
  shareId         String
  caseId          String
  actorUserId     String?
  action          CasePackageAccessAction
  targetType      String
  targetId        String?
  ip              String?
  userAgent       String?
  resultMessage   String?
  createdAt       DateTime                @default(now())

  share           CasePackageShare        @relation(fields: [shareId], references: [id], onDelete: Cascade)

  @@index([shareId, createdAt])
  @@index([caseId, createdAt])
  @@index([actorUserId, createdAt])
}
```

## 13. 신규 API 후보

- POST   /api/cases/[caseId]/package-shares
- GET    /api/cases/[caseId]/package-shares
- GET    /api/cases/[caseId]/package-shares/[shareId]
- PATCH  /api/cases/[caseId]/package-shares/[shareId]
- POST   /api/cases/[caseId]/package-shares/[shareId]/revoke
- POST   /api/lawyer/case-packages/lookup
- GET    /api/lawyer/case-packages/[shareId]
- GET    /api/lawyer/case-packages/[shareId]/summary
- GET    /api/lawyer/case-packages/[shareId]/attachments
- GET    /api/lawyer/case-packages/[shareId]/attachments/[attachmentId]/download
- GET    /api/lawyer/case-packages/[shareId]/documents
- GET    /api/lawyer/case-packages/[shareId]/package-pdf
- POST   /api/lawyer/case-packages/[shareId]/request-supplement
- GET    /api/cases/[caseId]/package-shares/[shareId]/access-logs

## 14. 신규 화면 후보

### 의뢰인 화면

- /cases/[caseId]/share
- /cases/[caseId]/share/[shareId]

구성:

- 사건 패키지 미리보기
- 공유 범위 선택
- 다운로드 허용 여부 선택
- 공유 기간 선택
- 변호사 지정 여부
- 동의 체크
- 고유번호 발급
- 공유 취소
- 열람 로그 확인

### 변호사 화면

- /lawyer/case-packages/lookup
- /lawyer/case-packages/[shareId]

구성:

- 고유번호 입력
- 접근 PIN 입력 후보
- 사건 패키지 열람
- 사건 요약
- 첨부자료 목록
- 다운로드 버튼
- 문서 초안 기초 확인
- 보완 요청
- 검토 메모

### 관리자 화면

- /admin/case-package-shares
- /admin/case-package-shares/[shareId]

구성:

- 전체 공유 현황
- 만료 / 취소 / 활성 상태
- 열람 로그
- 다운로드 로그
- 접근 실패 로그
- 개인정보 / 보안 점검

## 15. 단계별 구현 로드맵

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
- 6.10 — QA / 회귀 / 배포 전 점검

## 16. 홈페이지 문구 개선안

### 메인 가치 문구

혼자 정리하기 어려운 사건을,
변호사가 검토하기 쉬운 사건 패키지로 준비합니다.

### 보조 문구

AI법친은 의뢰인이 사건 경위, 피해 내용, 증거자료, 요청 사항을
AI 질문 흐름에 따라 정리하고,
변호사가 고유번호로 열람할 수 있는 사건 패키지로 구성합니다.

### 일반인 가치 섹션

로그인하면 내 사건을 변호사 검토용 패키지로 정리할 수 있습니다.

AI법친은 의뢰인이 혼자 설명하기 어려운 사건을 질문 흐름에 따라 정리하고,
사건 경위, 주요 날짜, 금액, 당사자, 피해 내용을
변호사가 검토하기 쉬운 형태로 구성합니다.

### 변호사 연계 섹션

고유번호로 변호사와 사건 자료를 연결합니다.

사건 정리가 완료되면 AI법친은 사건 고유번호를 발급합니다.
의뢰인은 공유 범위와 기간을 선택해 변호사에게 고유번호를 전달할 수 있고,
변호사는 로그인 후 해당 번호로 사건 요약과 자료를 열람할 수 있습니다.

### 시·공간 가치 섹션

상담 전, 이미 사건의 구조가 준비됩니다.

의뢰인은 상담 전에 사건을 정리하고,
변호사는 상담 전에 핵심 자료를 검토할 수 있습니다.

AI법친은 의뢰인의 설명 시간을 줄이고,
변호사의 사전 검토를 가능하게 하여
상담과 문서 준비의 시간을 더 가치 있게 만듭니다.

### 안전 고지

AI법친은 변호사를 대체하지 않습니다.

AI가 정리한 사건 요약과 문서 초안의 기초는 법률 자문이나 최종 문서가 아니며,
최종 법률 판단과 문서 사용 여부는 반드시 변호사 또는 적법한 전문가의 검토를 거쳐야 합니다.

## 17. 개발팀 전달용 작업지시서

### 작업명

AI법친 6.0 — 사건 패키지 / 고유번호 공유 / 변호사 열람 연계 기획서

### 목적

일반 사용자가 사건을 AI 질문 흐름으로 정리한 뒤, 변호사가 고유번호와 권한 승인으로 사건 패키지를 열람·다운로드할 수 있는 구조를 설계한다.

### 이번 단계에서 할 것

- 기존 Case / Attachment / LegalDocument 구조 기반 사건 패키지 개념 정의
- 고유번호 발급 정책 정의
- 의뢰인 공유 동의 구조 정의
- 변호사 조회 / 열람 흐름 정의
- 열람 / 다운로드 권한 분리
- 개인정보 / 보안 / 열람 로그 / 만료일 정책 정의
- 신규 DB 모델 후보 작성
- 신규 API 후보 작성
- 신규 화면 후보 작성
- 구현 로드맵 작성
- 홈페이지 문구 개선안 작성

### 이번 단계에서 하지 않을 것

- Prisma schema 실제 변경 없음
- API 실제 구현 없음
- 화면 실제 구현 없음
- 첨부파일 다운로드 정책 변경 없음
- 기존 사건 상태값 변경 없음
- 대시보드 3.x 재오픈 없음
- 변호사법상 법률판단 자동화 표현 금지

### 완료 기준

- 6.0 기획서 작성 완료
- 신규 DB 모델 후보 정리
- 신규 API 후보 정리
- 신규 화면 후보 정리
- 단계별 로드맵 정리
- 홈페이지 문구 개선안 정리
- 기존 코드 변경 없이 문서 기준만 확정
