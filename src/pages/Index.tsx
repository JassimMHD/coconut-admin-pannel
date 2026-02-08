import {
  Package,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RecentBatches } from "@/components/dashboard/RecentBatches";
import { ProductionChart } from "@/components/dashboard/ProductionChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useDashboardOverview, useQuickStats, useAlerts } from "@/hooks/api/useDashboard";
import { useRecentBatches } from "@/hooks/api/useBatches";
import { useSupplierStats } from "@/hooks/api/useSuppliers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useDashboardOverview();
  const { data: recentBatches, isLoading: batchesLoading } = useRecentBatches(5);
  const { data: supplierStats, isLoading: suppliersLoading } = useSupplierStats();
  const { data: alerts } = useAlerts();

  const isLoading = overviewLoading || batchesLoading || suppliersLoading;

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  if (overviewError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please check if the backend is running.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your coconut business operations</p>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <Alert 
              key={alert.id} 
              variant={alert.severity === 'error' ? 'destructive' : 'default'}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Today's Batches"
              value={String(overview?.todaysBatches ?? 0)}
              change={overview?.todaysBatches ? `${overview.todaysBatches} received today` : 'No batches today'}
              changeType={overview?.todaysBatches && overview.todaysBatches > 0 ? "positive" : "neutral"}
              icon={Package}
              delay={0}
            />
            <StatCard
              title="Today's Production"
              value={String(overview?.todaysProduction ?? 0)}
              change="Manufacturing output"
              changeType="neutral"
              icon={Warehouse}
              delay={100}
            />
            <StatCard
              title="Active Suppliers"
              value={String(supplierStats?.active ?? 0)}
              change={`${supplierStats?.total ?? 0} total suppliers`}
              changeType="positive"
              icon={Users}
              delay={200}
            />
            <StatCard
              title="Pending Orders"
              value={formatCurrency(overview?.todaysRevenue ?? 0)}
              change={`${overview?.pendingOrders ?? 0} orders pending`}
              changeType="neutral"
              icon={ShoppingCart}
              delay={300}
            />
          </>
        )}
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductionChart />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Batches */}
      <RecentBatches batches={recentBatches} isLoading={batchesLoading} />
    </div>
  );
};

export default Dashboard;
