/**
 * 역할별 block 노출 정책 (Phase 6-B)
 */

export const CMB_ADMIN_ONLY_BLOCKS = [
  "admin-audit-trail",
  "admin-internal-notes",
  "admin-gongbuho-ops",
] as const;

export type CmbAdminOnlyBlock = (typeof CMB_ADMIN_ONLY_BLOCKS)[number];

export function findAdminOnlyBlocksInClientUi(clientBlocks: string[]): string[] {
  const adminSet = new Set<string>(CMB_ADMIN_ONLY_BLOCKS);
  return clientBlocks.filter((b) => adminSet.has(b));
}
