import { Suspense } from "react";
import { getEnabledOAuthProviders } from "@/lib/auth/oauth";
import LoginPageClient from "./login-page-client";

export default async function LoginPage() {
  const oauthProviders = getEnabledOAuthProviders();

  return (
    <Suspense
      fallback={
        <div className="px-6 py-16 text-center text-sm text-aibeop-muted">
          로딩...
        </div>
      }
    >
      <LoginPageClient oauthProviders={oauthProviders} />
    </Suspense>
  );
}
