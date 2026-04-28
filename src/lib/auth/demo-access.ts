import type { UserRole } from "@prisma/client";

export type DemoAccessConfig = {
  loginId: string;
  password: string;
  expectedRole: UserRole | null;
};

const DEMO_ACCESS_ROLES: ReadonlySet<UserRole> = new Set<UserRole>([
  "USER",
  "LAWYER",
  "STAFF",
  "ADMIN",
  "SUPER_ADMIN",
]);

function normalizeLoginId(value: string) {
  return value.trim().toLowerCase();
}

function parseDemoRole(value?: string): UserRole | null {
  if (!value) return null;

  const normalized = value.trim().toUpperCase() as UserRole;
  return DEMO_ACCESS_ROLES.has(normalized) ? normalized : null;
}

export function isDemoAccessEnabled() {
  return process.env.DEMO_ACCESS_ENABLED === "true";
}

export function getDemoAccessConfig(): DemoAccessConfig | null {
  if (!isDemoAccessEnabled()) return null;

  const loginId = process.env.DEMO_ACCESS_ID?.trim();
  const password = process.env.DEMO_ACCESS_PASSWORD;

  if (!loginId || !password) {
    return null;
  }

  const rawRole = process.env.DEMO_ACCESS_ROLE;
  if (rawRole && !parseDemoRole(rawRole)) {
    return null;
  }

  return {
    loginId: normalizeLoginId(loginId),
    password,
    expectedRole: parseDemoRole(rawRole),
  };
}

export function validateDemoAccessCredentials(input: {
  loginId: string;
  password: string;
}): DemoAccessConfig | null {
  const config = getDemoAccessConfig();
  if (!config) return null;

  if (normalizeLoginId(input.loginId) !== config.loginId) {
    return null;
  }

  if (input.password !== config.password) {
    return null;
  }

  return config;
}