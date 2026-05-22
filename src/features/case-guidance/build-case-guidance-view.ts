import { buildCaseGuidanceCard } from "@/features/case-guidance/case-guidance-rules";

/** 인터뷰 답변에서 짧은 요약 줄 생성(키 이름 + 값 미리보기) */
export function summarizeInterviewAnswersPreview(
  answers: Record<string, unknown> | null | undefined,
  maxLines: number,
  maxCharsPerLine: number,
): string[] {
  if (!answers || typeof answers !== "object") {
    return [];
  }

  const lines: string[] = [];

  function formatLeaf(_key: string, value: unknown): string | null {
    if (value == null) return null;
    if (typeof value === "string") {
      const t = value.trim();
      return t.length ? t : null;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (Array.isArray(value)) {
      const joined = value
        .map((v) => (typeof v === "string" ? v.trim() : JSON.stringify(v)))
        .filter(Boolean)
        .join(", ");
      return joined || null;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }

  function walk(prefix: string, obj: Record<string, unknown>, depth: number) {
    if (lines.length >= maxLines || depth > 4) return;
    for (const [k, v] of Object.entries(obj)) {
      if (lines.length >= maxLines) return;
      const keyPath = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === "object" && !Array.isArray(v)) {
        walk(keyPath, v as Record<string, unknown>, depth + 1);
      } else {
        const formatted = formatLeaf(keyPath, v);
        if (!formatted) continue;
        const line = `${keyPath}: ${formatted}`;
        lines.push(line.length > maxCharsPerLine ? `${line.slice(0, maxCharsPerLine)}…` : line);
      }
    }
  }

  walk("", answers as Record<string, unknown>, 0);
  return lines;
}

/** 사건 등록 설명 필드 줄 단위 분리 */
export function bulletsFromDescription(description: string | null | undefined): string[] {
  if (!description?.trim()) return [];
  return description
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function buildGuidanceCardForCaseView(input: {
  category: string | null;
  description: string | null;
  title: string;
  interviewCompleted: boolean;
  interviewAnswers: Record<string, unknown> | null | undefined;
}): ReturnType<typeof buildCaseGuidanceCard> {
  const descBullets = bulletsFromDescription(input.description);
  const answerLines = summarizeInterviewAnswersPreview(input.interviewAnswers, 8, 180);
  const situationBullets: string[] = [];
  situationBullets.push(`사건 제목: ${input.title.trim() || "(미입력)"}`);
  situationBullets.push(...descBullets);
  situationBullets.push(...answerLines);

  return buildCaseGuidanceCard({
    category: input.category,
    interviewCompleted: input.interviewCompleted,
    situationBulletsFromInputs: situationBullets,
  });
}
