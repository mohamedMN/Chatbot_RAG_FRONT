// src/components/analytics/UsageCharts.tsx
import * as React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import { ChartContainer, ChartTitle, ChartKpis } from "@/components/ui/chart";
import { getTimeseries } from "@/services/api";

// ---- Palette via CSS variables (fallbacks provided)
const C1 = "hsl(var(--chart-1, 220 90% 60%))"; // Messages
const C2 = "hsl(var(--chart-2,  20 90% 60%))"; // Conversations

// ---- Common styling for dark mode
const axisTick = { fill: "rgba(255,255,255,.85)", fontSize: 12 };
const axisLine = { stroke: "rgba(255,255,255,.15)" };
const gridLine = "rgba(255,255,255,.08)";
const legendStyle: React.CSSProperties = { color: "rgba(255,255,255,.9)" };
const tooltipStyle: React.CSSProperties = {
  background: "rgba(0,0,0,.85)",
  border: "1px solid rgba(255,255,255,.15)",
  color: "#fff",
};

// ---- Helpers
const hasValues = (rows: any[], key: "messages" | "conversations") =>
  Array.isArray(rows) && rows.some((d) => Number(d?.[key]) > 0);

// Sparkline styles
const SPARK_STROKE_WIDTH = 2;
const SPARK_FILL_OPACITY = 0.28;

// ---- Period options (no "this_week")
const PERIOD_OPTIONS = [
  { value: "today",     label: "Aujourd’hui" },
  { value: "last_7d",   label: "7 derniers jours" },
  { value: "this_month", label: "Ce mois" },
];

