import {
  formatJapaneseLongDate,
  formatRelativeCalendarDay,
} from "@/lib/utils/formatRecordDate";

export function RecordDateBlock({ iso }: { iso: string }) {
  return (
    <div>
      <p className="text-sm font-bold leading-snug tracking-tight text-primary">
        {formatJapaneseLongDate(iso)}
      </p>
      <p className="mt-0.5 text-[12px] font-label text-secondary">
        {formatRelativeCalendarDay(iso)}
      </p>
    </div>
  );
}
