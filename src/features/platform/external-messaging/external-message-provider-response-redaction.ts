/**
 * Product Phase 20-B — Provider raw response redaction (no PII · no body).
 */
export const REAL_MESSAGING_PROVIDER_RESPONSE_REDACTION_MARKER_PHASE20B =
  "phase20b-real-messaging-provider-response-redaction" as const;

const FORBIDDEN_RESPONSE_KEYS = new Set([
  "body",
  "html",
  "text",
  "content",
  "recipient",
  "recipients",
  "phone",
  "phones",
  "to",
  "from",
  "email",
  "emails",
  "attachment",
  "attachments",
  "documentbody",
  "legalbody",
  "rawpayload",
  "message",
  "personalizations",
]);

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export function redactProviderRawResponse(
  raw: unknown,
  depth = 0,
): Record<string, unknown> {
  if (raw === null || raw === undefined) {
    return {};
  }

  if (depth > 4) {
    return { truncated: true };
  }

  if (typeof raw === "string") {
    return { value: maskEmailsInString(raw.slice(0, 500)) };
  }

  if (typeof raw !== "object") {
    return { value: String(raw).slice(0, 120) };
  }

  if (Array.isArray(raw)) {
    return {
      items: raw.slice(0, 5).map((item) => redactProviderRawResponse(item, depth + 1)),
    };
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_RESPONSE_KEYS.has(lower)) {
      continue;
    }
    if (typeof value === "string") {
      out[key] = maskEmailsInString(value.slice(0, 300));
      continue;
    }
    if (typeof value === "object" && value !== null) {
      out[key] = redactProviderRawResponse(value, depth + 1);
      continue;
    }
    out[key] = value;
  }
  return out;
}

function maskEmailsInString(input: string): string {
  return input.replace(EMAIL_PATTERN, (email) => {
    const [local, domain] = email.split("@");
    if (!domain) return "***";
    const maskedLocal = local.length <= 1 ? "*" : `${local[0]}***`;
    return `${maskedLocal}@${domain}`;
  });
}
