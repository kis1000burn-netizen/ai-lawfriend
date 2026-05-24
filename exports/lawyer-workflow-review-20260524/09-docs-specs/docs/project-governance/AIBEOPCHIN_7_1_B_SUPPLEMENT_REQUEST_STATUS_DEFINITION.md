# AI법친 7.1-B — 보완 요청 상태값 정의서

## 1. 문서 목적

AI법친 7.1-B 보완 요청 상태값 정의서는 보완 요청 워크플로우에서 사용하는 상태값, 상태 의미, 허용 전이, 금지 전이, 역할별 전이 권한, 상태 로그 기록 기준을 고정하기 위한 기준문서다.

이 문서는 코드 구현 문서가 아니다.  
이 문서는 이후 DB enum, API 전이 검증, 화면 배지, QA 체크리스트에서 참조할 상태값의 canonical source 역할을 한다.

## 2. 현재 전제

- AI법친 6.x 사건 패키지 기능군은 운영 배포 및 Smoke Test 14/14 PASS 이후 최종 잠금 완료 상태다.
- 6.x 기능 로직, API, DB, 권한 정책은 변경하지 않는다.
- AI법친 7.1-B는 보완 요청 워크플로우를 별도 7.x 로드맵으로 분리해 진행한다.
- 보완 요청 워크플로우 정의서는 완료되었다.
- 이번 단계는 상태값 정의 단계이며 DB schema 변경, API 구현, 화면 구현은 하지 않는다.

## 3. 상태값 canonical 목록

보완 요청 상태값은 아래 10개로 고정한다.

| 상태값 | 한글명 | 최종 여부 | 설명 |
|---|---|---:|---|
| DRAFT | 작성 중 | 아니오 | 변호사가 보완 요청을 작성 중인 상태 |
| SENT | 발송됨 | 아니오 | 의뢰인에게 보완 요청이 발송된 상태 |
| CLIENT_VIEWED | 의뢰인 확인 | 아니오 | 의뢰인이 보완 요청을 열람한 상태 |
| CLIENT_RESPONDED | 의뢰인 응답 완료 | 아니오 | 의뢰인이 답변 또는 자료를 제출한 상태 |
| UNDER_REVIEW | 변호사 재검토 중 | 아니오 | 변호사가 의뢰인의 응답을 검토 중인 상태 |
| NEEDS_MORE_INFO | 추가 보완 필요 | 아니오 | 응답이 부족해 추가 보완이 필요한 상태 |
| ACCEPTED | 보완 수용 | 예 | 변호사가 보완 내용을 수용한 상태 |
| CLOSED | 종료 | 예 | 보완 요청 흐름이 종료된 상태 |
| CANCELLED | 취소 | 예 | 보완 요청이 취소된 상태 |
| EXPIRED | 기한 만료 | 예 | 응답 기한이 지나 만료된 상태 |

## 4. 상태별 상세 정의

### 4.1 DRAFT

변호사가 보완 요청을 작성 중인 상태다.

- 의뢰인에게 아직 노출되지 않는다.
- 변호사는 내용을 수정할 수 있다.
- 변호사는 발송 또는 취소할 수 있다.
- 이 상태에서는 의뢰인 응답이 불가능하다.

### 4.2 SENT

보완 요청이 의뢰인에게 발송된 상태다.

- 의뢰인은 보완 요청을 확인할 수 있다.
- 의뢰인은 아직 열람하지 않았을 수 있다.
- 변호사는 발송 이후 내용을 임의 수정하지 않는다.
- 응답 기한이 있으면 만료 판단 대상이 된다.

### 4.3 CLIENT_VIEWED

의뢰인이 보완 요청을 열람한 상태다.

- 의뢰인이 요청 내용을 확인했음을 의미한다.
- 의뢰인은 답변 또는 첨부자료를 제출할 수 있다.
- 기한 내 응답하지 않으면 EXPIRED 전이 후보가 된다.

### 4.4 CLIENT_RESPONDED

의뢰인이 보완 요청에 응답한 상태다.

- 답변 텍스트 또는 첨부자료가 제출된 상태다.
- 변호사 재검토 진입 전 상태다.
- 의뢰인은 제출 후 임의 수정할 수 없다.
- 수정이 필요하면 변호사의 재요청 또는 별도 수정 정책이 필요하다.

### 4.5 UNDER_REVIEW

변호사가 의뢰인의 응답을 재검토 중인 상태다.

