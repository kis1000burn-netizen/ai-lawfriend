import { makeCompletionDecisionRouteHandler } from "@/features/legal-reliability-action-operations/legal-reliability-action-operation-completion-route-factory";

export const dynamic = "force-dynamic";

export const POST = makeCompletionDecisionRouteHandler({
  decision: "CANCEL",
  reasonField: "cancelReason",
});
