/**
 * Phase 18-D — In-process provider circuit state store.
 */
import type { AiCircuitState, AiFailureReasonClass, AiProviderId } from "./ai-fallback-circuit-breaker.schema";
import { isCircuitCountableFailure } from "./ai-fallback-circuit-breaker.policy";

export const RELIABILITY_AI_CIRCUIT_STATE_STORE_MARKER_PHASE18D =
  "phase18d-ai-circuit-state-store" as const;

export type AiCircuitConfig = {
  failureThreshold: number;
  openDurationMs: number;
};

type CircuitEntry = {
  state: AiCircuitState;
  consecutiveFailures: number;
  openedAt: number | null;
  lastFailureAt: number | null;
};

const DEFAULT_CONFIG: AiCircuitConfig = {
  failureThreshold: 5,
  openDurationMs: 60_000,
};

const circuits = new Map<AiProviderId, CircuitEntry>();

function getOrCreateEntry(providerId: AiProviderId): CircuitEntry {
  const existing = circuits.get(providerId);
  if (existing) {
    return existing;
  }
  const created: CircuitEntry = {
    state: "CLOSED",
    consecutiveFailures: 0,
    openedAt: null,
    lastFailureAt: null,
  };
  circuits.set(providerId, created);
  return created;
}

function maybeTransitionFromOpen(entry: CircuitEntry, now: number, config: AiCircuitConfig) {
  if (entry.state !== "OPEN" || entry.openedAt == null) {
    return;
  }
  if (now - entry.openedAt >= config.openDurationMs) {
    entry.state = "HALF_OPEN";
  }
}

export function getAiCircuitSnapshot(
  providerId: AiProviderId,
  config: AiCircuitConfig = DEFAULT_CONFIG,
): CircuitEntry & { providerId: AiProviderId } {
  const entry = getOrCreateEntry(providerId);
  maybeTransitionFromOpen(entry, Date.now(), config);
  return { providerId, ...entry };
}

export function assertAiCircuitAllowsInvoke(
  providerId: AiProviderId,
  config: AiCircuitConfig = DEFAULT_CONFIG,
): { allowed: true; circuitState: AiCircuitState } | { allowed: false; circuitState: "OPEN"; reason: string } {
  const snapshot = getAiCircuitSnapshot(providerId, config);
  if (snapshot.state === "OPEN") {
    return {
      allowed: false,
      circuitState: "OPEN",
      reason: "Provider circuit is open — LLM invoke temporarily blocked.",
    };
  }
  return { allowed: true, circuitState: snapshot.state };
}

export function recordAiProviderSuccess(providerId: AiProviderId): AiCircuitState {
  const entry = getOrCreateEntry(providerId);
  entry.state = "CLOSED";
  entry.consecutiveFailures = 0;
  entry.openedAt = null;
  entry.lastFailureAt = null;
  return entry.state;
}

export function recordAiProviderFailure(
  providerId: AiProviderId,
  failureClass: AiFailureReasonClass,
  config: AiCircuitConfig = DEFAULT_CONFIG,
): { circuitState: AiCircuitState; opened: boolean } {
  const entry = getOrCreateEntry(providerId);
  const now = Date.now();
  entry.lastFailureAt = now;
  maybeTransitionFromOpen(entry, now, config);

  if (!isCircuitCountableFailure(failureClass)) {
    return { circuitState: entry.state, opened: false };
  }

  if (entry.state === "HALF_OPEN") {
    entry.state = "OPEN";
    entry.openedAt = now;
    entry.consecutiveFailures += 1;
    return { circuitState: entry.state, opened: true };
  }

  entry.consecutiveFailures += 1;
  if (entry.consecutiveFailures >= config.failureThreshold) {
    entry.state = "OPEN";
    entry.openedAt = now;
    return { circuitState: entry.state, opened: true };
  }

  return { circuitState: entry.state, opened: false };
}

export function resetAiCircuitStateForTests(providerId?: AiProviderId) {
  if (providerId) {
    circuits.delete(providerId);
    return;
  }
  circuits.clear();
}

export function __getAiCircuitConfigForTests(): AiCircuitConfig {
  return { ...DEFAULT_CONFIG };
}
