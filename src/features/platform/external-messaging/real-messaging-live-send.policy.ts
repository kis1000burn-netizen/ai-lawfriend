/**
 * Product Phase 20-F — Limited live send gates (DRY_RUN default · live send conditional).
 */
import { resolveEmailProvider } from "./external-message-email-config";
import { resolveKakaoProvider } from "./external-message-kakao-config";
import {
  REAL_MESSAGING_LIVE_SEND_DEFAULT_MODE,
  REAL_MESSAGING_LIVE_SEND_OPERATOR_CONFIRMATION_PHRASE,
  isRealMessagingLiveSendEnabled,
  parseRealMessagingLiveSendRecipientAllowlist,
} from "./real-messaging-rc-lock";

export const REAL_MESSAGING_LIVE_SEND_POLICY_MARKER_PHASE20F =
  "phase20f-real-messaging-live-send-policy" as const;

export const REAL_MESSAGING_LIVE_SEND_UNLOCK_GATES = [
  "BUNDLED_RC_VERIFY",
  "DRY_RUN_DEFAULT",
  "PROVIDER_CONFIG_READY",
  "WEBHOOK_SECRET_CONFIGURED",
  "CONSENT_GATE_ACK",
  "OPERATOR_CONFIRMATION",
  "LIMITED_LIVE_SEND_FLAG",
  "RECIPIENT_ALLOWLIST",
] as const;

export type RealMessagingLiveSendUnlockGateId =
  (typeof REAL_MESSAGING_LIVE_SEND_UNLOCK_GATES)[number];

export type RealMessagingLiveSendUnlockGateStatus = {
  id: RealMessagingLiveSendUnlockGateId;
  label: string;
  passed: boolean;
  detail: string;
};

export type RealMessagingLiveSendUnlockEvaluation = {
  mode: typeof REAL_MESSAGING_LIVE_SEND_DEFAULT_MODE | "LIVE_SEND";
  allGatesPassed: boolean;
  dryRunOnly: boolean;
  liveSendAllowed: boolean;
  gates: RealMessagingLiveSendUnlockGateStatus[];
  operatorConfirmationPhrase: string;
};

const GATE_LABELS: Record<RealMessagingLiveSendUnlockGateId, string> = {
  BUNDLED_RC_VERIFY: "20-A~E bundled verify",
  DRY_RUN_DEFAULT: "DRY_RUN 기본 모드",
  PROVIDER_CONFIG_READY: "Email/Kakao provider 설정",
  WEBHOOK_SECRET_CONFIGURED: "Webhook secret 설정",
  CONSENT_GATE_ACK: "Consent gate 정책 확인",
  OPERATOR_CONFIRMATION: "Operator confirmation phrase",
  LIMITED_LIVE_SEND_FLAG: "Limited live send flag",
  RECIPIENT_ALLOWLIST: "Recipient allowlist",
};

export function validateRealMessagingLiveSendOperatorConfirmation(
  phrase: string | undefined,
): boolean {
  if (!phrase?.trim()) return false;
  return phrase.trim() === REAL_MESSAGING_LIVE_SEND_OPERATOR_CONFIRMATION_PHRASE;
}

export function isRealMessagingProviderConfiguredForLiveSend(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const email = resolveEmailProvider(env);
  const kakao = resolveKakaoProvider(env);
  return email !== "DRY_RUN" || kakao !== "DRY_RUN";
}

