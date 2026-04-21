/** ISO 日付 (YYYY-MM-DD) をローカル正午として解釈（タイムゾーンずれ防止） */
function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

/**
 * 例: 2026年4月20日（日）
 * 外部日付ライブラリなし（Intl も使わず、表示を完全にコントロール）
 */
export function formatJapaneseLongDate(iso: string): string {
  const d = parseIsoDate(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEKDAYS_JA[d.getDay()];
  return `${y}年${m}月${day}日（${w}）`;
}

/** 相対表現（ホーム・カードのサブ行用） */
export function formatRelativeCalendarDay(iso: string, todayIso = "2026-04-21"): string {
  const d = parseIsoDate(iso);
  const t = parseIsoDate(todayIso);
  const diffMs = t.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays > 1 && diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 0) return "未来の日付";
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
