import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  UserCheck,
  Cog,
  Factory,
  ShoppingCart,
  Warehouse,
  Receipt,
  BarChart3,
  ChevronLeft,
  Palmtree,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/batches", icon: Package, label: "Batches" },
  { to: "/suppliers", icon: Users, label: "Suppliers" },
  { to: "/customers", icon: UserCheck, label: "Customers" },
  { to: "/processing", icon: Cog, label: "Processing" },
  { to: "/manufacturing", icon: Factory, label: "Manufacturing" },
  { to: "/inventory", icon: Warehouse, label: "Inventory" },
  { to: "/sales", icon: ShoppingCart, label: "Sales Orders" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

export const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[250px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
          <Palmtree className="h-5 w-5 text-sidebar-primary" />
        </div>
        {!collapsed && (
          <div className="animate-slide-in-left">
            <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground">CocoAdmin</h1>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">Business Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.to === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-sidebar-primary")} />
                {!collapsed && <span className="animate-slide-in-left">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex h-12 items-center justify-center border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
};