export function evaluateRealMessagingLiveSendUnlockGates(input: {
  bundledRcVerifyPassed: boolean;
  emailWebhookSecretConfigured: boolean;
  kakaoWebhookSecretConfigured: boolean;
  consentGatePolicyAcknowledged: boolean;
  operatorConfirmationValid: boolean;
  env?: NodeJS.ProcessEnv;
}): RealMessagingLiveSendUnlockEvaluation {
  const env = input.env ?? process.env;
  const liveFlagEnabled = isRealMessagingLiveSendEnabled(env);
  const allowlist = parseRealMessagingLiveSendRecipientAllowlist(env);
  const providerReady = isRealMessagingProviderConfiguredForLiveSend(env);
  const dryRunDefault =
    resolveEmailProvider(env) === "DRY_RUN" && resolveKakaoProvider(env) === "DRY_RUN";

  const gates: RealMessagingLiveSendUnlockGateStatus[] = [
    {
      id: "BUNDLED_RC_VERIFY",
      label: GATE_LABELS.BUNDLED_RC_VERIFY,
      passed: input.bundledRcVerifyPassed,
      detail: input.bundledRcVerifyPassed
        ? "verify:aibeopchin-real-messaging-rc 통과"
        : "RC bundled verify 미완료",
    },
    {
      id: "DRY_RUN_DEFAULT",
      label: GATE_LABELS.DRY_RUN_DEFAULT,
      passed: dryRunDefault || liveFlagEnabled,
      detail: dryRunDefault
        ? "EMAIL/KAKAO provider 기본 DRY_RUN"
        : "live provider 설정 감지 — gate 점검 필요",
    },
    {
      id: "PROVIDER_CONFIG_READY",
      label: GATE_LABELS.PROVIDER_CONFIG_READY,
      passed: !liveFlagEnabled || providerReady,
      detail: providerReady
        ? "SMTP/SENDGRID 또는 ALIMTALK provider 분기"
        : "live flag ON이나 provider 미설정",
    },
    {
      id: "WEBHOOK_SECRET_CONFIGURED",
      label: GATE_LABELS.WEBHOOK_SECRET_CONFIGURED,
      passed:
        !liveFlagEnabled ||
        (input.emailWebhookSecretConfigured && input.kakaoWebhookSecretConfigured),
      detail:
        input.emailWebhookSecretConfigured && input.kakaoWebhookSecretConfigured
          ? "email/kakao webhook secret 설정됨"
          : "live send 시 webhook secret 필수",
    },
    {
      id: "CONSENT_GATE_ACK",
      label: GATE_LABELS.CONSENT_GATE_ACK,
      passed: input.consentGatePolicyAcknowledged,
      detail: input.consentGatePolicyAcknowledged
        ? "consent gate · secure link only 확인"
        : "consent gate 확인 필요",
    },
    {
      id: "OPERATOR_CONFIRMATION",
      label: GATE_LABELS.OPERATOR_CONFIRMATION,
      passed: !liveFlagEnabled || input.operatorConfirmationValid,
      detail: input.operatorConfirmationValid
        ? "confirmation phrase 일치"
        : `phrase: ${REAL_MESSAGING_LIVE_SEND_OPERATOR_CONFIRMATION_PHRASE}`,
    },
    {
      id: "LIMITED_LIVE_SEND_FLAG",
      label: GATE_LABELS.LIMITED_LIVE_SEND_FLAG,
      passed: !liveFlagEnabled || liveFlagEnabled,
      detail: liveFlagEnabled
        ? "EXTERNAL_MESSAGE_LIVE_SEND_ENABLED=true"
        : "live send flag OFF (DRY_RUN only)",
    },
    {
      id: "RECIPIENT_ALLOWLIST",
      label: GATE_LABELS.RECIPIENT_ALLOWLIST,
      passed: !liveFlagEnabled || allowlist.length > 0,
      detail:
        allowlist.length > 0
          ? `allowlist ${allowlist.length} entries`
          : "live send 시 recipient allowlist 필수",
    },
  ];

  const allGatesPassed = gates.every((gate) => gate.passed);
  const liveSendAllowed = liveFlagEnabled && allGatesPassed;

  return {
    mode: liveSendAllowed ? "LIVE_SEND" : REAL_MESSAGING_LIVE_SEND_DEFAULT_MODE,
    allGatesPassed,
    dryRunOnly: !liveSendAllowed,
    liveSendAllowed,
    gates,
    operatorConfirmationPhrase: REAL_MESSAGING_LIVE_SEND_OPERATOR_CONFIRMATION_PHRASE,
  };
}
