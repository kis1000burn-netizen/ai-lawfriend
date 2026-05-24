import { z } from "zod";
import type { DocumentType } from "./common";
import { UserRoleEnum } from "./common";

export const PermissionKeyEnum = z.enum([
  "case.create",
  "case.read",
  "case.update",
  "case.delete",
  "case.assign",
  "case.change_status",

  "interview.start",
  "interview.read",
  "interview.answer",
  "interview.complete",
  "interview.override",

  "questionSet.read",
  "questionSet.create",
  "questionSet.update",
  "questionSet.publish",
  "questionSet.archive",

  "documentTemplate.read",
  "documentTemplate.create",
  "documentTemplate.update",
  "documentTemplate.publish",
  "documentTemplate.archive",

  "legalFormSource.read",
  "legalFormSource.create",
  "legalFormSource.update",
  "legalFormSource.archive",

  "document.create",
  "document.read",
  "document.update",
  "document.delete",
  "document.preview",
  "document.generate",
  "document.approve",
  "document.lock",
  "document.restore",

  "paragraph.read",
  "paragraph.reorder",
  "paragraph.regenerate",
  "paragraph.restore",
  "paragraph.lock",
  "paragraph.approve",

  "attachment.upload",
  "attachment.read",
  "attachment.delete",

  "admin.dashboard.read",
  "audit.read",
  "user.manage",
  "system.config",
]);

export type PermissionKey = z.infer<typeof PermissionKeyEnum>;
export type Role = z.infer<typeof UserRoleEnum>;

export const ROLE_PERMISSIONS: Record<Role, PermissionKey[]> = {
  ADMIN: [...PermissionKeyEnum.options],

  LAWYER: [
    "case.create",
    "case.read",
    "case.update",
    "case.assign",
    "case.change_status",

    "interview.start",
    "interview.read",
    "interview.answer",
    "interview.complete",

    "questionSet.read",
    "documentTemplate.read",
    "legalFormSource.read",

    "document.create",
    "document.read",
    "document.update",
    "document.preview",
    "document.generate",
    "document.approve",
    "document.lock",
    "document.restore",

    "paragraph.read",
    "paragraph.reorder",
    "paragraph.regenerate",
    "paragraph.restore",
    "paragraph.lock",
    "paragraph.approve",

    "attachment.upload",
    "attachment.read",
    "attachment.delete",

    "audit.read",
  ],

  STAFF: [
    "case.create",
    "case.read",
    "case.update",

    "interview.start",
    "interview.read",
    "interview.answer",
    "interview.complete",

    "questionSet.read",
    "documentTemplate.read",
    "legalFormSource.read",

    "document.create",
    "document.read",
    "document.update",
    "document.preview",
    "document.generate",

    "paragraph.read",
    "paragraph.reorder",
    "paragraph.regenerate",

    "attachment.upload",
    "attachment.read",
    "attachment.delete",
  ],

  CLIENT: [
    "case.read",
    "interview.read",
    "interview.answer",
    "attachment.upload",
    "attachment.read",
  ],
};

export type PermissionContext = {
  actorRole: Role;
  actorUserId: string;
  caseOwnerUserId?: string | null;
  assignedLawyerUserId?: string | null;
  assignedStaffUserId?: string | null;
  isCaseParticipant?: boolean;
  documentType?: DocumentType;
  isDocumentLocked?: boolean;
  isApprovedVersion?: boolean;
};

export function hasPermission(role: Role, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessCase(permission: PermissionKey, ctx: PermissionContext): boolean {
  if (!hasPermission(ctx.actorRole, permission)) return false;

  if (ctx.actorRole === "ADMIN") return true;

  if (ctx.actorRole === "LAWYER") {
    return (
      ctx.assignedLawyerUserId === ctx.actorUserId ||
      ctx.caseOwnerUserId === ctx.actorUserId ||
      !!ctx.isCaseParticipant
    );
  }

  if (ctx.actorRole === "STAFF") {
    return (
      ctx.assignedStaffUserId === ctx.actorUserId ||
      ctx.caseOwnerUserId === ctx.actorUserId ||
      !!ctx.isCaseParticipant
    );
  }

  if (ctx.actorRole === "CLIENT") {
    return ctx.caseOwnerUserId === ctx.actorUserId;
  }

  return false;
}

export function canApproveDocument(ctx: PermissionContext): boolean {
  if (!hasPermission(ctx.actorRole, "document.approve")) return false;
  if (ctx.actorRole === "ADMIN") return true;
  if (ctx.actorRole === "LAWYER") return !ctx.isDocumentLocked;
  return false;
}

export function canLockDocument(ctx: PermissionContext): boolean {
  if (!hasPermission(ctx.actorRole, "document.lock")) return false;
  return ctx.actorRole === "ADMIN" || ctx.actorRole === "LAWYER";
}

export function canRegenerateParagraph(ctx: PermissionContext): boolean {
  if (!hasPermission(ctx.actorRole, "paragraph.regenerate")) return false;
  if (ctx.isApprovedVersion || ctx.isDocumentLocked) return false;
  return ctx.actorRole === "ADMIN" || ctx.actorRole === "LAWYER" || ctx.actorRole === "STAFF";
}
