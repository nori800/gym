const BOM = "\uFEFF";

interface WorkoutMovement {
  exercise_type: string;
  weight?: number | null;
  reps?: number | null;
  sets?: number | null;
  category?: string;
}

interface WorkoutForExport {
  log_date: string;
  title?: string;
  movements: WorkoutMovement[];
}

interface BodyLog {
  log_date: string;
  weight_kg?: number | null;
  body_fat_pct?: number | null;
}

function escapeCSV(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCSV).join(",");
  const dataLines = rows.map((row) => row.map(escapeCSV).join(","));
  return BOM + [headerLine, ...dataLines].join("\n");
}

export function exportWorkoutsCSV(workouts: WorkoutForExport[]): string {
  const headers = ["日付", "タイトル", "種目", "重量(kg)", "回数", "セット数", "カテゴリ"];
  const rows: (string | number | null | undefined)[][] = [];

  for (const w of workouts) {
    for (const m of w.movements) {
      rows.push([
        w.log_date,
        w.title ?? "",
        m.exercise_type,
        m.weight,
        m.reps,
        m.sets,
        m.category ?? "",
      ]);
    }
  }

  return toCSV(headers, rows);
}

export function exportBodyLogsCSV(logs: BodyLog[]): string {
  const headers = ["日付", "体重(kg)", "体脂肪率(%)"];
  const rows = logs.map((l) => [l.log_date, l.weight_kg, l.body_fat_pct]);
  return toCSV(headers, rows);
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHTMLContent(html: string): string {
  return html
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bon\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript\s*:/gi, "blocked:");
}

export function generatePDFHTML(title: string, content: string): string {
  const safeTitle = escapeHTML(title);
  const safeContent = sanitizeHTMLContent(content);
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${safeTitle}</title>
<style>
  @page { margin: 20mm; }
  body {
    font-family: "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", sans-serif;
    color: #1a1a1a;
    line-height: 1.7;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  h1 {
    font-size: 22px;
    border-bottom: 2px solid #3eed8d;
    padding-bottom: 8px;
    margin-bottom: 24px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
    font-size: 13px;
  }
  th {
    background: #f5f5f5;
    font-weight: 600;
  }
  tr:nth-child(even) { background: #fafafa; }
  .meta {
    color: #666;
    font-size: 12px;
    margin-bottom: 16px;
  }
  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
<h1>${safeTitle}</h1>
<p class="meta">出力日: ${new Date().toLocaleDateString("ja-JP")}</p>
${safeContent}
</body>
</html>`;
}
