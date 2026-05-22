/** jsonb 재저장·역직렬화 후에도 동일해야 하므로 키 정렬 등 결정적 직렬화로 해시 계산 */

export function canonicalStringifyCasePackageSnapshot(value: unknown): string {
  if (value === null) {
    return "null";
  }
  const t = typeof value;
  if (t === "string") {
    return JSON.stringify(value);
  }
  if (t === "number") {
    if (Number.isNaN(value)) {
      throw new Error("case package snapshot JSON must not contain NaN");
    }
    return JSON.stringify(value);
  }
  if (t === "boolean") {
    return JSON.stringify(value);
  }
  if (t !== "object") {
    throw new Error(`unsupported JSON value type: ${String(t)}`);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalStringifyCasePackageSnapshot(entry)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const parts: string[] = [];
  for (const key of keys) {
    const v = obj[key];
    if (v === undefined) {
      continue;
    }
    parts.push(`${JSON.stringify(key)}:${canonicalStringifyCasePackageSnapshot(v)}`);
  }
  return `{${parts.join(",")}}`;
}
