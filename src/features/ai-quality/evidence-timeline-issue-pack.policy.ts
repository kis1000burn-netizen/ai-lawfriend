/**
 * Product Phase 23-D — Evidence / Timeline / Issue pack policy SSOT.
 */
import type {
  EvidenceTimelineIssuePack,
  EvidenceTimelineIssuePackIssueItem,
} from "./evidence-timeline-issue-pack.schema";
import { EVIDENCE_TIMELINE_ISSUE_PACK_VERSION } from "./evidence-timeline-issue-pack.schema";

export const EVIDENCE_TIMELINE_ISSUE_PACK_POLICY_MARKER_PHASE23D =
  "phase23d-evidence-timeline-issue-pack-policy" as const;

export const EVIDENCE_TIMELINE_ISSUE_PACK_DISCLAIMER =
  "Evidence/Timeline/Issue Pack은 변호사 검토용 내부 정리 자료입니다. 증거·타임라인·쟁점 연결은 AI/운영자 추정이며 최종 판단은 변호사 검토가 필요합니다." as const;

export function deriveIssueItemsFromCandidates(
  candidates: string[],
): EvidenceTimelineIssuePackIssueItem[] {
  return candidates.map((label, index) => ({
    issueId: `issue-${index + 1}`,
    label: label.trim(),
    status: "OPEN" as const,
    linkedEvidenceIds: [],
  }));
}

export function buildEvidenceTimelineCrossLinks(
  pack: Pick<EvidenceTimelineIssuePack, "evidenceItems" | "issueItems" | "timelineItems">,
) {
  const crossLinks: EvidenceTimelineIssuePack["crossLinks"] = [];

  for (const issue of pack.issueItems) {
    for (const evidenceId of issue.linkedEvidenceIds) {
      crossLinks.push({ issueId: issue.issueId, evidenceId });
    }
  }

  for (const evidence of pack.evidenceItems) {
    for (const issueId of evidence.mappedIssueIds) {
      if (
        !crossLinks.some(
          (link) => link.issueId === issueId && link.evidenceId === evidence.evidenceId,
        )
      ) {
        crossLinks.push({ issueId, evidenceId: evidence.evidenceId });
      }
    }
  }

  void pack.timelineItems;
  return crossLinks;
}

export function assembleEvidenceTimelineIssuePack(input: {
  caseId: string;
  evidenceItems: EvidenceTimelineIssuePack["evidenceItems"];
  timelineItems: EvidenceTimelineIssuePack["timelineItems"];
  issueCandidates: string[];
  generatedAt?: string;
}): EvidenceTimelineIssuePack {
  const issueItems = deriveIssueItemsFromCandidates(input.issueCandidates);
  const evidenceItems = input.evidenceItems.map((item, index) => ({
    ...item,
    mappedIssueIds:
      item.mappedIssueIds.length > 0
        ? item.mappedIssueIds
        : issueItems[index]?.issueId
          ? [issueItems[index]!.issueId]
          : [],
  }));

  const partial = {
    evidenceItems,
    timelineItems: input.timelineItems,
    issueItems,
  };

  return {
    packVersion: EVIDENCE_TIMELINE_ISSUE_PACK_VERSION,
    caseId: input.caseId,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    ...partial,
    crossLinks: buildEvidenceTimelineCrossLinks(partial),
    disclaimer: EVIDENCE_TIMELINE_ISSUE_PACK_DISCLAIMER,
  };
}
