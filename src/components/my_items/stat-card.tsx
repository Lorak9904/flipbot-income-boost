import { Card } from "@/components/ui/card";

type Tint = "cyan" | "fuchsia" | "violet" | "teal";

export function StatCard(
  { label, value, tint = "cyan" }:
  { label: string; value: React.ReactNode; tint?: Tint }
) {
  const glow: Record<Tint, string> = {
    cyan:    "bg-[radial-gradient(190px_120px_at_45%_50%,rgba(34,211,238,0.2),transparent_80%)]",
    fuchsia: "bg-[radial-gradient(190px_120px_at_45%_50%,rgba(236,72,153,0.2),transparent_80%)]",
    violet:  "bg-[radial-gradient(190px_120px_at_45%_50%,rgba(139,92,246,0.2),transparent_80%)]",
    teal:    "bg-[radial-gradient(190px_120px_at_45%_50%,rgba(45,212,191,0.2),transparent_80%)]",
  };

  const sweep: Record<Tint, string> = {
    cyan:    "",
    fuchsia: "",
    violet:  "",
    teal:    "",
  };

  return (
    <Card
      className="
        group relative overflow-hidden rounded-2xl
        ring-1 ring-white/5 border-white/5
        bg-gradient-to-br from-[#0f1118]/95 via-[#141824]/90 to-[#1a1f2e]/85
        backdrop-blur-xl
        transition-all duration-500
        hover:scale-[1.02] hover:ring-white/70 hover:border-white/70
        hover:shadow-[0_0_25px_-12px_rgba(34,211,238,0.35)]
      "
    >
      {/* ambient inner glow */}
      <div className={`pointer-events-none absolute inset-0 ${glow[tint]} mix-blend-lighten opacity-80 group-hover:opacity-95`} />
      {/* soft bottom sweep highlight */}
      <div className={`pointer-events-none absolute inset-0 ${sweep[tint]} opacity-60 blur-[1px]`} />

      <div className="relative z-10 p-5">
        <div className="text-white/70 text-sm font-medium">{label}</div>
        <div className="mt-1 text-3xl font-bold tracking-tight text-white">{value}</div>
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden rounded-2xl ring-1 ring-white/5 border-white/5 bg-[#0f1118]/80 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
      <div className="relative z-10 p-5 space-y-3">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="h-8 w-20 rounded bg-white/10" />
      </div>
    </Card>
  );
}
