# Judicial Transparency / Explainability RC Lock Summary — Product Phase **45-F**

**상태**: Product Phase **45-F** — **Judicial Transparency / Explainability RC LOCKED**

**증빙 태그**: **`[EVIDENCE-20260525-AIBEOPCHIN-JUDICIAL-TRANSPARENCY-EXPLAINABILITY-PHASE45F-RC]`**

**선행**: Product **44-F** · **43-F** · Phase **45-A~E**

## 1. 한 줄 기준

**AI법친 Phase 45는 AI가 어떤 사건자료·증거·판결문·검토 이력을 근거로 각 후보 판단과 court-ready pack 항목을 구성했는지 투명하게 설명하는 단계다.**

핵심: **“AI가 왜 이렇게 정리했는지”** 추적 가능.

## 2. Core trace dimensions

- 사용한 증거 · 참조한 판결문 · 제외한 자료 · 연결한 주장
- 유사/차이 분석 · 불확실성 · 변호사 수정 이력 · 최종 검토자

## 3. Sub-phases

| Phase | 이름 |
| --- | --- |
| **45-A** | Source Provenance Trace Registry |
| **45-B** | Judgment & Claim Link Explainability Engine |
| **45-C** | Similarity / Difference & Uncertainty Signal Engine |
| **45-D** | Lawyer Correction & Final Reviewer Trace |
| **45-E** | Court-Ready Pack Item Explainability Workspace |
| **45-F** | Judicial Transparency / Explainability RC |

## 4. Bundled verify

```bash
npm run verify:aibeopchin-judicial-transparency-explainability-rc
```

## 5. Cross-link (44-F · 43-F)

```bash
npm run verify:aibeopchin-court-ready-case-record-pack-rc
npm run verify:aibeopchin-claim-evidence-judgment-graph-rc
```

## 6. Source provenance gate marker

`phase45a-source-provenance-trace-registry-gate` — 45-A provenance SSOT.

## 7. 경계

**no unexplained AI output / no hidden source omission / no client-visible explainability without lawyer review / lawyer review required**

## 8. 다음

Product Phase **46** Neutral Litigation Review Pack — neutral pack · 변호사 통제 export → **47** Legal Reliability RC

**버전** **`45-F.1`**
