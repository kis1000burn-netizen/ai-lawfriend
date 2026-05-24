-- Phase 15-C.2 — Portal collaboration review gate (CLIENT_STATEMENT → 13-G queue)
ALTER TYPE "LitigationDocumentIntelligenceReviewPhase" ADD VALUE IF NOT EXISTS 'PHASE_15B';
ALTER TYPE "LitigationDocumentIntelligenceReviewPhase" ADD VALUE IF NOT EXISTS 'PHASE_15C';
