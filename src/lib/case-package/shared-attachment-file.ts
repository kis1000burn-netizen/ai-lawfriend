import { readCaseAttachmentFromDisk } from "@/features/case-attachments/case-attachment.storage";

function buildContentDisposition(filename: string) {
  const encoded = encodeURIComponent(filename);
  return `attachment; filename*=UTF-8''${encoded}`;
}

export async function createAttachmentDownloadResponse(input: {
  storagePath: string;
  originalName: string;
  mimeType: string;
}) {
  const file = await readCaseAttachmentFromDisk(input.storagePath);
  const fileBody = new ArrayBuffer(file.buffer.byteLength);
  new Uint8Array(fileBody).set(file.buffer);

  return new Response(fileBody, {
    status: 200,
    headers: {
      "Content-Type": input.mimeType || "application/octet-stream",
      "Content-Length": String(file.buffer.byteLength),
      "Content-Disposition": buildContentDisposition(input.originalName),
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}