import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const prismaMocks = vi.hoisted(() => {
  const authAccountFindUnique = vi.fn();
  const authAccountCreate = vi.fn();
  const userFindUnique = vi.fn();
  const userCreate = vi.fn();
  const lawyerProfileFindUnique = vi.fn();
  return {
    authAccountFindUnique,
    authAccountCreate,
    userFindUnique,
    userCreate,
    lawyerProfileFindUnique,
  };
});

const oauthMocks = vi.hoisted(() => ({
  getOAuthProvider: vi.fn(),
  getOAuthFlowCookieNames: vi.fn(),
  exchangeOAuthCode: vi.fn(),
  fetchOAuthProfile: vi.fn(),
  isOAuthProviderKey: vi.fn(),
  normalizeAuthRedirectPath: vi.fn(),
}));

const loginResponseMocks = vi.hoisted(() => ({
  applyLoginSession: vi.fn(async (response: Response) => response),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    authAccount: {
      findUnique: prismaMocks.authAccountFindUnique,
      create: prismaMocks.authAccountCreate,
    },
    user: {
      findUnique: prismaMocks.userFindUnique,
      create: prismaMocks.userCreate,
    },
    lawyerProfile: {
      findUnique: prismaMocks.lawyerProfileFindUnique,
    },
  },
}));

vi.mock("@/lib/auth/oauth", () => oauthMocks);
vi.mock("@/lib/auth/login-response", () => loginResponseMocks);

import { GET } from "./route";
import {
  exchangeOAuthCode,
  fetchOAuthProfile,
  getOAuthFlowCookieNames,
  getOAuthProvider,
  isOAuthProviderKey,
  normalizeAuthRedirectPath,
} from "@/lib/auth/oauth";
import { applyLoginSession } from "@/lib/auth/login-response";

describe("GET /api/auth/oauth/:provider/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.lawyerProfileFindUnique.mockResolvedValue(null);
    vi.mocked(getOAuthProvider).mockReturnValue({
      key: "google",
      label: "Google",
      provider: "GOOGLE",
      clientId: "client-id",
      clientSecret: "client-secret",
    } as never);
    vi.mocked(getOAuthFlowCookieNames).mockReturnValue({
      state: "aibupchin_oauth_state_google",
      redirect: "aibupchin_oauth_redirect_google",
    });
    vi.mocked(isOAuthProviderKey).mockReturnValue(true);
    vi.mocked(normalizeAuthRedirectPath).mockReturnValue("/dashboard");
  });

  it("links an existing verified Google user and redirects with a session", async () => {
    vi.mocked(exchangeOAuthCode).mockResolvedValue("access-token");
    vi.mocked(fetchOAuthProfile).mockResolvedValue({
      provider: "GOOGLE",
      providerKey: "google",
      providerAccountId: "google-sub-1",
      email: "active@example.com",
      emailVerified: true,
      name: "Active User",
    } as never);

    prismaMocks.authAccountFindUnique.mockResolvedValueOnce(null);
    prismaMocks.userFindUnique.mockResolvedValueOnce({
      id: "user-1",
      email: "active@example.com",
      name: "Active User",
      role: "USER",
      status: "ACTIVE",
    });
    prismaMocks.authAccountCreate.mockResolvedValueOnce({ id: "account-1" });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/auth/oauth/google/callback?code=oauth-code&state=state-1",
        {
          headers: {
            cookie:
              "aibupchin_oauth_state_google=state-1; aibupchin_oauth_redirect_google=/dashboard",
          },
        },
      ),
      {
        params: Promise.resolve({ provider: "google" }),
      },
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
    expect(prismaMocks.lawyerProfileFindUnique).not.toHaveBeenCalled();
    expect(prismaMocks.authAccountCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        provider: "GOOGLE",
        providerAccountId: "google-sub-1",
        email: "active@example.com",
        emailVerified: true,
      },
    });
    expect(applyLoginSession).toHaveBeenCalled();
  });

  it("creates an ACTIVE social user, applies session, and redirects", async () => {
    vi.mocked(exchangeOAuthCode).mockResolvedValue("access-token");
    vi.mocked(fetchOAuthProfile).mockResolvedValue({
      provider: "GOOGLE",
      providerKey: "google",
      providerAccountId: "google-sub-2",
      email: "pending@example.com",
      emailVerified: true,
      name: "Pending User",
    } as never);

    prismaMocks.authAccountFindUnique.mockResolvedValueOnce(null);
    prismaMocks.userFindUnique.mockResolvedValueOnce(null);
    prismaMocks.userCreate.mockResolvedValueOnce({
      id: "user-2",
      email: "pending@example.com",
      name: "Pending User",
      role: "USER",
      status: "ACTIVE",
    });
    prismaMocks.authAccountCreate.mockResolvedValueOnce({ id: "account-2" });

    vi.mocked(normalizeAuthRedirectPath).mockReturnValue("/cases");

    const response = await GET(
      new NextRequest(
        "http://localhost/api/auth/oauth/google/callback?code=oauth-code&state=state-2",
        {
          headers: {
            cookie:
              "aibupchin_oauth_state_google=state-2; aibupchin_oauth_redirect_google=/cases",
          },
        },
      ),
      {
        params: Promise.resolve({ provider: "google" }),
      },
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/cases");
    expect(applyLoginSession).toHaveBeenCalled();
  });

  it("승인된 변호사와 /dashboard 쿠키는 변호사 작업실로 보낸다", async () => {
    vi.mocked(exchangeOAuthCode).mockResolvedValue("access-token");
    vi.mocked(fetchOAuthProfile).mockResolvedValue({
      provider: "GOOGLE",
      providerKey: "google",
      providerAccountId: "google-sub-lawyer",
      email: "lawyer@example.com",
      emailVerified: true,
      name: "Lawyer User",
    } as never);

    prismaMocks.authAccountFindUnique.mockResolvedValueOnce({
      user: {
        id: "lawyer-active",
        email: "lawyer@example.com",
        name: "Lawyer User",
        role: "LAWYER",
        status: "ACTIVE",
      },
    });
    prismaMocks.lawyerProfileFindUnique.mockResolvedValueOnce({
      verificationStatus: "APPROVED",
    });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/auth/oauth/google/callback?code=oauth-code&state=state-lawyer",
        {
          headers: {
            cookie:
              "aibupchin_oauth_state_google=state-lawyer; aibupchin_oauth_redirect_google=/dashboard",
          },
        },
      ),
      {
        params: Promise.resolve({ provider: "google" }),
      },
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/lawyer");
    expect(applyLoginSession).toHaveBeenCalled();
  });
});