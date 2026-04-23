import JapaneseHolidays from "japanese-holidays";

/** `YYYY-MM-DD` をローカル日付として解釈した曜日（0=日 … 6=土） */
export function weekdayFromIso(iso: string): number {
  const [ys, ms, ds] = iso.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!y || !m || !d) return 0;
  return new Date(y, m - 1, d).getDay();
}

/** 日本の祝日名（振替・国民の休日を含む）。祝日でなければ undefined */
export function japaneseHolidayName(iso: string): string | undefined {
  const [ys, ms, ds] = iso.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!y || !m || !d) return undefined;
  return JapaneseHolidays.isHoliday(new Date(y, m - 1, d), true);
}

/** 曜日ヘッダー（日〜土の列インデックス 0..6）用のクラス */
export function weekdayHeaderClass(columnIndex: number): string {
  if (columnIndex === 0) return "text-red-600";
  if (columnIndex === 6) return "text-blue-600";
  return "text-muted";
}

export type DayTone = "default" | "sunday" | "saturday" | "holiday";

export function dayToneFromIso(iso: string): DayTone {
  const hol = japaneseHolidayName(iso);
  if (hol) return "holiday";
  const wd = weekdayFromIso(iso);
  if (wd === 0) return "sunday";
  if (wd === 6) return "saturday";
  return "default";
}

/** 日付セルの文字色（選択時は呼び出し側で on-inverse を上書き） */
export function dayNumberTextClass(tone: DayTone, inCurrentMonth: boolean): string {
  const base =
    tone === "holiday"
      ? "text-rose-700"
      : tone === "sunday"
        ? "text-red-600"
        : tone === "saturday"
          ? "text-blue-600"
          : "text-primary";

  if (!inCurrentMonth) {
    return tone === "default" ? "text-muted/50" : `${base} opacity-55`;
  }
  return base;
}
