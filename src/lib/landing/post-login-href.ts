import type { UserRole } from "@prisma/client";

/** 로그인 사용자 홈에서 역할별 작업 공간으로 보낼 경로 (라우트·권한 로직 변경 없음). */
export function getPostLoginHref(role: UserRole): string {
  if (role === "LAWYER") return "/lawyer";
  if (role === "STAFF" || role === "ADMIN" || role === "SUPER_ADMIN") {
    return "/admin";
  }
  return "/dashboard";
}

/** JWT 페이로드 등 문자열 역할용. 미들웨어(edge)·접근 거절 페이지에서 DB 없이 분기할 때 사용. */
export function getPostLoginHrefForSessionRole(role: string | undefined): string {
  if (role === "LAWYER") return "/lawyer";
  if (role === "STAFF" || role === "ADMIN" || role === "SUPER_ADMIN") return "/admin";
  return "/dashboard";
}

export function getRoleLabelKo(role: UserRole): string {
  switch (role) {
    case "USER":
      return "의뢰인";
    case "LAWYER":
      return "변호사";
    case "STAFF":
      return "운영";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "관리자";
    default:
      return "회원";
  }
}
