import {
  formatJapaneseLongDate,
  formatRelativeCalendarDay,
} from "@/lib/utils/formatRecordDate";

/**
 * ワークアウト履歴・ボディログで共通の「記録日」表示。
 */
export function RecordDateBlock({ iso }: { iso: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
        記録日
      </p>
      <p className="mt-0.5 text-[13px] font-bold leading-snug tracking-tight text-primary">
        {formatJapaneseLongDate(iso)}
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-secondary">
        {formatRelativeCalendarDay(iso)}
      </p>
    </div>
  );
}
