import { AibeopchinHero } from "@/components/branding/aibeopchin-hero";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";
import { HomeFlowSection } from "@/components/home/home-flow-section";
import { HomeRoleEntryCards } from "@/components/home/home-role-entry-cards";
import { HomeTrustStrip } from "@/components/home/home-trust-strip";
import LoggedInStrip from "@/components/landing/logged-in-strip";
import { AibeopchinIntroPopup } from "@/components/marketing/aibeopchin-intro-popup";
import { getSessionUser } from "@/lib/auth/session";
import Link from "next/link";

/**
 * 공개 홈 랜딩(2차). 시네마틱 인트로·Living Logo·역할별 진입.
 * 사건·인터뷰·문서·API·상태 전이·권한 로직은 변경하지 않음.
 */
export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-full flex-col bg-aibeop-bg text-aibeop-text">
      <AibeopchinIntroPopup />
      {user ? <LoggedInStrip user={user} /> : null}
      <header className="sticky top-0 z-30 border-b border-aibeop-line bg-aibeop-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <AibeopchinLogo href="/" />
          <Link
            href={user ? "/dashboard" : "/login"}
            className="rounded-2xl bg-aibeop-green px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:bg-aibeop-deep"
          >
            {user ? "대시보드" : "로그인"}
          </Link>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        <AibeopchinHero />
        <HomeTrustStrip />
        <HomeRoleEntryCards />
        <HomeFlowSection />
      </main>
    </div>
  );
}
