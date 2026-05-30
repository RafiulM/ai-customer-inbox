"use client";

import type { DailyVolume } from "@/lib/data";

export function VolumeBarChart({ data }: { data: DailyVolume[] }) {
  const max = Math.max(...data.flatMap((d) => [d.masuk, d.selesai]));
  return (
    <div>
      <div className="flex h-44 items-end gap-3">
        {data.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <Bar value={d.masuk} max={max} cls="bg-brand-500" label={`${d.masuk} masuk`} />
              <Bar value={d.selesai} max={max} cls="bg-emerald-400" label={`${d.selesai} selesai`} />
            </div>
            <span className="text-[11px] text-slate-400">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-4 text-xs text-slate-500">
        <Legend cls="bg-brand-500" label="Pesan masuk" />
        <Legend cls="bg-emerald-400" label="Tiket selesai" />
      </div>
    </div>
  );
}

function Bar({ value, max, cls, label }: { value: number; max: number; cls: string; label: string }) {
  return (
    <div
      title={label}
      className={`group relative w-2.5 rounded-t ${cls} transition-all hover:opacity-80`}
      style={{ height: `${(value / max) * 100}%` }}
    >
      <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white opacity-0 transition group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${cls}`} />
      {label}
    </span>
  );
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ slices, centerLabel }: { slices: DonutSlice[]; centerLabel: string }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={140} height={140} viewBox="0 0 140 140" className="-rotate-90">
        <circle cx={70} cy={70} r={radius} fill="none" stroke="#eef0f4" strokeWidth={16} />
        {slices.map((s) => {
          const len = (s.value / total) * circ;
          const el = (
            <circle
              key={s.label}
              cx={70}
              cy={70}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={16}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
        <text
          x={70}
          y={70}
          textAnchor="middle"
          dominantBaseline="central"
          className="rotate-90"
          transform="rotate(90 70 70)"
          fontSize={22}
          fontWeight={700}
          fill="#1c1d21"
        >
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-400">{centerLabel}</p>
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-slate-600">{s.label}</span>
            <span className="ml-auto font-semibold text-slate-800">
              {Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