- 변호사는 응답 내용을 확인한다.
- 변호사는 ACCEPTED 또는 NEEDS_MORE_INFO로 전이할 수 있다.
- 필요 시 내부 검토 메모와 연결할 수 있다.
- AI는 응답 요약 보조만 가능하다.

### 4.6 NEEDS_MORE_INFO

추가 보완이 다시 필요한 상태다.

- 변호사가 응답이 부족하다고 판단한 상태다.
- 의뢰인에게 추가 요청 내용을 다시 전달할 수 있다.
- SENT로 재발송하거나 별도 재요청 회차를 생성할 수 있다.
- 구체 방식은 데이터/API 정의서에서 확정한다.

### 4.7 ACCEPTED

변호사가 보완 내용을 수용한 상태다.

- 보완 요청의 핵심 목적이 충족된 상태다.
- 최종 상태로 본다.
- 이후 CLOSED로 정리할 수 있다.
- 의뢰인의 추가 응답은 불가하다.

### 4.8 CLOSED

보완 요청 흐름이 종료된 상태다.

- 최종 종료 상태다.
- 추가 수정, 응답, 재요청은 불가하다.
- 감사 로그와 상태 이력은 보존한다.

### 4.9 CANCELLED

보완 요청이 취소된 상태다.

- 변호사 또는 권한 있는 운영자가 취소한 상태다.
- 의뢰인에게 이미 보였던 요청이라면 취소 사유가 남아야 한다.
- 최종 상태로 본다.
- 취소 후 응답은 불가하다.

### 4.10 EXPIRED

응답 기한이 지나 만료된 상태다.

- 의뢰인이 기한 내 응답하지 않았음을 의미한다.
- 최종 상태로 본다.
- 변호사가 필요하면 새 보완 요청을 생성할 수 있다.
- 기존 요청을 임의로 되살리지 않는다.

## 5. 정상 전이표

| From | To | 전이 행위 | 주체 |
|---|---|---|---|
| DRAFT | SENT | 보완 요청 발송 | LAWYER |
| DRAFT | CANCELLED | 작성 중 취소 | LAWYER |
| SENT | CLIENT_VIEWED | 의뢰인 열람 | USER |
| SENT | CLIENT_RESPONDED | 의뢰인 즉시 응답 | USER |
| SENT | CANCELLED | 발송 후 취소 | LAWYER / ADMIN / SUPER_ADMIN |
| SENT | EXPIRED | 응답 기한 만료 | SYSTEM / ADMIN |
| CLIENT_VIEWED | CLIENT_RESPONDED | 의뢰인 응답 제출 | USER |
| CLIENT_VIEWED | EXPIRED | 응답 기한 만료 | SYSTEM / ADMIN |
| CLIENT_RESPONDED | UNDER_REVIEW | 변호사 재검토 시작 | LAWYER |
| UNDER_REVIEW | ACCEPTED | 보완 수용 | LAWYER |
| UNDER_REVIEW | NEEDS_MORE_INFO | 추가 보완 필요 판단 | LAWYER |
| NEEDS_MORE_INFO | SENT | 추가 보완 요청 재발송 | LAWYER |
| ACCEPTED | CLOSED | 보완 요청 종료 | LAWYER / ADMIN / SUPER_ADMIN |

## 6. 금지 전이표

| From | To | 금지 사유 |
|---|---|---|
| DRAFT | CLIENT_VIEWED | 발송 전 의뢰인 열람 불가 |
| DRAFT | CLIENT_RESPONDED | 발송 전 응답 불가 |
| SENT | UNDER_REVIEW | 의뢰인 응답 없이 재검토 불가 |
| SENT | ACCEPTED | 의뢰인 응답 없이 수용 불가 |
| CLIENT_VIEWED | UNDER_REVIEW | 응답 없이 재검토 불가 |
| CLIENT_RESPONDED | SENT | 응답 완료 후 단순 발송 상태로 되돌림 금지 |
| UNDER_REVIEW | CLIENT_RESPONDED | 재검토 상태에서 응답 완료 상태로 역전이 금지 |
| ACCEPTED | CLIENT_RESPONDED | 수용 후 의뢰인 재응답 금지 |
| ACCEPTED | NEEDS_MORE_INFO | 수용 후 추가 보완 요청 금지 |
| CLOSED | DRAFT | 종료 후 작성 중 복귀 금지 |
| CLOSED | SENT | 종료 후 재발송 금지 |
| CLOSED | CLIENT_RESPONDED | 종료 후 응답 금지 |
| CANCELLED | SENT | 취소 후 재발송 금지 |
| CANCELLED | CLIENT_RESPONDED | 취소 후 응답 금지 |
| EXPIRED | CLIENT_RESPONDED | 만료 후 응답 금지 |
| EXPIRED | SENT | 만료 요청의 직접 재발송 금지 |

