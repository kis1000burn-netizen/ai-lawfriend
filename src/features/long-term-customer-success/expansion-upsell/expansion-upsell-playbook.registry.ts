/**
 * Product Phase 38-D — Expansion / upsell playbook SSOT.
 */
import type { ExpansionUpsellPlaybookResult } from "./expansion-upsell-playbook.schema";

export const EXPANSION_UPSELL_REGISTRY_MARKER_PHASE38D =
  "phase38d-expansion-upsell-registry" as const;

type ExpansionUpsellPlay = Omit<ExpansionUpsellPlaybookResult["plays"][number], "defined">;

export const EXPANSION_UPSELL_PLAYS: ExpansionUpsellPlay[] = [
  { playId: "EXPANSION_SIGNALS", label: "Expansion signal checklist", required: true },
  { playId: "UPSELL_QUALIFICATION", label: "Upsell qualification criteria", required: true },
  { playId: "ADDON_PACKAGE_MAP", label: "Add-on package mapping", required: true },
  { playId: "EXPANSION_PROPOSAL_TEMPLATE", label: "Expansion proposal template", required: true },
  { playId: "EXPANSION_HANDOFF", label: "Expansion sales handoff", required: true },
];
