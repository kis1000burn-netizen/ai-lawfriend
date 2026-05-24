# AI Output Quality Evaluation Runbook (Product Phase **23-A**)

**한 줄**: AI governance feature별 golden dataset과 deterministic output quality scoring을 정의해, AI 법률 출력 회귀·품질 평가의 단일 SSOT로 쓸 수 있게 한다.

---

## 1. 범위 (23-A)

| 항목 | 산출물 |
| --- | --- |
| Prisma | `AiEvaluationDatasetEntry` |
| Golden registry | `AI_EVALUATION_DATASET_SAMPLES` |
| Output scoring | `evaluateAiOutputQuality` · `evaluateAiOutputAgainstGoldenEntry` |
| Pass threshold | overall ≥ 80 · MUST_NOT_INVENT 위반 시 fail |

**의도적 제외 (23-B~F)**: lawyer feedback · case pack builder · bundled RC

---

## 2. Scoring dimensions

| Dimension | 설명 |
| --- | --- |
| MUST_MENTION | golden `expectedCriteria.mustMention` 포함률 |
| MUST_NOT_INVENT | 금지 표현(판결·승소 등) 위반 |
| CITATION | `citationRequired` 시 출처/근거 마커 |
| HALLUCINATION_RISK | must-not-invent + risk tier |

---

## 3. 검증

```bash
npm run verify:aibeopchin-ai-quality-phase23a
```

**버전** **`23-A.2`**
