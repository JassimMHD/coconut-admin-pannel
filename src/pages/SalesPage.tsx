import { useState } from "react";
import { ShoppingCart, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2, Eye }  from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSalesOrders, useCreateSalesOrder, useUpdateSalesOrder, useDeleteSalesOrder } from "@/hooks/api/useSales";
import { useCustomers } from "@/hooks/api/useCustomers";
import type { SalesOrder, CreateSalesOrderData, ProductType, PaymentStatus } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const salesSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  productType: z.enum(["COCONUT_OIL", "COPRA", "COCONUT_MILK", "DESICCATED_COCONUT", "COIR", "SHELL_CHARCOAL"] as const),
  quantity: z.coerce.number().min(1, "Quantity is required"),
  unitPrice: z.coerce.number().min(0, "Unit price is required"),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"] as const).optional(),
  notes: z.string().optional(),
});

type SalesFormData = z.infer<typeof salesSchema>;

const statusColors: Record<string, string> = {
  PENDING: "bg-info/10 text-info border-info/20",
  CONFIRMED: "bg-primary/10 text-primary border-primary/20",
  PROCESSING: "bg-warning/10 text-warning border-warning/20",
  SHIPPED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  DELIVERED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const paymentColors: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  PARTIAL: "bg-info/10 text-info border-info/20",
  PAID: "bg-success/10 text-success border-success/20",
  OVERDUE: "bg-destructive/10 text-destructive border-destructive/20",
};

const productTypeLabels: Record<string, string> = {
  COCONUT_OIL: "Coconut Oil",
  COPRA: "Copra",
  COCONUT_MILK: "Coconut Milk",
  DESICCATED_COCONUT: "Desiccated Coconut",
  COIR: "Coir",
  SHELL_CHARCOAL: "Shell Charcoal",
};

const SalesPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useSalesOrders({ search, page, limit: 20 });
  const { data: customersData } = useCustomers({ limit: 100 });
  const createMutation = useCreateSalesOrder();
  const updateMutation = useUpdateSalesOrder();
  const deleteMutation = useDeleteSalesOrder();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<SalesFormData>({
    resolver: zodResolver(salesSchema),
    defaultValues: { productType: "COCONUT_OIL", paymentStatus: "PENDING" },
  });

  const orders = data?.data || [];
  const customers = customersData?.data || [];

  const openCreateDialog = () => {
    setEditingOrder(null);
    reset({ customerId: "", productType: "COCONUT_OIL", quantity: 0, unitPrice: 0, paymentStatus: "PENDING", notes: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (order: SalesOrder) => {
    setEditingOrder(order);
    reset({
      customerId: order.customerId,
      productType: order.productType as any,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      paymentStatus: order.paymentStatus,
      notes: order.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: SalesFormData) => {
    const data: CreateSalesOrderData = {
      customerId: formData.customerId,
      productType: formData.productType as ProductType,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      notes: formData.notes || undefined,
    };

    if (editingOrder) {
      await updateMutation.mutateAsync({ id: editingOrder.id, data: { ...data, paymentStatus: formData.paymentStatus as PaymentStatus } });
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsDialogOpen(false);
    reset();
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sales Orders" 
        description="Create and manage customer orders and invoicing" 
        icon={ShoppingCart}
        action={<Button className="gap-2" onClick={openCreateDialog}><Plus className="h-4 w-4" /> New Order</Button>}
      />
      
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search orders..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Order #</TableHead>
              <TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs">Product</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs text-right">Qty</TableHead>
              <TableHead className="text-xs text-right">Total</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Payment</TableHead>
              <TableHead className="text-xs w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(9)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No sales orders found. Create your first order to get started.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm font-medium">{order.orderNumber}</TableCell>
                  <TableCell className="text-sm">{order.customer?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-sm">{productTypeLabels[order.productType] || order.productType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(order.orderDate), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell className="text-sm text-right">{order.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", statusColors[order.status] || statusColors.PENDING)}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", paymentColors[order.paymentStatus] || paymentColors.PENDING)}>
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(order)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(order.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Edit Order' : 'New Order'}</DialogTitle>
            <DialogDescription>
              {editingOrder ? 'Update order details.' : 'Create a new sales order.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer *</Label>
                  <Controller
                    name="customerId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.customerId && <p className="text-sm text-destructive">{errors.customerId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productType">Product *</Label>
                  <Controller
                    name="productType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COCONUT_OIL">Coconut Oil</SelectItem>
                          <SelectItem value="COPRA">Copra</SelectItem>
                          <SelectItem value="COCONUT_MILK">Coconut Milk</SelectItem>
                          <SelectItem value="DESICCATED_COCONUT">Desiccated Coconut</SelectItem>
                          <SelectItem value="COIR">Coir</SelectItem>
                          <SelectItem value="SHELL_CHARCOAL">Shell Charcoal</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input type="number" {...register("quantity")} />
                  {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
                  <Input type="number" step="0.01" {...register("unitPrice")} />
                  {errors.unitPrice && <p className="text-sm text-destructive">{errors.unitPrice.message}</p>}
                </div>
              </div>
              {editingOrder && (
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Controller
                    name="paymentStatus"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="PARTIAL">Partial</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="OVERDUE">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea {...register("notes")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingOrder ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sales Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SalesPage;
