"use client";

import { useState } from "react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function normalizeUnknown(value: unknown): JsonValue {
  if (value === null) return null;
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean") {
    return value as string | number | boolean;
  }
  if (Array.isArray(value)) {
    return value.map((v) => normalizeUnknown(v));
  }
  if (t === "object" && value !== null) {
    const out: { [key: string]: JsonValue } = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = normalizeUnknown(v);
    }
    return out;
  }
  return String(value);
}

export function PrettyJsonViewer({
  value,
  defaultExpanded = true,
}: {
  value: unknown;
  defaultExpanded?: boolean;
}) {
  const safe = normalizeUnknown(value === undefined ? null : value);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <JsonNode name="root" value={safe} level={0} defaultExpanded={defaultExpanded} />
    </div>
  );
}

function JsonNode({
  name,
  value,
  level,
  defaultExpanded,
}: {
  name: string;
  value: JsonValue;
  level: number;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isArray = Array.isArray(value);
  const isObject = typeof value === "object" && value !== null && !Array.isArray(value);
  const isPrimitive = !isArray && !isObject;

  if (isPrimitive) {
    return (
      <div className="py-1" style={{ paddingLeft: level * 16 }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-aibeop-subtle">{name}</span>
          <PrimitiveBadge value={value as string | number | boolean | null} />
          <span className="break-all text-sm text-aibeop-subtle">
            {formatPrimitive(value as string | number | boolean | null)}
          </span>
        </div>
      </div>
    );
  }

  const entries = isArray
    ? (value as JsonValue[]).map((item, index) => [String(index), item] as const)
    : Object.entries(value as Record<string, JsonValue>);

  return (
    <div className="py-1" style={{ paddingLeft: level * 16 }}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex flex-wrap items-center gap-2 text-left"
      >
        <span className="text-xs text-aibeop-faint">{expanded ? "▼" : "▶"}</span>
        <span className="text-xs font-semibold text-aibeop-muted">{name}</span>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-aibeop-subtle">
          {isArray ? `array(${entries.length})` : `object(${entries.length})`}
        </span>
      </button>

      {expanded && (
        <div className="mt-1">
          {entries.length === 0 ? (
            <div className="py-1 pl-5 text-xs text-aibeop-faint">비어 있음</div>
          ) : (
            entries.map(([childName, childValue]) => (
              <JsonNode
                key={`${name}.${childName}`}
                name={childName}
                value={childValue}
                level={level + 1}
                defaultExpanded={level < 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function PrimitiveBadge({
  value,
}: {
  value: string | number | boolean | null;
}) {
  const label =
    value === null
      ? "null"
      : typeof value === "string"
        ? "string"
        : typeof value === "number"
          ? "number"
          : "boolean";

  return (
    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-aibeop-muted">
      {label}
    </span>
  );
}

function formatPrimitive(value: string | number | boolean | null) {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  return String(value);
}
