"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Avatar } from "./Avatar";
import {
  ChartIcon,
  InboxIcon,
  LogoutIcon,
  SettingsIcon,
  SparkIcon,
  UsersIcon,
} from "./icons";

const nav = [
  { key: "dashboard", label: "Dashboard", icon: ChartIcon, href: "/dashboard" },
  { key: "inbox", label: "Inbox", icon: InboxIcon, href: "/inbox" },
  { key: "customers", label: "Pelanggan", icon: UsersIcon, href: null },
  { key: "settings", label: "Pengaturan", icon: SettingsIcon, href: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <aside className="flex w-16 shrink-0 flex-col items-center border-r border-slate-200 bg-white py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
        <SparkIcon width={22} height={22} />
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {nav.map((n) => {
          const Icon = n.icon;
          const active = n.href === pathname;
          const cls = `group relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
            active
              ? "bg-brand-50 text-brand-600"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          }`;
          const inner = (
            <>
              <Icon width={20} height={20} />
              {active && (
                <span className="absolute -left-4 h-6 w-1 rounded-r bg-brand-600" />
              )}
            </>
          );
          return n.href ? (
            <Link key={n.key} href={n.href} title={n.label} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={n.key} title={n.label} className={`${cls} cursor-not-allowed`}>
              {inner}
            </button>
          );
        })}
      </nav>
      <div className="flex flex-col items-center gap-3">
        <button
          title="Keluar"
          onClick={signOut}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <LogoutIcon width={20} height={20} />
        </button>
        <Avatar name={profile.name} color={profile.avatarColor} size={36} title={profile.name} />
      </div>
    </aside>
  );
}
