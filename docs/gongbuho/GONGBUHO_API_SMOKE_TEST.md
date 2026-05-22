# Gongbuho API Smoke & 시드 검증 가이드 (Phase 2-D)

이 문서는 **LAW_FRAUD_001** 샘플을 DB에 올린 뒤, **승인 → 적용 → Trace 조회** 및 대표 실패 경로까지 한 번에 닫았는지 확인하는 최소 체크리스트입니다.

## 1. 사전 조건

- 레포에서 **PostgreSQL 마이그레이션 반영 완료**  
  (`npx prisma migrate deploy` 또는 `npm run db:migrate`)  
  — Gongbuho 테이블이 없으면 모든 API가 실패합니다.
- 로컬에 **DATABASE_URL** 이 설정되어 있음.
- (선택) 시드 작성자 표기: ADMIN/SUPER_ADMIN 계정 존재 또는 `GONGBUHO_SEED_CREATED_BY_USER_ID`.

## 2. 샘플 패킷 등록(DRAFT)

```bash
npm run seed:gongbuho-law-fraud-001
```

- 재실행 시 **동일 code+version 이미 존재하면 SKIP**(업데이트 없음).

## 3. 승인 (ADMIN 계정 필요)

헤더에 운영 관리 세션(JWT 쿠키 `aibupchin_access_token`)을 실은 채 브라우저·Thunder Client 등으로 호출합니다.

```http
POST /api/admin/gongbuho/{gongbuhoId}/approve
```

**STAFF 로그인 상태**에서 호출 시 **403**이면 정상(Phase 2-C 정책: 승인은 ADMIN/SUPER_ADMIN만).

성공 후:

```http
GET /api/admin/gongbuho/{gongbuhoId}
```

응답 `packetJson` 존재, `status: APPROVED`, `approvedAt` 부여 확인.

대안: 샘플을 API로 최초 등록하고 싶다면 `POST /api/admin/gongbuho` 에 `samples`와 동일 `packetJson` 본문(필수 키 충족)을 넣어도 됩니다.

## 4. 사건 적용 (`canWriteCase` 권한)

사건 소유주·배정 변호사·배정 STAFF·플랫폼 ADMIN 등 수정 권한이 있는 사용자로:

```http
POST /api/cases/{caseId}/gongbuho/apply
Content-Type: application/json

{} 
```

조건:

- 해당 사건 **`Case.category`가 패킷 `caseType`(예:`FRAUD`)과 같고**, 동일 카테고리에 **APPROVED 패킷이 정확히 1건**만 있거나,
- 명시 선택:

```json
{ "code": "LAW-FRAUD-001", "version": "1.0.0" }
```

성공 시 **201** 및 trace 메타 포함.

## 5. Trace 조회

```http
GET /api/cases/{caseId}/gongbuho/trace
```

(사건 열람 권한 `canRead` 보유 사용자) 목록에 방금 적용 레코드가 보이면 성공입니다.

---

## 6. 인터뷰 질문셋 바인딩(Phase 3-D, 선택)

QuestionSet 이 **게시(PUBLISHED)·활성**이며 Phase 3-B envelope 로 공부호와 연결된 경우에만 가능합니다(`GONGBUHO_INTERVIEW_BINDING.md` 참고).

```http
GET /api/cases/{caseId}/gongbuho/interview
```

```http
POST /api/cases/{caseId}/gongbuho/interview/bind
Content-Type: application/json

{"auto":true}
```

또는 `gongbuhoPacketId` + `questionSetId` 명시.

## 7. 실패 케이스(자동 테스트)

Vitest 로 서비스·라우트 스모크를 돌립니다.

```bash
npm run test -- src/features/gongbuho/
npm run test -- "src/app/api/admin/gongbuho"
npm run test -- "src/app/api/cases/[caseId]/gongbuho"
```

포함 검증 예:

| 케이스 | 기대 |
|--------|------|
| DRAFT/비 APPROVED 를 `code/version` 로 적용 시도 | 404 또는 NotFound |
| `ARCHIVED` 승인 시도 | 400, `GONGBUHO_PACKET_NOT_APPROVABLE` |
| 동일 `code+version` 다시 생성 | 409 · `DUPLICATE_PACKET` 또는 DB unique |
| 동일 카테고리 APPROVED 복수 + body 비움 | 400 · 후보 포함 |
| 존재하지 않는 유효 cuid 형식의 `caseId` | 접근 검증 후 404 |
| STAFF 가 approve | 403 |

## 8. 판정 기준 (Phase 2-D 완료)

- [ ] `npm run seed:gongbuho-law-fraud-001` 가 최초 1회 **CREATE**, 재실행 **SKIP**.
- [ ] APPROVED 이후 적용 성공 후 Trace 목록 반환.
- [ ] 위 표 실패 분기 및 Vitest **통과**.

## 9. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-23 | Phase 2-D 초안 |
| 2026-05-23 | Phase 3-D 인터뷰 바인딩 라우트·체크 안내 추가 |
