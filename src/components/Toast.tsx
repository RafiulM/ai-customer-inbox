"use client";

import { BellIcon, CheckIcon, MailIcon } from "./icons";

export type ToastKind = "email" | "success" | "alert";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  body: string;
}

const style: Record<ToastKind, { ring: string; icon: typeof MailIcon; iconCls: string }> = {
  email: { ring: "ring-brand-200", icon: MailIcon, iconCls: "bg-brand-50 text-brand-600" },
  success: { ring: "ring-emerald-200", icon: CheckIcon, iconCls: "bg-emerald-50 text-emerald-600" },
  alert: { ring: "ring-red-200", icon: BellIcon, iconCls: "bg-red-50 text-red-600" },
};

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const s = style[t.kind];
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            onClick={() => onDismiss(t.id)}
            className={`animate-fade-up pointer-events-auto flex cursor-pointer gap-3 rounded-xl bg-white p-3 shadow-lg ring-1 ${s.ring}`}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.iconCls}`}>
              <Icon width={18} height={18} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800">{t.title}</div>
              <div className="text-xs leading-snug text-slate-500">{t.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
