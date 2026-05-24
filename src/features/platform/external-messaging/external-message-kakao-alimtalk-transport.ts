/**
 * Product Phase 20-C — Injectable Kakao Alimtalk transport (BSP HTTP · test doubles).
 */
import type { KakaoAlimtalkConfig } from "./external-message-kakao-config";

export const REAL_MESSAGING_KAKAO_ALIMTALK_TRANSPORT_MARKER_PHASE20C =
  "phase20c-real-messaging-kakao-alimtalk-transport" as const;

export type KakaoAlimtalkTransportSendInput = {
  phone: string;
  templateCode: string;
  variables: Record<string, string>;
};

export type KakaoAlimtalkTransportSendResult = {
  messageId: string;
  statusCode?: string;
  rawResponse?: unknown;
};

export interface ExternalMessageKakaoAlimtalkTransport {
  send(input: KakaoAlimtalkTransportSendInput): Promise<KakaoAlimtalkTransportSendResult>;
}

export function createMockKakaoAlimtalkTransport(
  result: KakaoAlimtalkTransportSendResult = {
    messageId: "kakao-mock-msg-1",
    statusCode: "200",
    rawResponse: {
      messageId: "kakao-mock-msg-1",
      status: "success",
      to: "01012345678",
    },
  },
): ExternalMessageKakaoAlimtalkTransport {
  return {
    async send() {
      return result;
    },
  };
}

export function createKakaoAlimtalkTransportFromConfig(
  config: KakaoAlimtalkConfig,
): ExternalMessageKakaoAlimtalkTransport {
  return {
    async send(input: KakaoAlimtalkTransportSendInput): Promise<KakaoAlimtalkTransportSendResult> {
      const response = await fetch(config.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderKey: config.senderKey,
          plusFriendId: config.plusFriendId,
          templateCode: input.templateCode,
          recipient: { phone: input.phone },
          variables: input.variables,
        }),
      });

      const rawResponse = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      };

      if (!response.ok) {
        throw new Error(`Kakao Alimtalk rejected request (${response.status})`);
      }

      let messageId = response.headers.get("x-message-id") ?? undefined;
      try {
        const body = (await response.json()) as { messageId?: string };
        messageId = body.messageId ?? messageId;
      } catch {
        // metadata-only — no raw body persist
      }

      return {
        messageId: messageId ?? "unknown",
        statusCode: String(response.status),
        rawResponse,
      };
    },
  };
}
