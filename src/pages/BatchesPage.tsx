import { useState } from "react";
import { Package, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2, Tag } from "lucide-react";
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
import { useBatches, useCreateBatch, useUpdateBatch, useDeleteBatch } from "@/hooks/api/useBatches";
import { useSuppliers } from "@/hooks/api/useSuppliers";
import type { CoconutBatch, CreateBatchData } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

/**
 * Backend createBatchSchema requires:
 * - supplierId (cuid, required)
 * - pickedDate (ISO datetime, required)
 * - initialQuantity (int, required)
 * - pricePerBig (float, required)
 * - pricePerSmall (float, required)
 * - pricePerCancelled, cancelledHandling, purchaseDate, receivedDate, notes (all optional)
 */
const batchSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  pickedDate: z.string().min(1, "Picked date is required"),
  purchaseDate: z.string().optional(),
  receivedDate: z.string().optional(),
  initialQuantity: z.coerce.number().int().min(1, "Initial quantity is required"),
  pricePerBig: z.coerce.number().min(0, "Price per big is required"),
  pricePerSmall: z.coerce.number().min(0, "Price per small is required"),
  pricePerCancelled: z.coerce.number().min(0).optional(),
  cancelledHandling: z.enum(["LOSS", "REDUCED_SALE"] as const).optional(),
  notes: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

const BatchesPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<CoconutBatch | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useBatches({ search, page, limit: 20 });
  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const createMutation = useCreateBatch();
  const updateMutation = useUpdateBatch();
  const deleteMutation = useDeleteBatch();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      cancelledHandling: "LOSS",
      pickedDate: new Date().toISOString().split('T')[0],
    },
  });

  const batches = data?.data || [];
  const suppliers = suppliersData?.data || [];

  const toISOString = (dateStr?: string) => {
    if (!dateStr) return undefined;
    return new Date(dateStr).toISOString();
  };

  const openCreateDialog = () => {
    setEditingBatch(null);
    reset({
      supplierId: "",
      pickedDate: new Date().toISOString().split('T')[0],
      purchaseDate: "",
      receivedDate: "",
      initialQuantity: 0,
      pricePerBig: 0,
      pricePerSmall: 0,
      pricePerCancelled: 0,
      cancelledHandling: "LOSS",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (batch: CoconutBatch) => {
    setEditingBatch(batch);
    reset({
      supplierId: batch.supplierId,
      pickedDate: batch.pickedDate?.split('T')[0] || "",
      purchaseDate: batch.purchaseDate?.split('T')[0] || "",
      receivedDate: batch.receivedDate?.split('T')[0] || "",
      initialQuantity: batch.initialQuantity,
      pricePerBig: batch.pricePerBig,
      pricePerSmall: batch.pricePerSmall,
      pricePerCancelled: batch.pricePerCancelled ?? 0,
      cancelledHandling: batch.cancelledHandling ?? "LOSS",
      notes: batch.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: BatchFormData) => {
    const payload: CreateBatchData = {
      supplierId: formData.supplierId,
      pickedDate: toISOString(formData.pickedDate) || new Date().toISOString(),
      purchaseDate: toISOString(formData.purchaseDate),
      receivedDate: toISOString(formData.receivedDate),
      initialQuantity: formData.initialQuantity,
      pricePerBig: formData.pricePerBig,
      pricePerSmall: formData.pricePerSmall,
      pricePerCancelled: formData.pricePerCancelled || undefined,
      cancelledHandling: formData.cancelledHandling,
      notes: formData.notes || undefined,
    };

    if (editingBatch) {
      await updateMutation.mutateAsync({ id: editingBatch.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
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
        title="Coconut Batches"
        description="Manage coconut procurement batches from suppliers"
        icon={Package}
        action={<Button className="gap-2" onClick={openCreateDialog}><Plus className="h-4 w-4" /> New Batch</Button>}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search batches..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Batch Code</TableHead>
              <TableHead className="text-xs">Supplier</TableHead>
              <TableHead className="text-xs">Picked Date</TableHead>
              <TableHead className="text-xs text-right">Initial Qty</TableHead>
              <TableHead className="text-xs text-right">Big / Small / Cancelled</TableHead>
              <TableHead className="text-xs text-right">Total Cost</TableHead>
              <TableHead className="text-xs">Status</TableHead>
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
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No batches found. Add your first batch to get started.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((b) => (
                <TableRow key={b.id} className="cursor-pointer">
                  {/* Backend field is batchCode, not batchNumber */}
                  <TableCell className="font-mono text-sm font-medium">{b.batchCode}</TableCell>
                  <TableCell className="text-sm">{b.supplier?.name || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {b.pickedDate ? format(new Date(b.pickedDate), 'yyyy-MM-dd') : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-right">{b.initialQuantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">
                    {b.isGraded ? `${b.bigCount} / ${b.smallCount} / ${b.cancelledCount}` : 'Not graded'}
                  </TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(b.totalBuyCost)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      b.isFullyProcessed
                        ? "bg-success/10 text-success border-success/20"
                        : b.isProcessed
                        ? "bg-primary/10 text-primary border-primary/20"
                        : b.isGraded
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {b.isFullyProcessed ? 'Processed' : b.isProcessed ? 'Partial' : b.isGraded ? 'Graded' : 'Pending'}
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
                        <DropdownMenuItem onClick={() => openEditDialog(b)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(b.id)} className="text-destructive">
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
            <DialogTitle>{editingBatch ? 'Edit Batch' : 'New Batch'}</DialogTitle>
            <DialogDescription>
              {editingBatch ? 'Update batch information.' : 'Record a new coconut procurement batch.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="supplierId">Supplier *</Label>
                <Controller
                  name="supplierId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.supplierId && <p className="text-xs text-destructive">{errors.supplierId.message}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="pickedDate">Picked Date *</Label>
                  <Input id="pickedDate" type="date" {...register("pickedDate")} />
                  {errors.pickedDate && <p className="text-xs text-destructive">{errors.pickedDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivedDate">Received Date</Label>
                  <Input id="receivedDate" type="date" {...register("receivedDate")} />
                </div>
              </div>

              {/* Initial Quantity */}
              <div className="space-y-2">
                <Label htmlFor="initialQuantity">Initial Quantity (coconuts) *</Label>
                <Input id="initialQuantity" type="number" {...register("initialQuantity")} placeholder="Total number of coconuts" />
                {errors.initialQuantity && <p className="text-xs text-destructive">{errors.initialQuantity.message}</p>}
              </div>

              {/* Prices */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="pricePerBig">Price / Big (₹) *</Label>
                  <Input id="pricePerBig" type="number" step="0.01" {...register("pricePerBig")} />
                  {errors.pricePerBig && <p className="text-xs text-destructive">{errors.pricePerBig.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerSmall">Price / Small (₹) *</Label>
                  <Input id="pricePerSmall" type="number" step="0.01" {...register("pricePerSmall")} />
                  {errors.pricePerSmall && <p className="text-xs text-destructive">{errors.pricePerSmall.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerCancelled">Price / Cancelled (₹)</Label>
                  <Input id="pricePerCancelled" type="number" step="0.01" {...register("pricePerCancelled")} />
                </div>
              </div>

              {/* Cancelled Handling */}
              <div className="space-y-2">
                <Label htmlFor="cancelledHandling">Cancelled Coconut Handling</Label>
                <Controller
                  name="cancelledHandling"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select handling" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOSS">Loss (write off)</SelectItem>
                        <SelectItem value="REDUCED_SALE">Reduced Sale Price</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" {...register("notes")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingBatch ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this batch? This action cannot be undone.
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

export default BatchesPage;
