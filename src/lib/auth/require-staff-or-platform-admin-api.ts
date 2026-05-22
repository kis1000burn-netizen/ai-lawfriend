import { getSessionUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/roles";

/**
 * 플랫폼 관리자(ADMIN·SUPER_ADMIN) 또는 운영 STAFF.
 * 조회 전용 관리 API(변호사 심사 목록 등)와 STAFF 허용 `/admin` 화면과 정합.
 */
export async function requireStaffOrPlatformAdminApi(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    const err = new Error("로그인이 필요합니다.") as Error & { status?: number };
    err.status = 401;
    throw err;
  }

  if (user.role === "STAFF" || isAdminRole(user.role)) {
    return user;
  }

  const err = new Error("관리자 또는 운영(STAFF) 권한이 필요합니다.") as Error & {
    status?: number;
  };
  err.status = 403;
  throw err;
}
