import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/get-session-user";
import { isAdminRole } from "@/lib/auth/roles";

/**
 * 플랫폼 관리자(ADMIN·SUPER_ADMIN) 또는 운영 STAFF — 관리 페이지(RSC).
 * 미들웨어 `/admin` 화이트리스트 및 `requireStaffOrPlatformAdminApi` 와 같은 축이다.
 */
export async function requireStaffOrPlatformAdminPage(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STAFF" || isAdminRole(user.role)) return user;
  redirect("/access-denied");
}
