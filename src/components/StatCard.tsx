import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export const StatCard = ({ title, value, change, changeType = "neutral", icon: Icon, iconColor, delay = 0 }: StatCardProps) => {
  return (
    <div
      className="rounded-xl border border-border bg-card p-5 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight font-heading">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconColor || "bg-primary/10")}>
          <Icon className={cn("h-5 w-5", iconColor ? "text-card-foreground" : "text-primary")} />
        </div>
      </div>
    </div>
  );
};