## 7. 역할별 전이 권한

| 전이 | USER | LAWYER | STAFF | ADMIN | SUPER_ADMIN | SYSTEM |
|---|---:|---:|---:|---:|---:|---:|
| DRAFT → SENT | 불가 | 가능 | 불가 | 제한 | 가능 | 불가 |
| DRAFT → CANCELLED | 불가 | 가능 | 불가 | 가능 | 가능 | 불가 |
| SENT → CLIENT_VIEWED | 가능 | 불가 | 불가 | 불가 | 불가 | 불가 |
| SENT → CLIENT_RESPONDED | 가능 | 불가 | 불가 | 불가 | 불가 | 불가 |
| SENT → CANCELLED | 불가 | 가능 | 제한 | 가능 | 가능 | 불가 |
| SENT → EXPIRED | 불가 | 불가 | 제한 | 가능 | 가능 | 가능 |
| CLIENT_VIEWED → CLIENT_RESPONDED | 가능 | 불가 | 불가 | 불가 | 불가 | 불가 |
| CLIENT_VIEWED → EXPIRED | 불가 | 불가 | 제한 | 가능 | 가능 | 가능 |
| CLIENT_RESPONDED → UNDER_REVIEW | 불가 | 가능 | 제한 | 가능 | 가능 | 불가 |
| UNDER_REVIEW → ACCEPTED | 불가 | 가능 | 불가 | 제한 | 가능 | 불가 |
| UNDER_REVIEW → NEEDS_MORE_INFO | 불가 | 가능 | 불가 | 제한 | 가능 | 불가 |
| NEEDS_MORE_INFO → SENT | 불가 | 가능 | 불가 | 제한 | 가능 | 불가 |
| ACCEPTED → CLOSED | 불가 | 가능 | 제한 | 가능 | 가능 | 불가 |

## 8. 상태별 화면 표시 기준

| 상태값 | 화면 배지 | 설명 문구 |
|---|---|---|
| DRAFT | 작성 중 | 아직 의뢰인에게 발송되지 않았습니다. |
| SENT | 발송됨 | 의뢰인 응답을 기다리고 있습니다. |
| CLIENT_VIEWED | 확인됨 | 의뢰인이 보완 요청을 확인했습니다. |
| CLIENT_RESPONDED | 응답 완료 | 의뢰인이 보완 답변을 제출했습니다. |
| UNDER_REVIEW | 재검토 중 | 변호사가 보완 내용을 검토 중입니다. |
| NEEDS_MORE_INFO | 추가 보완 필요 | 추가 정보 또는 자료가 필요합니다. |
| ACCEPTED | 수용됨 | 보완 내용이 수용되었습니다. |
| CLOSED | 종료 | 보완 요청이 종료되었습니다. |
| CANCELLED | 취소 | 보완 요청이 취소되었습니다. |
| EXPIRED | 만료 | 응답 기한이 만료되었습니다. |

## 9. 만료 처리 기준

만료는 다음 조건에서 발생한다.

- 상태가 SENT 또는 CLIENT_VIEWED인 상태
- 응답 기한이 존재함
- 현재 시각이 응답 기한을 초과함
- 의뢰인 응답이 아직 제출되지 않음

만료 처리 원칙:

- 만료된 요청은 EXPIRED로 전이한다.
- EXPIRED 상태에서는 의뢰인 응답을 받지 않는다.
- 변호사가 필요하면 새 보완 요청을 생성한다.
- 기존 EXPIRED 요청을 SENT로 직접 되돌리지 않는다.
- 만료 처리는 SYSTEM 또는 권한 있는 ADMIN이 수행할 수 있다.

## 10. 취소 처리 기준

취소는 다음 조건에서 발생한다.

- 요청 내용이 잘못 작성됨
- 요청 대상 사건이 부적절함
- 변호사가 요청을 철회함
- 운영상 취소가 필요함
- 중복 보완 요청이 생성됨

취소 처리 원칙:

- CANCELLED는 최종 상태다.
- 취소 사유를 기록해야 한다.
- 이미 의뢰인이 열람한 요청이면 취소 사실을 화면에 표시한다.
- 취소 후 응답은 불가하다.
- 취소 요청을 다시 사용하지 않고 필요한 경우 새 요청을 생성한다.

