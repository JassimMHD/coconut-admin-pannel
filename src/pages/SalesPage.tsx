import { useState } from "react";
import { ShoppingCart, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2, PlusCircle, MinusCircle } from "lucide-react";
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
import { useSalesOrders, useCreateSalesOrder, useDeleteSalesOrder } from "@/hooks/api/useSales";
import { useCustomers } from "@/hooks/api/useCustomers";
import type { SalesOrder, CreateSalesOrderData, SalesOrderItemInput, ProductType, ByproductType, UnitOfMeasure } from "@/types/api.types";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Backend createOrderSchema requires:
 * - customerId (cuid, required)
 * - items (array, min 1 item, required)
 *   Each item: itemType ('PRODUCT'|'BYPRODUCT'), productType or byproductType, description (required), quantity, unit, unitPrice
 * Optional order fields: orderDate, expectedDelivery, discountPercent, taxPercent, dueDate, shippingAddress, notes
 */
const orderItemSchema = z.object({
  itemType: z.enum(["PRODUCT", "BYPRODUCT"] as const),
  productType: z.string().optional(),
  byproductType: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity required"),
  unit: z.enum(["KG", "LITRE", "PIECE", "TONNE", "GALLON"] as const),
  unitPrice: z.coerce.number().min(0, "Unit price required"),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
});

const salesSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderDate: z.string().optional(),
  expectedDelivery: z.string().optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  taxPercent: z.coerce.number().min(0).optional(),
  dueDate: z.string().optional(),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

type SalesFormData = z.infer<typeof salesSchema>;

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  CONFIRMED: "bg-primary/10 text-primary border-primary/20",
  PROCESSING: "bg-warning/10 text-warning border-warning/20",
  READY: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  SHIPPED: "bg-info/10 text-info border-info/20",
  DELIVERED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const paymentColors: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  PARTIAL: "bg-info/10 text-info border-info/20",
  PAID: "bg-success/10 text-success border-success/20",
  OVERDUE: "bg-destructive/10 text-destructive border-destructive/20",
};

// Backend ProductType and ByproductType enums
const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "OIL", label: "Coconut Oil" },
  { value: "COPRA", label: "Copra" },
  { value: "DESICCATED_COCONUT", label: "Desiccated Coconut" },
  { value: "COCONUT_MILK", label: "Coconut Milk" },
  { value: "COCONUT_CREAM", label: "Coconut Cream" },
  { value: "COCONUT_WATER", label: "Coconut Water" },
  { value: "VIRGIN_COCONUT_OIL", label: "Virgin Coconut Oil" },
];

const BYPRODUCT_TYPES: { value: ByproductType; label: string }[] = [
  { value: "HUSK", label: "Husk" },
  { value: "SHELL", label: "Shell" },
  { value: "COIR", label: "Coir" },
  { value: "PITH", label: "Pith" },
  { value: "SHELL_CHARCOAL", label: "Shell Charcoal" },
];

const UNITS: UnitOfMeasure[] = ["KG", "LITRE", "PIECE", "TONNE", "GALLON"];

const SalesPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useSalesOrders({ search, page, limit: 20 });
  const { data: customersData } = useCustomers({ limit: 100 });
  const createMutation = useCreateSalesOrder();
  const deleteMutation = useDeleteSalesOrder();

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<SalesFormData>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      customerId: "",
      orderDate: new Date().toISOString().split('T')[0],
      discountPercent: 0,
      taxPercent: 0,
      items: [{ itemType: "PRODUCT", productType: "OIL", description: "", quantity: 1, unit: "KG", unitPrice: 0, discountPercent: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");

  const orders = data?.data || [];
  const customers = customersData?.data || [];

  const openCreateDialog = () => {
    reset({
      customerId: "",
      orderDate: new Date().toISOString().split('T')[0],
      discountPercent: 0,
      taxPercent: 0,
      items: [{ itemType: "PRODUCT", productType: "OIL", description: "", quantity: 1, unit: "KG", unitPrice: 0, discountPercent: 0 }],
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: SalesFormData) => {
    const items: SalesOrderItemInput[] = formData.items.map((item) => ({
      itemType: item.itemType,
      productType: item.itemType === "PRODUCT" ? (item.productType as ProductType) : undefined,
      byproductType: item.itemType === "BYPRODUCT" ? (item.byproductType as ByproductType) : undefined,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit as UnitOfMeasure,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent || undefined,
    }));

    const payload: CreateSalesOrderData = {
      customerId: formData.customerId,
      orderDate: formData.orderDate ? new Date(formData.orderDate).toISOString() : undefined,
      expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery).toISOString() : undefined,
      discountPercent: formData.discountPercent || undefined,
      taxPercent: formData.taxPercent || undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      shippingAddress: formData.shippingAddress || undefined,
      notes: formData.notes || undefined,
      items,
    };

    await createMutation.mutateAsync(payload);
    setIsDialogOpen(false);
    reset();
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

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
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs text-right">Total</TableHead>
              <TableHead className="text-xs text-right">Balance Due</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Payment</TableHead>
              <TableHead className="text-xs w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No sales orders found. Create your first order to get started.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm font-medium">{order.orderNumber}</TableCell>
                  <TableCell className="text-sm">{order.customer?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.orderDate ? format(new Date(order.orderDate), 'yyyy-MM-dd') : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                  {/* Backend uses balanceDue, not (totalAmount - paidAmount) */}
                  <TableCell className="text-sm text-right">{formatCurrency(order.balanceDue)}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", statusColors[order.status] || statusColors.DRAFT)}>
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

      {/* Create Dialog — multi-item order form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Sales Order</DialogTitle>
            <DialogDescription>Create a new sales order with one or more items.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto pr-1">
              {/* Order Header */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer *</Label>
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
                  {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Order Date</Label>
                  <Input type="date" {...register("orderDate")} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Discount (%)</Label>
                  <Input type="number" step="0.01" {...register("discountPercent")} />
                </div>
                <div className="space-y-2">
                  <Label>Tax (%)</Label>
                  <Input type="number" step="0.01" {...register("taxPercent")} />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" {...register("dueDate")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Shipping Address</Label>
                <Input {...register("shippingAddress")} />
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Order Items *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 h-7 text-xs"
                    onClick={() => append({ itemType: "PRODUCT", productType: "OIL", description: "", quantity: 1, unit: "KG", unitPrice: 0, discountPercent: 0 })}
                  >
                    <PlusCircle className="h-3 w-3" /> Add Item
                  </Button>
                </div>

                {errors.items && !Array.isArray(errors.items) && (
                  <p className="text-xs text-destructive">{errors.items.message}</p>
                )}

                {fields.map((field, index) => {
                  const itemType = watchedItems?.[index]?.itemType;
                  return (
                    <div key={field.id} className="border border-border rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(index)}>
                            <MinusCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Item Type</Label>
                          <Controller
                            name={`items.${index}.itemType`}
                            control={control}
                            render={({ field: f }) => (
                              <Select onValueChange={f.onChange} value={f.value}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PRODUCT">Product</SelectItem>
                                  <SelectItem value="BYPRODUCT">Byproduct</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        {itemType === "PRODUCT" ? (
                          <div className="space-y-1">
                            <Label className="text-xs">Product Type</Label>
                            <Controller
                              name={`items.${index}.productType`}
                              control={control}
                              render={({ field: f }) => (
                                <Select onValueChange={f.onChange} value={f.value || ""}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select product" /></SelectTrigger>
                                  <SelectContent>
                                    {PRODUCT_TYPES.map((pt) => (
                                      <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Label className="text-xs">Byproduct Type</Label>
                            <Controller
                              name={`items.${index}.byproductType`}
                              control={control}
                              render={({ field: f }) => (
                                <Select onValueChange={f.onChange} value={f.value || ""}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select byproduct" /></SelectTrigger>
                                  <SelectContent>
                                    {BYPRODUCT_TYPES.map((bp) => (
                                      <SelectItem key={bp.value} value={bp.value}>{bp.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Description *</Label>
                        <Input className="h-8 text-xs" {...register(`items.${index}.description`)} placeholder="Item description" />
                        {errors.items?.[index]?.description && (
                          <p className="text-xs text-destructive">{errors.items[index]?.description?.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Quantity *</Label>
                          <Input className="h-8 text-xs" type="number" step="0.01" {...register(`items.${index}.quantity`)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Unit *</Label>
                          <Controller
                            name={`items.${index}.unit`}
                            control={control}
                            render={({ field: f }) => (
                              <Select onValueChange={f.onChange} value={f.value}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Unit Price (₹) *</Label>
                          <Input className="h-8 text-xs" type="number" step="0.01" {...register(`items.${index}.unitPrice`)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Disc. %</Label>
                          <Input className="h-8 text-xs" type="number" step="0.01" {...register(`items.${index}.discountPercent`)} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea {...register("notes")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Order
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
