/**
 * Product Phase 20-B — Injectable email transport (SMTP · test doubles).
 */
import type { SmtpEmailConfig } from "./external-message-email-config";

export const REAL_MESSAGING_EMAIL_TRANSPORT_MARKER_PHASE20B =
  "phase20b-real-messaging-email-transport" as const;

export type EmailTransportSendInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  fromAddress: string;
  fromName: string;
};

export type EmailTransportSendResult = {
  messageId: string;
  accepted: string[];
  responseCode?: string;
  rawResponse?: unknown;
};

export interface ExternalMessageEmailTransport {
  send(input: EmailTransportSendInput): Promise<EmailTransportSendResult>;
}

export function createMockEmailTransport(
  result: EmailTransportSendResult = {
    messageId: "mock-message-id",
    accepted: ["mock@example.com"],
    responseCode: "250",
    rawResponse: { accepted: ["mock@example.com"], messageId: "mock-message-id" },
  },
): ExternalMessageEmailTransport {
  return {
    async send() {
      return result;
    },
  };
}

export async function createSmtpEmailTransportFromConfig(
  config: SmtpEmailConfig,
): Promise<ExternalMessageEmailTransport> {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user && config.pass
        ? { user: config.user, pass: config.pass }
        : undefined,
  });

  return {
    async send(input: EmailTransportSendInput): Promise<EmailTransportSendResult> {
      const info = await transporter.sendMail({
        from: `"${input.fromName}" <${input.fromAddress}>`,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });

      return {
        messageId: info.messageId ?? "unknown",
        accepted: Array.isArray(info.accepted) ? info.accepted.map(String) : [],
        responseCode: info.response?.slice(0, 20),
        rawResponse: {
          messageId: info.messageId,
          response: info.response,
          acceptedCount: Array.isArray(info.accepted) ? info.accepted.length : 0,
        },
      };
    },
  };
}
