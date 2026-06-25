import * as Icons from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./StatCard.module.css";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: string;
}

export function StatCard({ label, value, change, changeType = "neutral", icon }: StatCardProps) {
  const Icon = (Icons as any)[icon] || Icons.BarChart3;
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <div className={styles.iconBox}>
          <Icon size={20} />
        </div>
        {change && (
          <div className={cn(styles.change, styles[`change_${changeType}`])}>
            {changeType === "up" && <Icons.TrendingUp size={12} />}
            {changeType === "down" && <Icons.TrendingDown size={12} />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}