"use client";

/**
 * Product Phase 48 — Legal Reliability Lawyer Workbench UX shell.
 */
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { buildLawyerWorkbenchNavigationShell } from "@/features/legal-reliability-lawyer-workbench/navigation-shell/navigation-shell.service";
import { buildLitigationRiskRadarPanel } from "@/features/legal-reliability-lawyer-workbench/litigation-risk-radar/litigation-risk-radar.service";
import { buildClaimEvidenceJudgmentGraphWorkspace } from "@/features/legal-reliability-lawyer-workbench/claim-graph-workspace/claim-graph-workspace.service";
import { buildJudgmentDrawerPrecedentViewer } from "@/features/legal-reliability-lawyer-workbench/judgment-drawer/judgment-drawer.service";
import { buildCourtReadyPackBuilderUx } from "@/features/legal-reliability-lawyer-workbench/court-ready-pack-builder/court-ready-pack-builder.service";
import type { LegalReliabilityLawyerWorkbenchPanelId } from "@/features/legal-reliability-lawyer-workbench/shared/legal-reliability-lawyer-workbench-types.schema";
import { LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_WORKBENCH_ROUTE } from "@/features/legal-reliability-lawyer-workbench/legal-reliability-lawyer-workbench-rc-lock";
import { buildRiskRadarSignalFromWorkbenchSample } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.policy";
import type { SupplementActionCandidate } from "@/features/legal-reliability-action-loop/phase49a-risk-radar-supplement-action.schema";
import { requireOkData } from "@/lib/client/api-error";
import { RiskRadarSupplementActionButton } from "./risk-radar-supplement-action-button";
import { RiskRadarSupplementCandidateDrawer } from "./risk-radar-supplement-candidate-drawer";
import { GraphGapEvidenceRequestActionButton } from "./graph-gap-evidence-request-action-button";
import { GraphGapEvidenceRequestCandidateDrawer } from "./graph-gap-evidence-request-candidate-drawer";
import { buildClaimGraphGapSignalFromWorkbenchSample } from "@/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.policy";
import type { EvidenceRequestActionCandidate } from "@/features/legal-reliability-action-loop/phase49b-graph-gap-evidence-request-action.schema";

export const LEGAL_RELIABILITY_LAWYER_WORKBENCH_CLIENT_MARKER_PHASE48 =
  "phase48-legal-reliability-lawyer-workbench-client" as const;

type Props = {
  caseId: string;
  caseTitle: string;
  caseStatusLabel: string;
  initialPanel?: LegalReliabilityLawyerWorkbenchPanelId;
  readOnly: boolean;
};

type JudgmentPreview = {
  id: string;
  title: string;
  court: string;
  caseNumber: string;
  judgmentDate: string;
  keyHolding: string;
  relevantParagraph: string;
  similarity: string;
  difference: string;
  applicationRisk: string;
};

const PANELS: { id: LegalReliabilityLawyerWorkbenchPanelId; label: string }[] = [
  { id: "overview", label: "사건 개요" },
  { id: "radar", label: "위험 레이더" },
  { id: "graph", label: "주장-증거-판결문 Graph" },
  { id: "judgment", label: "판결문 기반 검토" },
  { id: "evidence", label: "증거 무결성" },
  { id: "court-ready", label: "Court-ready Pack" },
  { id: "explainability", label: "Explainability Trace" },
  { id: "neutral", label: "Neutral Review Pack" },
];

const SAMPLE_JUDGMENT: JudgmentPreview = {
  id: "judgment-sample-001",
  title: "대법원 2023다12345 — 대금 지급의무",
  court: "대법원",
  caseNumber: "2023다12345",
  judgmentDate: "2023-05-12",
  keyHolding: "계약상 대금 지급의무는 이행기 도래와 이행 제공이 전제된다.",
  relevantParagraph: "【판시사항】 … 계약 당사자는 약정한 대금을 지급할 의무를 부담한다.",
  similarity: "계약상 대금 청구·미지급 쟁점 구조가 유사",
  difference: "일부 변제·상계 항변 사실관계 상이",
  applicationRisk: "변제 성격(원금/이자/별도 정산) 입증 필요",
};

