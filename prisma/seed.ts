import { PrismaClient, UserRole, UserStatus, LawyerVerificationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedLegalFormSources } from "./seed-legal-form-sources";
import { seedQuestionSets, DEFAULT_QUESTION_SET_CODE } from "./seed-question-sets";
import { seedTenantOrganizationDemo } from "./seed-tenant-organization";
import { seedTenantPlanDemo } from "./seed-tenant-plan";
import { seedAiEvaluationDataset } from "./seed-ai-evaluation-dataset";

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Math.min(
    20,
    Math.max(4, Number(process.env.BCRYPT_SALT_ROUNDS) || 12),
  );

  const password = "Admin1234!";
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const opsSuperAdminEmail = "admin@test.com";
  const opsSuperAdminPassword = "password123!";
  const opsSuperAdminHash = await bcrypt.hash(opsSuperAdminPassword, saltRounds);

  await prisma.user.upsert({
    where: { email: opsSuperAdminEmail },
    update: {
      name: "최고관리자",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash: opsSuperAdminHash,
    },
    create: {
      email: opsSuperAdminEmail,
      passwordHash: opsSuperAdminHash,
      name: "최고관리자",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      phone: "01000000000",
    },
  });
  const adminEmail = "admin@aibupchin.com";
  const lawyerEmail = "lawyer@aibupchin.com";
  const userEmail = "user@aibupchin.com";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "시스템 관리자",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: "시스템 관리자",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: "01000000001",
    },
  });

  const lawyer = await prisma.user.upsert({
    where: { email: lawyerEmail },
    update: {
      name: "테스트 변호사",
      role: UserRole.LAWYER,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
    create: {
      email: lawyerEmail,
      passwordHash,
      name: "테스트 변호사",
      role: UserRole.LAWYER,
      status: UserStatus.ACTIVE,
      phone: "01000000002",
    },
  });

  await prisma.lawyerProfile.upsert({
    where: { userId: lawyer.id },
    update: {
      verificationStatus: LawyerVerificationStatus.APPROVED,
      registrationNumber: "SEED-DEMO",
      barAssociation: "SEED-DEMO",
      reviewedAt: new Date(),
    },
    create: {
      userId: lawyer.id,
      registrationNumber: "SEED-DEMO",
      barAssociation: "SEED-DEMO",
      verificationStatus: LawyerVerificationStatus.APPROVED,
      submittedAt: new Date(),
      reviewedAt: new Date(),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      name: "테스트 사용자",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
    create: {
      email: userEmail,
      passwordHash,
      name: "테스트 사용자",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      phone: "01000000003",
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {
      name: "Ops Staff",
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
    create: {
      email: "staff@example.com",
      passwordHash,
      name: "Ops Staff",
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
      phone: "01000000004",
    },
  });

  await prisma.alertRule.upsert({
    where: { code: "ROLE_SPIKE_DEFAULT" },
    update: {},
    create: {
      name: "역할별 급증 감지 기본 규칙",
      code: "ROLE_SPIKE_DEFAULT",
      type: "ROLE_SPIKE",
      enabled: true,
      severity: "WARNING",
      description:
        "최근 시간대 활동량이 직전 동일 구간 대비 급증한 사용자를 감지합니다.",
      configJson: {
        timeWindowHours: 6,
        minCount: 20,
        spikeMultiplier: 2,
        roleTargets: ["ADMIN", "LAWYER", "USER"],
      },
    },
  });

  await prisma.alertRule.upsert({
    where: { code: "NIGHT_ACTIVITY_DEFAULT" },
    update: {},
    create: {
      name: "심야 활동 감지 기본 규칙",
      code: "NIGHT_ACTIVITY_DEFAULT",
      type: "NIGHT_ACTIVITY",
      enabled: true,
      severity: "CRITICAL",
      description: "심야 시간대의 비허용 액션 빈발 여부를 감지합니다.",
      configJson: {
        startHour: 0,
        endHour: 6,
        minCount: 5,
        whitelistActionTypes: ["AUTH_LOGIN_SUCCESS"],
      },
    },
  });

  await prisma.alertRule.upsert({
    where: { code: "ACTION_POLICY_DEFAULT" },
    update: {},
    create: {
      name: "액션 정책 기본 규칙",
      code: "ACTION_POLICY_DEFAULT",
      type: "ACTION_POLICY",
      enabled: true,
      severity: "WARNING",
      description: "블랙리스트/화이트리스트 기반 정책 위반 액션을 감지합니다.",
      configJson: {
        blacklist: ["CASE_FORCE_DELETE", "USER_FORCE_ROLE_CHANGE"],
        whitelist: [
          "AUTH_LOGIN_SUCCESS",
          "CASE_CREATE",
          "CASE_UPDATE",
          "CASE_ASSIGN",
          "CASE_ASSIGN_END",
          "AUDIT_EXPORT_XLSX",
        ],
        mode: "BOTH",
      },
    },
  });

  await seedLegalFormSources(prisma);
  await seedQuestionSets(prisma);
  const demoTenant = await seedTenantOrganizationDemo(prisma);
  const demoPlan = await seedTenantPlanDemo(prisma);
  console.log(`QuestionSet: code=${DEFAULT_QUESTION_SET_CODE} (멱등 upsert)`);
  if (demoTenant) {
    console.log(`TenantOrganization: slug=${demoTenant.slug} id=${demoTenant.id}`);
  }
  if (demoPlan) {
    console.log(`TenantPlan: tier=${demoPlan.tier} tenantId=${demoPlan.tenantId}`);
  }
  const evalSeed = await seedAiEvaluationDataset(prisma);
  console.log(`AiEvaluationDataset: entries=${evalSeed.length}`);
  console.log("=== Seed Complete ===");
  console.log({
    superAdmin: { email: opsSuperAdminEmail, password: opsSuperAdminPassword },
    admin: { email: admin.email, password },
    staff: { email: "staff@example.com", password },
    lawyer: { email: lawyer.email, password },
    user: { email: user.email, password },
  });
}

main()
  .catch((e) => {
    console.error("[SEED_ERROR]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
