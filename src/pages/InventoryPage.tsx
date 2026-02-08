import { useState } from "react";
import { Warehouse, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
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
import { useInventory, useCreateInventory, useUpdateInventory, useDeleteInventory, useInventorySummary } from "@/hooks/api/useInventory";
import type { Inventory, CreateInventoryData, ProductType, InventoryCategory } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const inventorySchema = z.object({
  productType: z.enum(["COCONUT_OIL", "COPRA", "COCONUT_MILK", "DESICCATED_COCONUT", "COIR", "SHELL_CHARCOAL", "RAW_COCONUT", "HUSK", "SHELL"] as const),
  category: z.enum(["RAW_MATERIAL", "FINISHED_PRODUCT", "BYPRODUCT"] as const),
  quantity: z.coerce.number().min(0, "Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  unitCost: z.coerce.number().min(0, "Unit cost must be positive"),
  reorderLevel: z.coerce.number().min(0).optional(),
  warehouseLocation: z.string().optional(),
  notes: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

const categoryColors: Record<string, string> = {
  RAW_MATERIAL: "bg-info/10 text-info border-info/20",
  FINISHED_PRODUCT: "bg-success/10 text-success border-success/20",
  BYPRODUCT: "bg-warning/10 text-warning border-warning/20",
};

const productTypeLabels: Record<string, string> = {
  COCONUT_OIL: "Coconut Oil",
  COPRA: "Copra",
  COCONUT_MILK: "Coconut Milk",
  DESICCATED_COCONUT: "Desiccated Coconut",
  COIR: "Coir",
  SHELL_CHARCOAL: "Shell Charcoal",
  RAW_COCONUT: "Raw Coconut",
  HUSK: "Husk",
  SHELL: "Shell",
};

const InventoryPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useInventory({ search, page, limit: 20 });
  const { data: summaryData } = useInventorySummary();
  const createMutation = useCreateInventory();
  const updateMutation = useUpdateInventory();
  const deleteMutation = useDeleteInventory();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: { productType: "RAW_COCONUT", category: "RAW_MATERIAL", unit: "kg" },
  });

  const items = data?.data || [];
  const summary = summaryData?.data;

  const openCreateDialog = () => {
    setEditingItem(null);
    reset({ productType: "RAW_COCONUT", category: "RAW_MATERIAL", quantity: 0, unit: "kg", unitCost: 0, reorderLevel: 0, warehouseLocation: "", notes: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Inventory) => {
    setEditingItem(item);
    reset({
      productType: item.productType as any,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitCost: item.unitCost,
      reorderLevel: item.reorderLevel || 0,
      warehouseLocation: item.warehouseLocation || "",
      notes: item.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: InventoryFormData) => {
    const data: CreateInventoryData = {
      productType: formData.productType as ProductType,
      category: formData.category as InventoryCategory,
      quantity: formData.quantity,
      unit: formData.unit,
      unitCost: formData.unitCost,
      reorderLevel: formData.reorderLevel || undefined,
      warehouseLocation: formData.warehouseLocation || undefined,
      notes: formData.notes || undefined,
    };

    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data });
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
        title="Inventory" 
        description="Track stock levels for coconuts, products, and byproducts" 
        icon={Warehouse}
        action={<Button className="gap-2" onClick={openCreateDialog}><Plus className="h-4 w-4" /> Add Item</Button>}
      />

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-destructive" /> Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{summary.lowStockCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success" /> In Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{summary.inStockCount}</div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search inventory..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Product</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs text-right">Quantity</TableHead>
              <TableHead className="text-xs">Unit</TableHead>
              <TableHead className="text-xs text-right">Unit Cost</TableHead>
              <TableHead className="text-xs text-right">Total Value</TableHead>
              <TableHead className="text-xs">Location</TableHead>
              <TableHead className="text-xs w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No inventory items found. Add items to track your stock.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className={cn("cursor-pointer", item.quantity <= (item.reorderLevel || 0) && "bg-destructive/5")}>
                  <TableCell className="text-sm font-medium">{productTypeLabels[item.productType] || item.productType}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", categoryColors[item.category])}>
                      {item.category.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-right font-medium">{item.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{item.unit}</TableCell>
                  <TableCell className="text-sm text-right">{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(item.totalValue)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.warehouseLocation || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(item)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(item.id)} className="text-destructive">
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
            <DialogTitle>{editingItem ? 'Edit Inventory' : 'Add Inventory'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update inventory item details.' : 'Add a new inventory item.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type *</Label>
                  <Controller
                    name="productType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RAW_COCONUT">Raw Coconut</SelectItem>
                          <SelectItem value="COCONUT_OIL">Coconut Oil</SelectItem>
                          <SelectItem value="COPRA">Copra</SelectItem>
                          <SelectItem value="COCONUT_MILK">Coconut Milk</SelectItem>
                          <SelectItem value="DESICCATED_COCONUT">Desiccated Coconut</SelectItem>
                          <SelectItem value="COIR">Coir</SelectItem>
                          <SelectItem value="SHELL_CHARCOAL">Shell Charcoal</SelectItem>
                          <SelectItem value="HUSK">Husk</SelectItem>
                          <SelectItem value="SHELL">Shell</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                          <SelectItem value="FINISHED_PRODUCT">Finished Product</SelectItem>
                          <SelectItem value="BYPRODUCT">Byproduct</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input type="number" {...register("quantity")} />
                  {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input {...register("unit")} placeholder="kg, liters, pcs" />
                  {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Unit Cost (₹) *</Label>
                  <Input type="number" step="0.01" {...register("unitCost")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reorderLevel">Reorder Level</Label>
                  <Input type="number" {...register("reorderLevel")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouseLocation">Location</Label>
                  <Input {...register("warehouseLocation")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea {...register("notes")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this inventory item? This action cannot be undone.
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

export default InventoryPage;