const SAMPLE_GRAPH_GAP_ID = "graph-gap-sample-001";

const SAMPLE_RADAR_SIGNAL_ID = "radar-signal-sample-001";

const SAMPLE_RADAR = {
  severity: "HIGH" as const,
  weakness: "의뢰인 진술과 입금내역 불일치",
  opponentAttack: "상대방은 일부 변제 사실을 근거로 신빙성을 공격할 수 있음",
  response: "입금 성격을 원금 변제/별도 정산으로 구분 필요",
  evidenceCount: 3,
  judgmentCount: 2,
};

const SAMPLE_CLAIM = {
  title: "계약상 대금 미지급",
  evidence: ["계약서 제5조", "세금계산서", "입금내역"],
  judgments: ["대법원 판결 A", "서울고법 판결 B"],
  weakness: "일부 입금내역 존재",
  opponentAttack: "변제 항변 가능",
  reviewStatus: "AI 후보" as const,
};

function panelHref(caseId: string, panel: LegalReliabilityLawyerWorkbenchPanelId) {
  return `/cases/${caseId}/lawyer-workbench?panel=${panel}`;
}

export function LegalReliabilityLawyerWorkbenchClient({
  caseId,
  caseTitle,
  caseStatusLabel,
  initialPanel = "overview",
  readOnly,
}: Readonly<Props>) {
  const [activePanel, setActivePanel] = useState<LegalReliabilityLawyerWorkbenchPanelId>(initialPanel);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerJudgment, setDrawerJudgment] = useState<JudgmentPreview>(SAMPLE_JUDGMENT);
  const [lawyerMemo, setLawyerMemo] = useState("");
  const [supplementCandidate, setSupplementCandidate] = useState<SupplementActionCandidate | null>(null);
  const [supplementDrawerOpen, setSupplementDrawerOpen] = useState(false);
  const [supplementBusy, setSupplementBusy] = useState(false);
  const [supplementError, setSupplementError] = useState<string | null>(null);
  const [evidenceCandidate, setEvidenceCandidate] = useState<EvidenceRequestActionCandidate | null>(null);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [evidenceBusy, setEvidenceBusy] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  const shell = useMemo(() => buildLawyerWorkbenchNavigationShell(), []);
  const radar = useMemo(() => buildLitigationRiskRadarPanel(), []);
  const graph = useMemo(() => buildClaimEvidenceJudgmentGraphWorkspace(), []);
  const drawerSpec = useMemo(() => buildJudgmentDrawerPrecedentViewer(), []);
  const courtReady = useMemo(() => buildCourtReadyPackBuilderUx(), []);

  const openJudgmentDrawer = useCallback((judgment?: JudgmentPreview) => {
    setDrawerJudgment(judgment ?? SAMPLE_JUDGMENT);
    setDrawerOpen(true);
  }, []);

  const createSupplementCandidate = useCallback(async () => {
    setSupplementBusy(true);
    setSupplementError(null);
    try {
      const signal = buildRiskRadarSignalFromWorkbenchSample({
        caseId,
        signalId: SAMPLE_RADAR_SIGNAL_ID,
      });
      const res = await fetch(
        `/api/cases/${caseId}/legal-reliability/action-loop/risk-radar/${SAMPLE_RADAR_SIGNAL_ID}/supplement-candidates`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signal }),
        },
      );
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ candidate: SupplementActionCandidate }>(
        res,
        raw,
        "보완요청 후보 생성에 실패했습니다.",
      );
      setSupplementCandidate(data.candidate);
      setSupplementDrawerOpen(true);
    } catch (error) {
      setSupplementError(error instanceof Error ? error.message : "보완요청 후보 생성 실패");
    } finally {
      setSupplementBusy(false);
    }
  }, [caseId]);

  const submitSupplementDecision = useCallback(
    async (
      decision:
        | "APPROVE_SUPPLEMENT_REQUEST"
        | "EDIT_SUPPLEMENT_REQUEST"
        | "REJECT_SUPPLEMENT_REQUEST"
        | "DEFER_SUPPLEMENT_REQUEST",
    ) => {
      if (!supplementCandidate) return;
      setSupplementBusy(true);
      setSupplementError(null);
      try {
        const res = await fetch(
          `/api/cases/${caseId}/legal-reliability/action-loop/supplement-candidates/${supplementCandidate.id}/decision`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ decision }),
          },
        );
        const raw = await res.json().catch(() => null);
        const data = requireOkData<{ candidate: SupplementActionCandidate }>(
          res,
          raw,
          "변호사 결정 저장에 실패했습니다.",
        );
        setSupplementCandidate(data.candidate);
        if (decision === "REJECT_SUPPLEMENT_REQUEST") {
          setSupplementDrawerOpen(false);
        }
      } catch (error) {
        setSupplementError(error instanceof Error ? error.message : "변호사 결정 저장 실패");
      } finally {
        setSupplementBusy(false);
      }
    },
    [caseId, supplementCandidate],
  );

  const createEvidenceRequestCandidate = useCallback(async () => {
    setEvidenceBusy(true);
    setEvidenceError(null);
    try {
      const gap = buildClaimGraphGapSignalFromWorkbenchSample({
        caseId,
        gapId: SAMPLE_GRAPH_GAP_ID,
      });
      const res = await fetch(
        `/api/cases/${caseId}/legal-reliability/action-loop/claim-graph/${SAMPLE_GRAPH_GAP_ID}/evidence-request-candidates`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gap }),
        },
      );
      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ candidate: EvidenceRequestActionCandidate }>(
        res,
        raw,
        "증거 요청 후보 생성에 실패했습니다.",
      );
      setEvidenceCandidate(data.candidate);
      setEvidenceDrawerOpen(true);
    } catch (error) {
      setEvidenceError(error instanceof Error ? error.message : "증거 요청 후보 생성 실패");
    } finally {
      setEvidenceBusy(false);
    }
  }, [caseId]);

  const submitEvidenceDecision = useCallback(
    async (
      decision:
        | "APPROVE_EVIDENCE_REQUEST"
        | "REJECT_EVIDENCE_REQUEST"
        | "DEFER_EVIDENCE_REQUEST",
    ) => {
      if (!evidenceCandidate) return;
      setEvidenceBusy(true);
      setEvidenceError(null);
      try {
        const res = await fetch(
          `/api/cases/${caseId}/legal-reliability/action-loop/evidence-request-candidates/${evidenceCandidate.id}/decision`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ decision }),
          },
        );
        const raw = await res.json().catch(() => null);
        const data = requireOkData<{ candidate: EvidenceRequestActionCandidate }>(
          res,
          raw,
          "변호사 결정 저장에 실패했습니다.",
        );
        setEvidenceCandidate(data.candidate);
        if (decision === "REJECT_EVIDENCE_REQUEST") {
          setEvidenceDrawerOpen(false);
        }
      } catch (error) {
        setEvidenceError(error instanceof Error ? error.message : "변호사 결정 저장 실패");
      } finally {
        setEvidenceBusy(false);
      }
    },
    [caseId, evidenceCandidate],
  );

  const summaryStats = useMemo(
    () => ({
      reviewProgress: shell.completionRate,
      unreviewedAi: 4,
      highRisk: 2,
      supplementNeeded: 1,
      courtReady: false,
      finalReviewer: "미지정",
    }),
    [shell.completionRate],
  );

  return (
    <div className="space-y-6" data-testid="legal-reliability-lawyer-workbench">
      <section className="rounded-2xl border border-aibeop-line bg-aibeop-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-aibeop-muted">
              Phase 48 · Legal Reliability Lawyer Workbench
            </p>
            <h1 className="mt-1 text-xl font-semibold text-aibeop-text">{caseTitle}</h1>
            <p className="mt-1 text-sm text-aibeop-muted">
              {LEGAL_RELIABILITY_LAWYER_WORKBENCH_RC_WORKBENCH_ROUTE.replace("{caseId}", caseId)}
            </p>
          </div>
          <Link
            href={`/cases/${caseId}`}
            className="text-sm text-aibeop-muted underline"
            data-testid="lawyer-workbench-back-to-case"
          >
            ← 사건 상세
          </Link>
        </div>

        <div
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
          data-testid="lawyer-workbench-summary-bar"
        >
          <Stat label="사건 상태" value={caseStatusLabel} />
          <Stat label="Legal Reliability" value="워크벤치 활성" />
          <Stat label="검토 진행률" value={`${summaryStats.reviewProgress}%`} />
          <Stat label="미검토 AI" value={`${summaryStats.unreviewedAi}건`} />
          <Stat label="HIGH risk" value={`${summaryStats.highRisk}건`} />
          <Stat label="보완자료 필요" value={`${summaryStats.supplementNeeded}건`} />
          <Stat label="Court-ready" value={summaryStats.courtReady ? "가능" : "검토 전"} />
        </div>

        <p className="mt-3 text-xs text-aibeop-muted">
          최종 검토자: {summaryStats.finalReviewer} · LAWYER_REVIEW_REQUIRED · NO_AI_FINAL_STRATEGY
        </p>
      </section>

      <nav
        className="flex flex-wrap gap-2"
        aria-label="Legal Reliability workbench panels"
        data-testid="lawyer-workbench-panel-nav"
      >
        {PANELS.map((panel) => (
          <Link
            key={panel.id}
            href={panelHref(caseId, panel.id)}
            onClick={() => setActivePanel(panel.id)}
            className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${
              activePanel === panel.id
                ? "bg-aibeop-accent text-white ring-aibeop-accent"
                : "bg-white text-aibeop-text ring-aibeop-line hover:bg-aibeop-soft"
            }`}
            data-testid={`lawyer-workbench-panel-${panel.id}`}
          >
            {panel.label}
          </Link>
        ))}
      </nav>

      {activePanel === "overview" && (
        <section className="rounded-2xl border border-aibeop-line bg-white p-5">
          <h2 className="text-lg font-semibold text-aibeop-text">사건 지휘부 — 업무 흐름</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-aibeop-text">
            <li>사건을 본다 → 위험 레이더에서 약점·예상 공격 확인</li>
            <li>주장-증거-판결문 graph에서 연결 검토</li>
            <li>판결문 drawer로 근거 확인 (모든 패널 공통)</li>
            <li>증거 무결성 · Court-ready pack · Explainability · Neutral pack 순 검토</li>
          </ol>
          <p className="mt-4 text-xs text-aibeop-muted">
            NO_UNEXPLAINED_WORKBENCH_ITEM · JUDGMENT_CLICKTHROUGH_REQUIRED · NO_COURT_AUTO_SUBMISSION
          </p>
        </section>
      )}

      {activePanel === "radar" && (
        <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5" data-testid="litigation-risk-radar-panel">
          <h2 className="text-lg font-semibold text-aibeop-text">소송 레이더</h2>
          <div className="mt-3 rounded-xl border border-red-300 bg-white p-4">
            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-900">
              {SAMPLE_RADAR.severity}
            </span>
            <p className="mt-2 font-medium text-aibeop-text">{SAMPLE_RADAR.weakness}</p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">예상 공격:</span> {SAMPLE_RADAR.opponentAttack}
            </p>
            <p className="mt-1 text-sm">
              <span className="font-semibold">대응:</span> {SAMPLE_RADAR.response}
            </p>
            <p className="mt-2 text-xs text-aibeop-muted">
              연결: 증거 {SAMPLE_RADAR.evidenceCount}건 · 판결문 {SAMPLE_RADAR.judgmentCount}건 · 보완요청 가능
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <RiskRadarSupplementActionButton
                disabled={readOnly}
                busy={supplementBusy}
                onCreateCandidate={() => void createSupplementCandidate()}
                onDeferReview={() => setSupplementError(null)}
                onDismiss={() => setSupplementError(null)}
              />
              <ActionButton disabled={readOnly} label="대응 법리 후보" />
              <ActionButton
                disabled={readOnly}
                label="관련 판결문 열기"
                onClick={() => openJudgmentDrawer()}
                testId="radar-open-judgment-drawer"
              />
              <ActionButton disabled={readOnly} label="변호사 메모" />
            </div>
          </div>
          <p className="mt-2 text-xs text-aibeop-muted">
            {radar.items.length} radar items · {radar.litigationRiskRadarPanelReady ? "ready" : "incomplete"}
            {supplementError ? ` · ${supplementError}` : ""}
          </p>
        </section>
      )}

      {activePanel === "graph" && (
        <section className="rounded-2xl border border-aibeop-line bg-white p-5" data-testid="claim-graph-workspace">
          <h2 className="text-lg font-semibold text-aibeop-text">주장-증거-판결문 Graph Workspace</h2>
          <article className="mt-4 rounded-xl border border-aibeop-line p-4">
            <h3 className="font-semibold text-aibeop-text">【주장 카드】 {SAMPLE_CLAIM.title}</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <ListBlock title="연결 증거" items={SAMPLE_CLAIM.evidence} />
              <ListBlock
                title="연결 판결문"
                items={SAMPLE_CLAIM.judgments}
                onItemClick={() => openJudgmentDrawer()}
              />
            </div>
            <p className="mt-3 text-sm text-amber-800">
              <span className="font-semibold">약점:</span> {SAMPLE_CLAIM.weakness}
            </p>
            <p className="mt-1 text-sm text-red-800">
              <span className="font-semibold">상대방 공격:</span> {SAMPLE_CLAIM.opponentAttack}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">검토 상태:</span> {SAMPLE_CLAIM.reviewStatus} / 변호사 확정·수정·제외
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <GraphGapEvidenceRequestActionButton
                disabled={readOnly}
                busy={evidenceBusy}
                onCreateCandidate={() => void createEvidenceRequestCandidate()}
              />
              <ActionButton disabled={readOnly} label="확정" />
              <ActionButton disabled={readOnly} label="수정" />
              <ActionButton disabled={readOnly} label="제외" />
            </div>
          </article>
          <p className="mt-2 text-xs text-aibeop-muted">
            NO_CLIENT_VISIBLE_STRATEGY_GRAPH · NO_UNVERIFIED_EVIDENCE_LABELING · {graph.items.length} graph workspace items
            {evidenceError ? ` · ${evidenceError}` : ""}
          </p>
        </section>
      )}

      {(activePanel === "judgment" || activePanel === "evidence" || activePanel === "explainability") && (
        <section className="rounded-2xl border border-aibeop-line bg-white p-5">
          <h2 className="text-lg font-semibold text-aibeop-text">
            {PANELS.find((p) => p.id === activePanel)?.label}
          </h2>
          <p className="mt-2 text-sm text-aibeop-muted">
            Phase 40~45 Legal Reliability workspace — 판결문·증거·설명가능성 패널은 Judgment Drawer와 연결됩니다.
          </p>
          <div className="mt-4">
            <ActionButton
              disabled={readOnly}
              label="판결문 Drawer 열기"
              onClick={() => openJudgmentDrawer()}
              testId="panel-open-judgment-drawer"
            />
          </div>
        </section>
      )}

      {activePanel === "court-ready" && (
        <section className="rounded-2xl border border-aibeop-line bg-white p-5" data-testid="court-ready-pack-builder">
          <h2 className="text-lg font-semibold text-aibeop-text">Court-ready Pack Builder</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {courtReady.items.slice(0, 6).map((item) => (
              <li key={item.itemId} className="flex items-center justify-between rounded-lg border border-aibeop-line px-3 py-2">
                <span>{item.label}</span>
                <span className="text-xs text-aibeop-muted">검토 전</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-aibeop-muted">
            NO_COURT_AUTO_SUBMISSION · 변호사 검토 전 court-ready 표시 금지 · 내부 전략 graph 기본 제외
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton disabled={readOnly} label="섹션별 검토 완료" />
            <ActionButton disabled={readOnly} label="중립 pack 생성" />
            <ActionButton disabled={readOnly} label="PDF/DOCX export 후보" />
          </div>
        </section>
      )}

      {activePanel === "neutral" && (
        <section className="rounded-2xl border border-aibeop-line bg-white p-5">
          <h2 className="text-lg font-semibold text-aibeop-text">Neutral Review Pack</h2>
          <p className="mt-2 text-sm text-aibeop-muted">
            Phase 46 Neutral Litigation Review Pack — 변호사 통제 하 export · NO_DIRECT_COURT_ACCESS
          </p>
        </section>
      )}

      {drawerOpen && (
        <aside
          className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-aibeop-line bg-white p-6 shadow-2xl"
          data-testid="judgment-drawer"
          role="dialog"
          aria-label="Judgment drawer"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-aibeop-muted">Phase 48-D · Judgment Drawer</p>
              <h2 className="mt-1 text-lg font-semibold text-aibeop-text">{drawerJudgment.title}</h2>
            </div>
            <button
              type="button"
              className="text-sm text-aibeop-muted underline"
              onClick={() => setDrawerOpen(false)}
              data-testid="judgment-drawer-close"
            >
              닫기
            </button>
          </div>
          <dl className="mt-4 grid gap-2 text-sm">
            <Row label="법원" value={drawerJudgment.court} />
            <Row label="사건번호" value={drawerJudgment.caseNumber} />
            <Row label="선고일" value={drawerJudgment.judgmentDate} />
            <Row label="핵심 법리" value={drawerJudgment.keyHolding} />
            <Row label="관련 문단" value={drawerJudgment.relevantParagraph} />
            <Row label="유사한 점" value={drawerJudgment.similarity} />
            <Row label="다른 점" value={drawerJudgment.difference} />
            <Row label="적용 위험" value={drawerJudgment.applicationRisk} />
          </dl>
          <label className="mt-4 block text-sm font-semibold text-aibeop-text" htmlFor="judgment-drawer-memo">
            변호사 메모
          </label>
          <textarea
            id="judgment-drawer-memo"
            className="mt-1 w-full rounded-lg border border-aibeop-line p-2 text-sm"
            rows={3}
            value={lawyerMemo}
            onChange={(e) => setLawyerMemo(e.target.value)}
            disabled={readOnly}
          />
          <p className="mt-3 text-xs text-aibeop-muted">
            JUDGMENT_CLICKTHROUGH_REQUIRED · {drawerSpec.items.length} drawer items · CROSS_PANEL_CLICKTHROUGH
          </p>
        </aside>
      )}

      <RiskRadarSupplementCandidateDrawer
        open={supplementDrawerOpen}
        candidate={supplementCandidate}
        busy={supplementBusy}
        readOnly={readOnly}
        onClose={() => setSupplementDrawerOpen(false)}
        onApprove={() => void submitSupplementDecision("APPROVE_SUPPLEMENT_REQUEST")}
        onEditApprove={() => void submitSupplementDecision("EDIT_SUPPLEMENT_REQUEST")}
        onReject={() => void submitSupplementDecision("REJECT_SUPPLEMENT_REQUEST")}
        onDefer={() => void submitSupplementDecision("DEFER_SUPPLEMENT_REQUEST")}
      />

      <GraphGapEvidenceRequestCandidateDrawer
        open={evidenceDrawerOpen}
        candidate={evidenceCandidate}
        busy={evidenceBusy}
        readOnly={readOnly}
        onClose={() => setEvidenceDrawerOpen(false)}
        onApprove={() => void submitEvidenceDecision("APPROVE_EVIDENCE_REQUEST")}
        onReject={() => void submitEvidenceDecision("REJECT_EVIDENCE_REQUEST")}
        onDefer={() => void submitEvidenceDecision("DEFER_EVIDENCE_REQUEST")}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-aibeop-line bg-aibeop-soft/40 px-3 py-2">
      <p className="text-xs text-aibeop-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-aibeop-text">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-aibeop-muted">{label}</dt>
      <dd className="mt-0.5 text-aibeop-text">{value}</dd>
    </div>
  );
}

function ListBlock({
  title,
  items,
  onItemClick,
}: {
  title: string;
  items: string[];
  onItemClick?: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-aibeop-muted">{title}</p>
      <ul className="mt-1 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item}>
            {onItemClick ? (
              <button type="button" className="text-left underline" onClick={onItemClick}>
                {item}
              </button>
            ) : (
              item
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActionButton({
  label,
  disabled,
  onClick,
  testId,
}: {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
      className="rounded-lg bg-aibeop-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
    >
      {label}
    </button>
  );
}
