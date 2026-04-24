import { describe, it, expect } from "vitest";
import {
  exportWorkoutsCSV,
  exportBodyLogsCSV,
  generatePDFHTML,
  sanitizeHTMLContent,
} from "./export";

describe("exportWorkoutsCSV", () => {
  it("generates correct CSV with BOM", () => {
    const csv = exportWorkoutsCSV([
      {
        log_date: "2026-04-20",
        title: "レッグデー",
        movements: [
          { exercise_type: "スクワット", weight: 100, reps: 8, sets: 3, category: "脚" },
        ],
      },
    ]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("日付,タイトル,種目");
    expect(csv).toContain("2026-04-20,レッグデー,スクワット,100,8,3,脚");
  });

  it("handles multiple movements across workouts", () => {
    const csv = exportWorkoutsCSV([
      {
        log_date: "2026-04-20",
        title: "Upper",
        movements: [
          { exercise_type: "ベンチプレス", weight: 80, reps: 10, sets: 3 },
          { exercise_type: "ダンベルフライ", weight: 20, reps: 12, sets: 3 },
        ],
      },
    ]);

    const lines = csv.split("\n");
    expect(lines.length).toBe(3); // header + 2 data rows
  });

  it("handles empty workouts", () => {
    const csv = exportWorkoutsCSV([]);
    expect(csv).toContain("日付,タイトル,種目");
    const lines = csv.split("\n");
    expect(lines.length).toBe(1); // header only
  });

  it("escapes commas and quotes in fields", () => {
    const csv = exportWorkoutsCSV([
      {
        log_date: "2026-04-20",
        title: 'A "quoted" title',
        movements: [
          { exercise_type: "Move, with comma", weight: 50, reps: 10, sets: 3 },
        ],
      },
    ]);

    expect(csv).toContain('"A ""quoted"" title"');
    expect(csv).toContain('"Move, with comma"');
  });
});

describe("exportBodyLogsCSV", () => {
  it("generates correct body log CSV", () => {
    const csv = exportBodyLogsCSV([
      { log_date: "2026-04-20", weight_kg: 72.5, body_fat_pct: 15.3 },
      { log_date: "2026-04-21", weight_kg: 72.3, body_fat_pct: null },
    ]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("日付,体重(kg),体脂肪率(%)");
    expect(csv).toContain("2026-04-20,72.5,15.3");
    expect(csv).toContain("2026-04-21,72.3,");
  });
});

describe("sanitizeHTMLContent", () => {
  it("removes script tags", () => {
    const result = sanitizeHTMLContent('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain("<script");
    expect(result).toContain("<p>Hello</p>");
  });

  it("removes iframe tags", () => {
    const result = sanitizeHTMLContent('<iframe src="https://evil.com"></iframe>');
    expect(result).not.toContain("<iframe");
  });

  it("removes object/embed tags", () => {
    const result = sanitizeHTMLContent('<object data="evil.swf"></object><embed src="evil.swf">');
    expect(result).not.toContain("<object");
    expect(result).not.toContain("<embed");
  });

  it("removes SVG payloads", () => {
    const result = sanitizeHTMLContent('<svg onload="alert(1)"><circle r="10"/></svg>');
    expect(result).not.toContain("<svg");
  });

  it("removes inline event handlers", () => {
    const result = sanitizeHTMLContent('<div onmouseover="alert(1)">hover me</div>');
    expect(result).not.toContain("onmouseover");
    expect(result).toContain("hover me");
  });

  it("blocks javascript: protocol", () => {
    const result = sanitizeHTMLContent('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toContain("javascript:");
    expect(result).toContain("blocked:");
  });

  it("blocks vbscript: protocol", () => {
    const result = sanitizeHTMLContent('<a href="vbscript:msgbox">click</a>');
    expect(result).not.toContain("vbscript:");
  });

  it("blocks CSS expression()", () => {
    const result = sanitizeHTMLContent('<div style="width: expression(alert(1))">x</div>');
    expect(result).not.toContain("expression(");
  });

  it("removes meta http-equiv", () => {
    const result = sanitizeHTMLContent('<meta http-equiv="refresh" content="0;url=evil.com">');
    expect(result).not.toContain("<meta");
  });

  it("removes form/input tags", () => {
    const result = sanitizeHTMLContent('<form action="evil"><input type="text"></form>');
    expect(result).not.toContain("<form");
    expect(result).not.toContain("<input");
  });

  it("preserves safe HTML", () => {
    const safe = "<h1>Title</h1><p>Hello <strong>world</strong></p><ul><li>item</li></ul>";
    const result = sanitizeHTMLContent(safe);
    expect(result).toBe(safe);
  });
});

describe("generatePDFHTML", () => {
  it("generates valid HTML with escaped title", () => {
    const html = generatePDFHTML("Test <Title>", "<p>Content</p>");
    expect(html).toContain("Test &lt;Title&gt;");
    expect(html).toContain("<p>Content</p>");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("lang=\"ja\"");
  });

  it("sanitizes content but not the safe parts", () => {
    const html = generatePDFHTML("Report", '<p>Safe</p><script>alert("xss")</script>');
    expect(html).toContain("<p>Safe</p>");
    expect(html).not.toContain("<script>");
  });
});
