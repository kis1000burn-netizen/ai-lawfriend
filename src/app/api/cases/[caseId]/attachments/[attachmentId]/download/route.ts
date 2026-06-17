import { toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { deleteAttachmentParamsSchema } from "@/features/case-attachments/case-attachment.validators";
import { getProtectedAttachmentDownloadService } from "@/features/case-attachments/case-attachment.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string; attachmentId: string }>;
};

function buildContentDisposition(filename: string) {
  const encoded = encodeURIComponent(filename);
  return `attachment; filename*=UTF-8''${encoded}`;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, attachmentId } =
      deleteAttachmentParamsSchema.parse(params);

    const result = await getProtectedAttachmentDownloadService(
      currentUser,
      caseId,
      attachmentId
    );

    return new Response(new Blob([result.file.buffer]), {
      status: 200,
      headers: {
        "Content-Type":
          result.attachment.mimeType || "application/octet-stream",
        "Content-Length": String(result.attachment.sizeBytes),
        "Content-Disposition": buildContentDisposition(
          result.attachment.originalName
        ),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
