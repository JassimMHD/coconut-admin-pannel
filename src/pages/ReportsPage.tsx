import { useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDailySummary, useProfitabilityReport, useSalesReport } from "@/hooks/api/useReports";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState("7");
  const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  const { data: dailyData, isLoading: dailyLoading } = useDailySummary(format(new Date(), 'yyyy-MM-dd'));
  const { data: profitData, isLoading: profitLoading } = useProfitabilityReport({ startDate, endDate });
  const { data: salesData, isLoading: salesLoading } = useSalesReport({ startDate, endDate });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const daily = dailyData;
  const profit = profitData;
  const sales = salesData;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports" 
        description="Business analytics, profitability, and daily summaries" 
        icon={BarChart3}
        action={
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList>
          <TabsTrigger value="daily">Daily Summary</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
        </TabsList>

        {/* Daily Summary Tab */}
        <TabsContent value="daily" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailyLoading ? (
              [...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : daily ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Batches Received</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{daily.batchesReceived}</div>
                    <p className="text-xs text-muted-foreground">{daily.totalCoconuts?.toLocaleString()} coconuts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Processing Operations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{daily.processingCompleted}</div>
                    <p className="text-xs text-muted-foreground">{daily.processingOutput?.toLocaleString()} units output</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Sales Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(daily.salesTotal || 0)}</div>
                    <p className="text-xs text-muted-foreground">{daily.ordersCount} orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Expenses Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(daily.expensesTotal || 0)}</div>
                    <p className="text-xs text-muted-foreground">{daily.expensesCount} expenses</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="col-span-4">
                <CardContent className="text-center py-8 text-muted-foreground">
                  No data available for today.
                </CardContent>
              </Card>
            )}
          </div>

          {daily?.recentActivities && daily.recentActivities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {daily.recentActivities.map((activity: any, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Profitability Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profitLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : profit ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" /> Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">{formatCurrency(profit.totalRevenue || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-destructive" /> Costs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">{formatCurrency(profit.totalCosts || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn("text-2xl font-bold", (profit.netProfit || 0) >= 0 ? "text-success" : "text-destructive")}>
                      {formatCurrency(profit.netProfit || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {profit.profitMargin?.toFixed(1)}% margin
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="col-span-3">
                <CardContent className="text-center py-8 text-muted-foreground">
                  No profitability data available.
                </CardContent>
              </Card>
            )}
          </div>

          {profit?.byProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profit by Product</CardTitle>
                <CardDescription>Breakdown of profitability by product type</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profit.byProduct.map((item: any) => (
                      <TableRow key={item.product}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.cost)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.profit)}</TableCell>
                        <TableCell className="text-right">{item.margin.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sales Report Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {salesLoading ? (
              [...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))
            ) : sales ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{sales.totalOrders}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(sales.totalRevenue || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(sales.averageOrderValue || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">{formatCurrency(sales.pendingPayments || 0)}</div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="col-span-4">
                <CardContent className="text-center py-8 text-muted-foreground">
                  No sales data available.
                </CardContent>
              </Card>
            )}
          </div>

          {sales?.topCustomers && sales.topCustomers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Customers</CardTitle>
                <CardDescription>Customers with highest order values</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.topCustomers.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-right">{customer.orderCount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(customer.totalValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