export default function UsageCharts() {
  // Default = last_7d
  const [period, setPeriod] = React.useState("last_7d");
  const [data, setData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getTimeseries({ period })
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  const series = Array.isArray(data?.series) ? data!.series : [];

  return (
    <Card
      className="border-white/10 bg-white/5 backdrop-blur text-white"
      // Force valid chart colors even if :root vars are missing
      style={
        {
          "--chart-1": "200 95% 60%",
          "--chart-2": "28 94% 58%",
        } as React.CSSProperties
      }
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-sm text-white/80">
            📈 Utilisation du Chatbot
          </CardTitle>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!data || loading ? (
          <div className="mt-3 h-12 rounded-lg bg-white/5" />
        ) : (
          <ChartKpis
            items={[
              {
                label: "Pic de conversations",
                value: data.kpi.peak_conversations,
              },
              {
                label: "Moyenne messages/jour",
                value: data.kpi.avg_messages_per_day,
              },
              {
                label: "Croissance",
                value: `${data.kpi.growth_percent}%`,
                tone: data.kpi.growth_percent >= 0 ? "good" : "bad",
              },
            ]}
          />
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="line" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 rounded-lg p-1">
            {["line", "bar", "area"].map((v, i) => (
              <TabsTrigger
                key={v}
                value={v}
                className={[
                  "px-3 py-1.5 rounded-md text-[13px] font-medium",
                  "text-white/70 hover:text-white transition-colors",
                  "data-[state=active]:text-white",
                  "data-[state=active]:bg-white/10",
                  "data-[state=active]:border data-[state=active]:border-white/20",
                ].join(" ")}
              >
                {v === "line" ? "Ligne" : v === "bar" ? "Barres" : "Aire"}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* LINE */}
          <TabsContent value="line" className="mt-3">
            <ChartContainer className="h-[280px]">
              {!data || loading ? (
                <div className="h-full grid place-items-center text-white/60">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Chargement…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid stroke={gridLine} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={axisTick}
                      axisLine={axisLine}
                    />
                    <YAxis
                      tick={axisTick}
                      axisLine={axisLine}
                      allowDecimals={false}
                      domain={[0, "dataMax + 2"]}
                    />
                    <Legend wrapperStyle={legendStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="conversations"
                      stroke={C2}
                      strokeWidth={3}
                      strokeOpacity={1}
                      dot={{ r: 2 }}
                      name="Conversations"
                    />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      stroke={C1}
                      strokeWidth={3}
                      dot={false}
                      name="Messages"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          </TabsContent>

          {/* BAR */}
          <TabsContent value="bar" className="mt-3">
            <ChartContainer className="h-[280px]">
              {!data || loading ? (
                <div className="h-full grid place-items-center text-white/60">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Chargement…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid stroke={gridLine} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={axisTick}
                      axisLine={axisLine}
                    />
                    <YAxis
                      tick={axisTick}
                      axisLine={axisLine}
                      allowDecimals={false}
                    />
                    <Legend wrapperStyle={legendStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey="conversations"
                      fill={C2}
                      name="Conversations"
                      radius={[6, 6, 0, 0]}
                    >
                      <LabelList
                        dataKey="conversations"
                        position="top"
                        fill="#fff"
                        formatter={(v: any) => v ?? ""}
                      />
                    </Bar>
                    <Bar
                      dataKey="messages"
                      fill={C1}
                      name="Messages"
                      radius={[6, 6, 0, 0]}
                    >
                      <LabelList
                        dataKey="messages"
                        position="top"
                        fill="#fff"
                        formatter={(v: any) => v ?? ""}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          </TabsContent>

          {/* AREA */}
          <TabsContent value="area" className="mt-3">
            <ChartContainer className="h-[280px]">
              {!data || loading ? (
                <div className="h-full grid place-items-center text-white/60">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Chargement…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid stroke={gridLine} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={axisTick}
                      axisLine={axisLine}
                    />
                    <YAxis
                      tick={axisTick}
                      axisLine={axisLine}
                      allowDecimals={false}
                    />
                    <Legend wrapperStyle={legendStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C1} stopOpacity={0.9} />
                        <stop offset="95%" stopColor={C1} stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C2} stopOpacity={0.9} />
                        <stop offset="95%" stopColor={C2} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="conversations"
                      stroke={C2}
                      fill={C2}
                      fillOpacity={0.25}
                      name="Conversations"
                    />
                    <Area
                      type="monotone"
                      dataKey="messages"
                      stroke={C1}
                      fill={C1}
                      fillOpacity={0.25}
                      name="Messages"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          </TabsContent>
        </Tabs>

        {/* Bottom row: radial gauge + sparklines */}
        <div className="grid md:grid-cols-3 gap-3">
          {/* Radial gauge */}
          <ChartContainer className="h-[200px] md:col-span-1">
            <ChartTitle>Croissance vs période précédente</ChartTitle>
            {!data || loading ? (
              <div className="h-[150px] grid place-items-center text-white/60">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" /> …
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <RadialBarChart
                  innerRadius="65%"
                  outerRadius="100%"
                  data={[
                    {
                      name: "Croissance",
                      value: Math.max(
                        -100,
                        Math.min(100, data.kpi.growth_percent)
                      ),
                    },
                  ]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: "rgba(255,255,255,.08)" }}
                    dataKey="value"
                    fill={
                      data.kpi.growth_percent >= 0
                        ? "hsl(145 80% 45%)"
                        : "hsl(0 70% 55%)"
                    }
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white text-lg"
                  >
                    {data.kpi.growth_percent}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>

          {/* Sparkline Messages */}
          <ChartContainer className="h-[200px] md:col-span-1">
            <ChartTitle>Trend — Messages</ChartTitle>
            {!data || loading ? (
              <div className="h-[150px] grid place-items-center text-white/60">
                —
              </div>
            ) : !hasValues(series, "messages") ? (
              <div className="h-[150px] grid place-items-center text-white/60">
                Aucune donnée sur la période
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart
                  data={series}
                  margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
                >
                  <XAxis dataKey="label" tick={axisTick} axisLine={axisLine} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke={C1}
                    strokeWidth={SPARK_STROKE_WIDTH}
                    fill={C1}
                    fillOpacity={SPARK_FILL_OPACITY}
                    isAnimationActive={false}
                    dot={false}
                    name="Messages"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>

          {/* Sparkline Conversations */}
          <ChartContainer className="h-[200px] md:col-span-1">
            <ChartTitle>Trend — Conversations</ChartTitle>
            {!data || loading ? (
              <div className="h-[150px] grid place-items-center text-white/60">
                —
              </div>
            ) : !hasValues(series, "conversations") ? (
              <div className="h-[150px] grid place-items-center text-white/60">
                Aucune donnée sur la période
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart
                  data={series}
                  margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
                >
                  <XAxis dataKey="label" tick={axisTick} axisLine={axisLine} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="conversations"
                    stroke={C2}
                    strokeWidth={SPARK_STROKE_WIDTH}
                    fill={C2}
                    fillOpacity={SPARK_FILL_OPACITY}
                    isAnimationActive={false}
                    dot={false}
                    name="Conversations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
