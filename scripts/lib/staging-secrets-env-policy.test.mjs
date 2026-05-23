import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertStagingHttpsOrigin,
  getOAuthCallbackUrls,
  validateAuthCookieSecureForStaging,
  validateOAuthPairs,
  validateStagingSecretsEnv,
} from "./staging-secrets-env-policy.mjs";

describe("staging-secrets-env-policy", () => {
  it("requires OAuth id/secret pairs", () => {
    const r = validateOAuthPairs({
      GOOGLE_CLIENT_ID: "id-only",
      GOOGLE_CLIENT_SECRET: "",
    });
    assert.equal(r.errors.length, 1);
    assert.deepEqual(r.activeProviders, []);
  });

  it("flags non-production NODE_ENV on staging profile", () => {
    const r = validateStagingSecretsEnv(
      {
        DATABASE_URL: "postgresql://x",
        JWT_SECRET: "x".repeat(32),
        CRON_SECRET: "y".repeat(32),
        APP_BASE_URL: "https://staging.example.com",
        NEXT_PUBLIC_APP_VERSION: "1",
        NEXT_PUBLIC_APP_ENV: "staging",
        NODE_ENV: "development",
        OPENAI_API_KEY: "k",
        OPENAI_DOCUMENT_GENERATE_MODEL: "m",
        OPENAI_PARAGRAPH_REWRITE_MODEL: "m",
        OPENAI_CASE_SUMMARY_MODEL: "m",
        CASE_SUMMARY_AI_MODE: "RULE_BASED",
        AI_GOVERNANCE_AI_ENABLED: "true",
        AI_GOVERNANCE_TENANT_ID: "default",
        AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET: "1000",
        AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE: "10",
      },
      { relaxed: false, requireAiCore: true },
    );
    assert.equal(
      r.errors.some((e) => e.includes("NODE_ENV")),
      true,
    );
  });

  it("builds OAuth callback URLs from APP_BASE_URL", () => {
    const urls = getOAuthCallbackUrls("https://staging.example.com");
    assert.equal(
      urls[0],
      "https://staging.example.com/api/auth/oauth/google/callback",
    );
  });

  it("rejects AUTH_COOKIE_SECURE=false on https staging", () => {
    const errors = validateAuthCookieSecureForStaging({
      APP_BASE_URL: "https://staging.example.com",
      AUTH_COOKIE_SECURE: "false",
    });
    assert.equal(errors.length, 1);
  });

  it("rejects placeholder JWT on strict staging profile", () => {
    const r = validateStagingSecretsEnv(
      {
        DATABASE_URL: "postgresql://x",
        JWT_SECRET: "replace_me_with_long_random_secret",
        CRON_SECRET: "y".repeat(32),
        APP_BASE_URL: "https://staging.example.com",
        NEXT_PUBLIC_APP_VERSION: "1",
        NEXT_PUBLIC_APP_ENV: "staging",
        NODE_ENV: "production",
        OPENAI_API_KEY: "k",
        OPENAI_DOCUMENT_GENERATE_MODEL: "m",
        OPENAI_PARAGRAPH_REWRITE_MODEL: "m",
        OPENAI_CASE_SUMMARY_MODEL: "m",
        CASE_SUMMARY_AI_MODE: "RULE_BASED",
        AI_GOVERNANCE_AI_ENABLED: "true",
        AI_GOVERNANCE_TENANT_ID: "default",
        AI_GOVERNANCE_MONTHLY_TOKEN_BUDGET: "1000",
        AI_GOVERNANCE_MAX_LLM_CALLS_PER_CASE: "10",
      },
      { relaxed: false, requireAiCore: true },
    );
    assert.equal(
      r.errors.some((e) => e.includes("JWT_SECRET looks like a placeholder")),
      true,
    );
  });
});
