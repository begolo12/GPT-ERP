import { cn } from "@/lib/cn";
import styles from "./Badge.module.css";

export type BadgeVariant = "draft" | "submitted" | "reviewed" | "approved" | "rejected" | "revised" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const LABEL: Record<BadgeVariant, string> = {
  draft: "Draft",
  submitted: "Submitted",
  reviewed: "Reviewed",
  approved: "Approved",
  rejected: "Rejected",
  revised: "Revised",
  neutral: "",
};

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[`v_${variant}`], className)}>
      {children ?? LABEL[variant]}
    </span>
  );
}