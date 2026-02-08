import { useNavigate } from "react-router-dom";
import { Package, Users, Factory, ShoppingCart, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  { label: "New Batch", icon: Package, to: "/batches", color: "bg-primary/10 text-primary" },
  { label: "Add Supplier", icon: Users, to: "/suppliers", color: "bg-accent/10 text-accent" },
  { label: "Start Processing", icon: Factory, to: "/processing", color: "bg-info/10 text-info" },
  { label: "Create Order", icon: ShoppingCart, to: "/sales", color: "bg-success/10 text-success" },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full">
      <h3 className="text-base font-semibold font-heading mb-1">Quick Actions</h3>
      <p className="text-xs text-muted-foreground mb-4">Common operations</p>
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.to)}
            className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-all hover:bg-muted/50 hover:border-primary/20"
          >
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", action.color)}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
