/**
 * Product Phase 20-B — EMAIL_PROVIDER env branching (DRY_RUN · SMTP · SENDGRID).
 */
import type { ExternalMessageProvider } from "./external-message-adapter.schema";

export const REAL_MESSAGING_EMAIL_CONFIG_MARKER_PHASE20B =
  "phase20b-real-messaging-email-config" as const;

export const EMAIL_PROVIDER_ENV_KEY = "EMAIL_PROVIDER" as const;

export const RESOLVED_EMAIL_PROVIDERS = ["DRY_RUN", "SMTP", "SENDGRID"] as const;

export type ResolvedEmailProvider = (typeof RESOLVED_EMAIL_PROVIDERS)[number];

export type SmtpEmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  fromAddress: string;
  fromName: string;
};

export type SendGridEmailConfig = {
  apiKey: string;
  fromAddress: string;
  fromName: string;
};

export function resolveEmailProvider(
  env: NodeJS.ProcessEnv = process.env,
): ResolvedEmailProvider {
  const raw = (env[EMAIL_PROVIDER_ENV_KEY] ?? "DRY_RUN").trim().toUpperCase();
  if (raw === "SMTP" || raw === "SENDGRID" || raw === "DRY_RUN") {
    return raw;
  }
  return "DRY_RUN";
}

export function emailProviderForResolved(
  resolved: ResolvedEmailProvider,
): ExternalMessageProvider {
  if (resolved === "SMTP") return "SMTP";
  if (resolved === "SENDGRID") return "SENDGRID";
  return "DRY_RUN";
}

export function readSmtpEmailConfig(
  env: NodeJS.ProcessEnv = process.env,
): SmtpEmailConfig | null {
  const host = env.SMTP_HOST?.trim();
  const fromAddress = env.SMTP_FROM_ADDRESS?.trim();
  if (!host || !fromAddress) {
    return null;
  }

  const portRaw = env.SMTP_PORT?.trim();
  const port = portRaw ? Number.parseInt(portRaw, 10) : 587;
  if (!Number.isFinite(port) || port <= 0) {
    return null;
  }

  return {
    host,
    port,
    secure: env.SMTP_SECURE?.trim() === "true",
    user: env.SMTP_USER?.trim() || undefined,
    pass: env.SMTP_PASS?.trim() || undefined,
    fromAddress,
    fromName: env.SMTP_FROM_NAME?.trim() || "AI법친",
  };
}

export function readSendGridEmailConfig(
  env: NodeJS.ProcessEnv = process.env,
): SendGridEmailConfig | null {
  const apiKey = env.SENDGRID_API_KEY?.trim();
  const fromAddress = env.SENDGRID_FROM_ADDRESS?.trim();
  if (!apiKey || !fromAddress) {
    return null;
  }

  return {
    apiKey,
    fromAddress,
    fromName: env.SENDGRID_FROM_NAME?.trim() || "AI법친",
  };
}
