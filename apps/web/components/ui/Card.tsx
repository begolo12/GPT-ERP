import { cn } from "@/lib/cn";
import styles from "./Card.module.css";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(styles.card, className)}>{children}</div>;
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(styles.header, className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn(styles.title, className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(styles.content, className)}>{children}</div>;
}