export type FeatureFlags = {
  OPS_QUEUE_BULK_EDIT: boolean;
  OPS_QUEUE_REBALANCE_APPLY: boolean;
  OPS_QUEUE_WIP_SETTINGS_EDIT: boolean;
  OPS_QUEUE_OPTIMISTIC_UI: boolean;
  CLIENT_PORTAL_PUSH_SURFACE: boolean;
};

export function getFeatureFlags(): FeatureFlags {
  return {
    OPS_QUEUE_BULK_EDIT: process.env.NEXT_PUBLIC_FF_OPS_QUEUE_BULK_EDIT !== "false",
    OPS_QUEUE_REBALANCE_APPLY: process.env.NEXT_PUBLIC_FF_OPS_QUEUE_REBALANCE_APPLY !== "false",
    OPS_QUEUE_WIP_SETTINGS_EDIT: process.env.NEXT_PUBLIC_FF_OPS_QUEUE_WIP_SETTINGS_EDIT !== "false",
    OPS_QUEUE_OPTIMISTIC_UI: process.env.NEXT_PUBLIC_FF_OPS_QUEUE_OPTIMISTIC_UI !== "false",
    CLIENT_PORTAL_PUSH_SURFACE:
      process.env.NEXT_PUBLIC_FF_CLIENT_PORTAL_PUSH_SURFACE !== "false",
  };
}
