import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { UnauthorizedError } from "@/lib/errors";
import {
  LegalDocumentDeliveryBodySchema,
  deliverLegalDocumentPost,
} from "@/lib/legal-documents/deliver-legal-document-post";

/**
 * 승인된 법률 문서 전달 처리 — 사건 상태는 `DELIVER_DOCUMENT` 전이로 맞춘다.
 * (별도 `Delivery` 테이블 없음: 타임라인·메타로 기록)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ legalDocumentId: string }> },
) {
  try {
    const { legalDocumentId } = await params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError();
    }

    const body = LegalDocumentDeliveryBodySchema.parse(await req.json());
    const result = await deliverLegalDocumentPost(legalDocumentId, body, sessionUser);

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
