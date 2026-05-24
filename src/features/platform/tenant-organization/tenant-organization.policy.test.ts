import { describe, expect, it } from "vitest";
import {
  canManageTenantMembership,
  normalizeTenantSlug,
  resolveTenantScopedCaseTenantId,
  suggestTenantMembershipRoleForPlatformRole,
  TENANT_ORGANIZATION_DEFAULT_SLUG,
} from "./tenant-organization.policy";
import { createTenantInputSchema } from "./tenant-organization.schema";

describe("tenant-organization.policy (Phase 22-A)", () => {
  it("normalizes tenant slug to kebab-case", () => {
    expect(normalizeTenantSlug(" AI 법친 Demo ")).toBe("ai-demo");
    expect(TENANT_ORGANIZATION_DEFAULT_SLUG).toBe("aibeopchin-demo");
  });

  it("maps platform roles to tenant membership roles", () => {
    expect(suggestTenantMembershipRoleForPlatformRole("LAWYER")).toBe("LAWYER");
    expect(suggestTenantMembershipRoleForPlatformRole("USER")).toBeNull();
  });

  it("resolves case tenant from explicit or owner primary tenant", () => {
    expect(
      resolveTenantScopedCaseTenantId({
        explicitTenantId: "t1",
        ownerPrimaryTenantId: "t2",
      }),
    ).toBe("t1");
    expect(
      resolveTenantScopedCaseTenantId({
        ownerPrimaryTenantId: "t2",
      }),
    ).toBe("t2");
  });

  it("allows owner/admin to manage memberships", () => {
    expect(canManageTenantMembership("OWNER")).toBe(true);
    expect(canManageTenantMembership("LAWYER")).toBe(false);
  });

  it("validates create tenant input schema", () => {
    const parsed = createTenantInputSchema.parse({
      slug: "demo-firm",
      legalName: "데모 법무법인",
    });
    expect(parsed.slug).toBe("demo-firm");
  });
});
