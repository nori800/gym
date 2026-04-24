"use client";

import { UserPlus, Loader2 } from "lucide-react";

interface InviteSectionProps {
  inviteEmail: string;
  inviting: boolean;
  onEmailChange: (value: string) => void;
  onInvite: () => void;
}

export function InviteSection({
  inviteEmail,
  inviting,
  onEmailChange,
  onInvite,
}: InviteSectionProps) {
  return (
    <section className="mt-6">
      <div className="rounded-[18px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.04)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/10">
            <UserPlus size={18} strokeWidth={1.5} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight">メンバーを招待</p>
            <p className="mt-0.5 text-xs text-secondary">
              メールアドレスまたは表示名で検索
            </p>
          </div>
        </div>
        <div className="mt-3.5 flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="メールアドレスまたは名前"
            className="min-h-[44px] flex-1 rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !inviting) onInvite();
            }}
          />
          <button
            type="button"
            onClick={onInvite}
            disabled={inviting || !inviteEmail.trim()}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-inverse px-4 text-sm font-extrabold text-on-inverse transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {inviting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UserPlus size={14} strokeWidth={2} />
            )}
            招待
          </button>
        </div>
      </div>
    </section>
  );
}
