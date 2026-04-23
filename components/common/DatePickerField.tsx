"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatJapaneseLongDate } from "@/lib/utils/formatRecordDate";
import { FocusTrap } from "@/components/common/FocusTrap";
import {
  dayNumberTextClass,
  dayToneFromIso,
  japaneseHolidayName,
  weekdayHeaderClass,
} from "@/lib/calendar/jpCalendarTone";

function parseIsoToParts(iso: string): { y: number; m: number; d: number } {
  const [ys, ms, ds] = iso.split("-");
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  if (!y || !m || !d) {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
  }
  return { y, m, d };
}

function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

type Cell = { day: number; iso: string; inCurrentMonth: boolean };

function buildMonthGrid(year: number, month: number): Cell[] {
  const first = new Date(year, month - 1, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrev = new Date(prevYear, prevMonth, 0).getDate();

  const cells: Cell[] = [];
  for (let i = 0; i < startPad; i++) {
    const d = daysInPrev - startPad + 1 + i;
    cells.push({ day: d, iso: toIso(prevYear, prevMonth, d), inCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: toIso(year, month, d), inCurrentMonth: true });
  }
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  let n = 1;
  while (cells.length < 42) {
    cells.push({ day: n, iso: toIso(nextYear, nextMonth, n), inCurrentMonth: false });
    n++;
  }
  return cells;
}

function todayIso(): string {
  const t = new Date();
  return toIso(t.getFullYear(), t.getMonth() + 1, t.getDate());
}

type DatePickerFieldProps = {
  value: string;
  onChange: (iso: string) => void;
  /** スクリーンリーダー用（画面上はラベルなし） */
  "aria-label"?: string;
};

export function DatePickerField({ value, onChange, "aria-label": ariaLabel = "日付を選択" }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const initial = parseIsoToParts(value);
  const [viewY, setViewY] = useState(initial.y);
  const [viewM, setViewM] = useState(initial.m);

  const openSheet = useCallback(() => {
    const p = parseIsoToParts(value);
    setViewY(p.y);
    setViewM(p.m);
    setOpen(true);
  }, [value]);

  const closeSheet = useCallback(() => setOpen(false), []);

  const cells = useMemo(() => buildMonthGrid(viewY, viewM), [viewY, viewM]);

  const prevMonth = useCallback(() => {
    setViewM((m) => {
      if (m === 1) {
        setViewY((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewM((m) => {
      if (m === 12) {
        setViewY((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  }, []);

  const pick = useCallback(
    (iso: string) => {
      onChange(iso);
      setOpen(false);
    },
    [onChange],
  );

  const pickToday = useCallback(() => {
    const t = todayIso();
    onChange(t);
    const p = parseIsoToParts(t);
    setViewY(p.y);
    setViewM(p.m);
    setOpen(false);
  }, [onChange]);

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-label={ariaLabel}
        className="flex min-h-[62px] w-full items-center justify-between rounded-[18px] bg-white px-[18px] text-left shadow-[0_0_0_1px_rgba(0,0,0,.04)] transition-colors active:bg-surface"
      >
        <span className="text-[15px] font-bold tracking-tight text-primary">{formatJapaneseLongDate(value)}</span>
        <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-muted" aria-hidden />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[125] bg-black/50 backdrop-blur-[2px]"
            onClick={closeSheet}
            aria-label="閉じる"
          />
          <div
            className="fixed inset-x-0 bottom-0 z-[130] mx-auto max-w-md"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
          >
            <FocusTrap>
              <div className="rounded-t-[18px] bg-white px-5 pb-[max(1.25rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
                <div className="relative flex items-center justify-center pb-1">
                  <button
                    type="button"
                    onClick={closeSheet}
                    className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full text-secondary transition-all active:bg-chip"
                    aria-label="閉じる"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                  <div className="flex w-full max-w-[280px] items-center justify-between gap-2 pr-10">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary transition-all active:bg-chip"
                      aria-label="前の月"
                    >
                      <ChevronLeft size={22} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setYearPickerOpen((p) => !p)}
                      className="min-w-0 flex-1 rounded-lg px-2 py-1 text-center text-base font-bold tracking-tight transition-colors active:bg-chip"
                      aria-label="年を変更"
                    >
                      {viewY}年{viewM}月
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary transition-all active:bg-chip"
                      aria-label="次の月"
                    >
                      <ChevronRight size={22} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {yearPickerOpen && (
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {Array.from({ length: 8 }, (_, i) => viewY - 3 + i).map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => { setViewY(y); setYearPickerOpen(false); }}
                        className={`rounded-[10px] py-2 text-sm font-metric transition-all duration-150 active:scale-95 ${
                          y === viewY
                            ? "bg-inverse font-bold text-on-inverse"
                            : "text-primary hover:bg-chip"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                )}

                {!yearPickerOpen && (
                  <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
                  {WEEKDAYS.map((w, col) => (
                    <span
                      key={w}
                      className={`pb-1 text-[11px] font-bold ${weekdayHeaderClass(col)}`}
                    >
                      {w}
                    </span>
                  ))}
                  {cells.map((c, i) => {
                    const selected = c.iso === value;
                    const tone = dayToneFromIso(c.iso);
                    const holName = japaneseHolidayName(c.iso);
                    const toneClass = selected ? "text-on-inverse" : dayNumberTextClass(tone, c.inCurrentMonth);
                    return (
                      <button
                        key={`${c.iso}-${i}`}
                        type="button"
                        onClick={() => pick(c.iso)}
                        aria-label={
                          holName
                            ? `${c.day}日、${holName}`
                            : `${c.day}日`
                        }
                        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-metric transition-all duration-150 active:scale-95 ${
                          selected
                            ? `bg-inverse font-bold shadow-[0_2px_8px_rgba(0,0,0,0.12)] ${toneClass}`
                            : `${toneClass} ${
                                c.inCurrentMonth ? "hover:bg-chip" : "hover:bg-chip/60"
                              }`
                        }`}
                      >
                        {c.day}
                      </button>
                    );
                  })}
                  <p className="col-span-7 mt-2 text-left text-[10px] leading-relaxed text-secondary">
                    <span className="font-bold text-red-600">日</span>
                    <span className="text-muted">・</span>
                    <span className="font-bold text-blue-600">土</span>
                    <span className="text-muted">・</span>
                    <span className="font-bold text-rose-700">祝</span>
                    <span className="text-muted">（振替休日を含む）</span>
                  </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={pickToday}
                  className="mt-4 min-h-[44px] w-full rounded-xl bg-chip text-sm font-extrabold text-secondary transition-all duration-150 active:scale-[0.98]"
                >
                  今日にする
                </button>
              </div>
            </FocusTrap>
          </div>
        </>
      )}
    </>
  );
}
