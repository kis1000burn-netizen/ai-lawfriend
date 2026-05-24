import { NextResponse } from "next/server";
import { requireRoleApi } from "@/lib/auth/guards";
import { getAibeopchinOperationDashboardData } from "@/lib/operations/aibeopchin-operation-dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireRoleApi("ADMIN");
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const data = getAibeopchinOperationDashboardData();

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "AI법친 운영 모니터링 대시보드 데이터를 불러오지 못했습니다.",
      },
      { status: 500 },
    );
  }
}
