# AI법친 CMB Schema (AibeopchinCmbCaseConfig)

**SSOT 코드**: [`src/cmb/core/cmb-schema.ts`](../../src/cmb/core/cmb-schema.ts)

## 1. CaseType (5종 — Gongbuho SSOT)

| caseType | Gongbuho code |
| --- | --- |
| `FRAUD` | LAW-FRAUD-001 |
| `WAGE_BACKPAY` | LAW-WAGE-001 |
| `LAND_DISPUTE` | LAW-LAND-001 |
| `CONTENTS_CERTIFIED_DEMAND` | LAW-CONTENT-001 |
| `CRIMINAL_COMPLAINT_DRAFT` | LAW-COMPLAINT-001 |

## 2. Status (Publish 흐름)

```
DRAFT → REVIEW → VERIFY_PASS → LOCKED → PUBLISHED
```

Phase 6-C configs는 **`LOCKED`** 로 시작한다.

## 3. Config 필드 요약

| 섹션 | 필드 | 설명 |
| --- | --- | --- |
| identity | `id`, `caseType`, `title`, `version`, `status` | CMB 레코드 |
| modules | `interview`, `documentTemplate`, `gongbuhoPacket`, `voiceGate`, `approvalFlow` | 모듈 참조 ID |
| interview | `questionSetCode`, `questionSetVersion`, keys, `voiceEnabled` | 질문셋 registry |
| documents | `templateCode`, `templateVersion`, `requireLawyerApproval` | 템플릿 registry |
| gongbuho | `requiredPacketCodes`, `requireApprovedPacketsOnly` | 패킷 연결 |
| gates | boolean flags + `keys[]` | gate SSOT |
| blocks | `string[]` | 화면 block 순서 |
| ui | `clientBlocks`, `lawyerBlocks`, `adminBlocks` | 역할별 노출 |
| audit | `evidenceTag`, `changeReasonRequired` | 증빙·변경 사유 |

## 4. Gate keys

- `REQUIRE_CONFIRMED_INTERVIEW`
- `REQUIRE_VOICE_REVIEW_IF_VOICE_USED`
- `REQUIRE_VOICE_FINALIZE_GATE`
- `REQUIRE_OPEN_SUPLEMENT_RESOLVED`
- `REQUIRE_GONGBUHO_APPROVED_PACKET`
- `REQUIRE_LAWYER_APPROVAL_BEFORE_DELIVERY`

## 5. Registry API

```ts
getCmbCaseConfig(caseType: string): AibeopchinCmbCaseConfig | null
listCmbCaseConfigs(): AibeopchinCmbCaseConfig[]
```

## 6. Runtime API (읽기 전용)

```ts
resolveCmbCaseConfig(caseCategory): AibeopchinCmbCaseConfig | null
getCmbBlocksForRole(config, role): string[]
cmbRequiresVoiceFinalizeGate(config): boolean
```

실제 `assertVoiceDocumentFinalizeAllowed` 등 **enforcement는 CORE**에 유지한다.
