import { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api-response";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { parseKakaoWebhookEvents } from "@/features/platform/external-messaging/external-message-webhook.schema";
import { verifyExternalMessageWebhookSignature } from "@/features/platform/external-messaging/external-message-webhook-signature";
import { processExternalMessageWebhookEvents } from "@/features/platform/external-messaging/external-message-webhook.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader =
      req.headers.get("x-webhook-signature") ??
      req.headers.get("x-aibeopchin-webhook-signature");

    const verified = verifyExternalMessageWebhookSignature({
      provider: "kakao",
      rawBody,
      signatureHeader,
    });
    if (!verified) {
      throw new ForbiddenError("Invalid kakao webhook signature.");
    }

    let body: unknown;
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      throw new ValidationError("Invalid kakao webhook JSON.");
    }

    const events = parseKakaoWebhookEvents(body);
    const results = await processExternalMessageWebhookEvents(events);

    return ok({
      processed: results.length,
      results: results.map((row) => ({
        externalMessageLogId: row.externalMessageLogId,
        duplicate: row.duplicate,
        mappedProviderStatus: row.mappedProviderStatus,
        mappedExternalMessageStatus: row.mappedExternalMessageStatus,
        deliveryStatusPrep: row.deliveryStatusPrep,
        redeliveryEligible: row.redeliveryEligible,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