## 11. 재요청 처리 기준

재요청은 UNDER_REVIEW 상태에서 보완 응답이 부족하다고 판단될 때 발생한다.

재요청 처리 원칙:

- UNDER_REVIEW → NEEDS_MORE_INFO 전이 후 처리한다.
- NEEDS_MORE_INFO에서 추가 요청 내용을 작성한다.
- 재발송 시 SENT로 전이한다.
- 재요청 회차 기록이 필요하다.
- 기존 응답과 신규 응답을 구분할 수 있어야 한다.
- 상세 구조는 데이터 정의서에서 확정한다.

## 12. 상태 로그 기록 기준

모든 상태 전이는 로그로 기록한다.

필수 기록 항목 후보:

| 필드 | 설명 |
|---|---|
| requestId | 보완 요청 ID |
| caseId | 사건 ID |
| fromStatus | 이전 상태 |
| toStatus | 변경 상태 |
| actorUserId | 전이 수행자 |
| actorRole | 수행자 역할 |
| reason | 전이 사유 |
| memo | 보충 메모 |
| createdAt | 기록 시각 |
| ip | 요청 IP 후보 |
| userAgent | User-Agent 후보 |

민감정보 기록 금지:

- DATABASE_URL 원문
- accessToken 원문
- optionalPin 원문
- hash 원문
- 첨부파일 직접 URL
- 내부 prompt 원문
- raw AI response 전체
- 민감 사건자료 전문

## 13. AI 개입 제한

AI는 상태 전이를 확정할 수 없다.

AI 가능 범위:

- 보완 요청 후보 문안 추천
- 누락 정보 후보 표시
- 응답 요약 보조
- 재요청 후보 표시
- 검토 체크리스트 추천

AI 금지 범위:

- DRAFT → SENT 자동 발송
- UNDER_REVIEW → ACCEPTED 자동 수용
- UNDER_REVIEW → NEEDS_MORE_INFO 자동 확정
- 법률 판단 확정
- 승소/패소 단정
- 수사/재판 대응 결론 제공

## 14. 상태값과 6.x 관계

7.1-B 상태값은 6.x 사건 패키지 상태값을 변경하지 않는다.

- 기존 CaseStatus 변경 없음
- 기존 CasePackageShareStatus 변경 없음
- 기존 CasePackageAccessAction 변경 없음
- 기존 첨부파일 다운로드 정책 변경 없음
- 기존 PDF 출력 정책 변경 없음

보완 요청 상태값은 별도 7.1-B 도메인 상태값으로 관리한다.

## 15. 이후 데이터 정의서 반영 후보

다음 문서인 데이터 정의서에서는 아래 항목을 검토한다.

- SupplementRequest.status
- SupplementRequestStatusLog
- SupplementRequest.expiresAt
- SupplementRequest.cancelledAt
- SupplementRequest.acceptedAt
- SupplementRequest.closedAt
- SupplementRequest.revisionRound
- SupplementRequest.lastRespondedAt
- SupplementRequest.lastReviewedAt

## 16. 이번 단계에서 하지 않을 것

- Prisma schema 변경
- DB migration 생성
- enum 실제 추가
- API route 구현
- 화면 구현
- 상태 전이 함수 구현
- 기존 6.x 상태값 수정
- 사건 패키지 공유 정책 변경
- 보완 요청 자동 발송
- AI 자동 수용/반려
- 알림/메일 연동

## 17. 완료 기준

이 문서는 아래 기준을 충족하면 완료로 본다.

- 보완 요청 상태값 canonical 목록 확정
- 상태별 의미 정의 완료
- 정상 전이표 정의 완료
- 금지 전이표 정의 완료
- 역할별 전이 권한 정의 완료
- 화면 배지 기준 정의 완료
- 만료/취소/재요청 처리 기준 정의 완료
- 상태 로그 기록 기준 정의 완료
- AI 개입 제한 정의 완료
- 6.x 상태값 비변경 원칙 정의 완료

## 18. 최종 판정

AI법친 7.1-B 보완 요청 상태값은 별도 7.1-B 도메인 상태값으로 관리한다.

이번 단계는 코드 구현이 아니라 상태값 정의 단계다.

다음 작업은 코드 구현이 아니라 다음 문서 작성이다.

```text
AI법친 7.1-B — 보완 요청 데이터 구조 정의서
```
