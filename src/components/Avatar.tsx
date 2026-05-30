import { initials } from "@/lib/format";

export function Avatar({
  name,
  color,
  size = 40,
  title,
}: {
  name: string;
  color?: string;
  size?: number;
  title?: string;
}) {
  return (
    <div
      title={title}
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: color ?? "#64748b",
        fontSize: size * 0.38,
      }}
    >
      {initials(name)}
    </div>
  );
}
