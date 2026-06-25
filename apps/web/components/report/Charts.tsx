"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatIDR, formatNumber } from "@/lib/format";

const COLORS = ["#2563eb", "#d97706", "#059669", "#dc2626", "#7c3aed"];

interface MonthlyTrendData {
  period: string;
  type: string;
  total: number;
}

export function MonthlyTrendChart({ data }: { data: MonthlyTrendData[] }) {
  // Pivot: { period: string, PO: number, FAKTUR: number, ... }
  const pivoted: Record<string, any> = {};
  for (const d of data) {
    if (!pivoted[d.period]) pivoted[d.period] = { period: d.period };
    pivoted[d.period][d.type] = d.total;
  }
  const chartData = Object.values(pivoted).sort((a: any, b: any) =>
    a.period.localeCompare(b.period),
  );

  // Get unique types
  const types = Array.from(new Set(data.map((d) => d.type)));

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="period" stroke="var(--text-muted)" fontSize={11} />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            tickFormatter={(v) => formatIDR(v, false).replace(/,/g, ".")}
          />
          <Tooltip
            formatter={(value: number) => formatIDR(value)}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Legend />
          {types.map((t, i) => (
            <Line
              key={t}
              type="monotone"
              dataKey={t}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface VendorData {
  code: string;
  name: string;
  total: number;
}

export function TopVendorsChart({ data }: { data: VendorData[] }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            type="number"
            stroke="var(--text-muted)"
            fontSize={11}
            tickFormatter={(v) => formatIDR(v, false).replace(/,/g, ".")}
          />
          <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={140} />
          <Tooltip
            formatter={(value: number) => formatIDR(value)}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Bar dataKey="total" fill="#2563eb" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ProductData {
  name: string;
  qty: number;
}

export function TopProductsChart({ data }: { data: ProductData[] }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
          <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} width={140} />
          <Tooltip
            formatter={(value: number) => formatNumber(value)}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Bar dataKey="qty" fill="#d97706" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}