// src/components/ui/chart.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

/* commun */
const axisTick = { fill: "rgba(255,255,255,.8)", fontSize: 12 };
const axisLine = { stroke: "rgba(255,255,255,.12)" };
const legendStyle = { color: "rgba(255,255,255,.85)" };

export function ChartContainer({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white/5 border border-white/10 p-3 text-white",
        className
      )}
    >
      {children}
    </div>
  )
}

export function ChartTitle({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("text-sm text-white/80 font-medium", className)}>
      {children}
    </div>
  )
}

export function ChartKpis({
  items,
}: {
  items: { label: string; value: string | number; tone?: "good" | "bad" }[]
}) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {items.map((it, i) => (
        <div
          key={i}
          className={[
            "rounded-lg border px-3 py-1 text-sm",
            it.tone === "good"
              ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
              : it.tone === "bad"
              ? "text-red-300 bg-red-500/10 border-red-500/30"
              : "text-white/80 bg-white/5 border-white/10",
          ].join(" ")}
        >
          <div className="text-[11px] opacity-80">{it.label}</div>
          <div className="text-base font-semibold">{it.value}</div>
        </div>
      ))}
    </div>
  )
}
