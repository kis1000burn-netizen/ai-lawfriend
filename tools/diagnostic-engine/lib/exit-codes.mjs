import { EXECUTION_MODE } from "./execution-mode.mjs";

export const DIAGNOSTIC_EXIT = {
  OK: 0,
  SECURITY_OR_ENV_ERROR: 1,
  PROMOTION_INCOMPLETE: 2,
};

export function describeDiagnosticExitCode(code, context = {}) {
  const executionMode = context.executionMode ?? EXECUTION_MODE.STRUCTURE_ONLY;

  switch (code) {
    case DIAGNOSTIC_EXIT.OK:
      if (executionMode === EXECUTION_MODE.STAGING_FULL) {
        return "All required staging gates passed.";
      }
      return "Structural gates passed; promotion was not requested.";
    case DIAGNOSTIC_EXIT.SECURITY_OR_ENV_ERROR:
      return "Environment, security, or hard gate failure";
    case DIAGNOSTIC_EXIT.PROMOTION_INCOMPLETE:
      return "Diagnostic ran but promotion requirements are incomplete";
    default:
      return "Unknown exit code";
  }
}
