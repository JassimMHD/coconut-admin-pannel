import { useState } from "react";
import { Warehouse, Loader2, ArrowRightLeft, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventoryOverview, useAdjustInventory } from "@/hooks/api/useInventory";
import type { AdjustInventoryData, ProductInventory, ByproductInventory, BatchInventory } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const adjustSchema = z.object({
  type: z.enum(["batch", "product", "byproduct"]),
  itemId: z.string().min(1, "Item is required"),
  adjustment: z.coerce.number().refine(val => val !== 0, "Adjustment cannot be 0"),
  reason: z.string().min(1, "Reason is required"),
  reference: z.string().optional(),
});

type AdjustFormData = z.infer<typeof adjustSchema>;

const productTypeLabels: Record<string, string> = {
  OIL: "Coconut Oil",
  COPRA: "Copra",
  DESICCATED_COCONUT: "Desiccated Coconut",
  COCONUT_MILK: "Coconut Milk",
  COCONUT_CREAM: "Coconut Cream",
  COCONUT_WATER: "Coconut Water",
  VIRGIN_COCONUT_OIL: "Virgin Coconut Oil",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
};

const InventoryPage = () => {
  const [search, setSearch] = useState("");
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"batch" | "product" | "byproduct">("product");

  const { data, isLoading } = useInventoryOverview();
  const adjustMutation = useAdjustInventory();

  const overview = data;
  const products = overview?.products || [];
  const byproducts = overview?.byproducts || [];
  const batches = overview?.batches || [];

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<AdjustFormData>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { type: "product", adjustment: 0 },
  });

  const watchType = watch("type");

  const openAdjustDialog = (type: "batch" | "product" | "byproduct", itemId?: string) => {
    setSelectedType(type);
    reset({
      type,
      itemId: itemId || "",
      adjustment: 0,
      reason: "",
      reference: "",
    });
    setIsAdjustOpen(true);
  };

  const onSubmit = async (formData: AdjustFormData) => {
    const payload: AdjustInventoryData = {
      type: formData.type,
      itemId: formData.itemId,
      adjustment: formData.adjustment,
      reason: formData.reason,
      reference: formData.reference || undefined,
    };

    await adjustMutation.mutateAsync(payload);
    setIsAdjustOpen(false);
    reset();
  };

  // Filter lists based on search
  const filteredProducts = products.filter(p => !search || p.productType.toLowerCase().includes(search.toLowerCase()));
  const filteredByproducts = byproducts.filter(b => !search || b.byproductConfig?.name.toLowerCase().includes(search.toLowerCase()));
  const filteredBatches = batches.filter(b => !search || b.batch?.batchCode.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory Tracking" 
        description="Monitor stock levels across raw materials, active batches, finished products, and byproducts" 
        icon={Warehouse}
        action={
          <Button className="gap-2" onClick={() => openAdjustDialog("product")}>
            <ArrowRightLeft className="h-4 w-4" /> Adjust Stock
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search inventory..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Finished Products</TabsTrigger>
          <TabsTrigger value="byproducts">Byproducts</TabsTrigger>
          <TabsTrigger value="batches">Raw Batches (Coconuts)</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Product Type</TableHead>
                  <TableHead className="text-xs text-right">Available Stock</TableHead>
                  <TableHead className="text-xs text-right">Reserved</TableHead>
                  <TableHead className="text-xs">Unit</TableHead>
                  <TableHead className="text-xs text-right">Avg Cost</TableHead>
                  <TableHead className="text-xs text-right">Total Value</TableHead>
                  <TableHead className="text-xs">Last Updated</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>{[...Array(8)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No products found systematically. Production output will update this table.</TableCell></TableRow>
                ) : (
                  filteredProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm font-medium">{productTypeLabels[p.productType] || p.productType}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{p.availableStock.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right text-muted-foreground">{p.reservedStock.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{p.unit}</TableCell>
                      <TableCell className="text-sm text-right">{formatCurrency(p.averageCost)}</TableCell>
                      <TableCell className="text-sm text-right font-medium text-success">{formatCurrency(p.totalValue)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(p.lastUpdated), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openAdjustDialog("product", p.id)}>
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="byproducts">
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Byproduct</TableHead>
                  <TableHead className="text-xs text-right">Total Stock</TableHead>
                  <TableHead className="text-xs">Unit</TableHead>
                  <TableHead className="text-xs text-right">Est. Avg Value</TableHead>
                  <TableHead className="text-xs">Last Updated</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(2)].map((_, i) => (
                    <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                  ))
                ) : filteredByproducts.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No byproducts found systematically.</TableCell></TableRow>
                ) : (
                  filteredByproducts.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="text-sm font-medium">{b.byproductConfig?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{b.totalStock.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{b.unit}</TableCell>
                      <TableCell className="text-sm text-right">{formatCurrency(b.averageCost)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(b.lastUpdated), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openAdjustDialog("byproduct", b.id)}>
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="batches">
           <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Batch Code</TableHead>
                  <TableHead className="text-xs">Grade</TableHead>
                  <TableHead className="text-xs text-right">Initial Stock</TableHead>
                  <TableHead className="text-xs text-right">Current Stock</TableHead>
                  <TableHead className="text-xs text-right">Processed / Sold</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                  ))
                ) : filteredBatches.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No active batch inventory tracking found.</TableCell></TableRow>
                ) : (
                  filteredBatches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-sm">{b.batch?.batchCode || 'Unknown'}</TableCell>
                      <TableCell className="text-sm">{b.grade}</TableCell>
                      <TableCell className="text-sm text-right text-muted-foreground">{b.initialStock.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right font-bold">{b.currentStock.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-right text-muted-foreground">{b.processedCount} / {b.soldCount}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openAdjustDialog("batch", b.id)}>
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Adjust Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Inventory</DialogTitle>
            <DialogDescription>
              Write off lost stock, record audit adjustments, or fix discrepancies manually.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
             <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Inventory Pool *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => { field.onChange(val); reset({ ...watch(), type: val as any, itemId: "" }) }} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Finished Product</SelectItem>
                        <SelectItem value="byproduct">Byproduct</SelectItem>
                        <SelectItem value="batch">Raw Batch</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Specific Item *</Label>
                <Controller
                  name="itemId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select target item..." /></SelectTrigger>
                      <SelectContent>
                        {watchType === "product" && products.map(p => (
                           <SelectItem key={p.id} value={p.id}>{productTypeLabels[p.productType] || p.productType} ({p.unit})</SelectItem>
                        ))}
                        {watchType === "byproduct" && byproducts.map(b => (
                           <SelectItem key={b.id} value={b.id}>{b.byproductConfig?.name} ({b.unit})</SelectItem>
                        ))}
                        {watchType === "batch" && batches.map(b => (
                           <SelectItem key={b.id} value={b.id}>{b.batch?.batchCode} - {b.grade}</SelectItem>
                        ))}
                        {(watchType === "product" ? products : watchType === "byproduct" ? byproducts : batches).length === 0 && (
                          <SelectItem value="none" disabled>No items available to adjust</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.itemId && <p className="text-xs text-destructive">{errors.itemId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Adjustment (+/-) *</Label>
                <Input type="number" step="0.01" {...register("adjustment")} placeholder="e.g. -5 to reduce, 10 to increase" />
                {errors.adjustment && <p className="text-xs text-destructive">{errors.adjustment.message}</p>}
                <p className="text-xs text-muted-foreground">Use negative values to deduct lost or expired stock.</p>
              </div>

              <div className="space-y-2">
                <Label>Reason *</Label>
                <Input {...register("reason")} placeholder="e.g. Audited shortage" />
                {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
              </div>

               <div className="space-y-2">
                <Label>Reference Note / Document</Label>
                <Textarea {...register("reference")} placeholder="Optional audit link or note..." />
              </div>

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={adjustMutation.isPending}>
                {adjustMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirm Adjustment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
