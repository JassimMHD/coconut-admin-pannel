import { useState } from "react";
import { Package, Plus, Search, Filter, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useBatches, useCreateBatch, useUpdateBatch, useDeleteBatch } from "@/hooks/api/useBatches";
import { useSuppliers } from "@/hooks/api/useSuppliers";
import type { CoconutBatch, CreateBatchData, QualityGrade } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const batchSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  receivedDate: z.string().min(1, "Date is required"),
  totalQuantity: z.coerce.number().min(1, "Total quantity is required"),
  goodQuantity: z.coerce.number().min(0, "Good quantity is required"),
  badQuantity: z.coerce.number().min(0, "Bad quantity is required"),
  qualityGrade: z.enum(["A", "B", "C", "MIXED"] as const),
  pricePerUnit: z.coerce.number().min(0, "Price is required"),
  notes: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

const statusColors: Record<string, string> = {
  PENDING: "bg-info/10 text-info border-info/20",
  PROCESSING: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

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
      qualityGrade: "A",
      receivedDate: new Date().toISOString().split('T')[0],
    },
  });

  const batches = data?.data || [];
  const suppliers = suppliersData?.data || [];

  const openCreateDialog = () => {
    setEditingBatch(null);
    reset({
      supplierId: "",
      receivedDate: new Date().toISOString().split('T')[0],
      totalQuantity: 0,
      goodQuantity: 0,
      badQuantity: 0,
      qualityGrade: "A",
      pricePerUnit: 0,
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (batch: CoconutBatch) => {
    setEditingBatch(batch);
    reset({
      supplierId: batch.supplierId,
      receivedDate: batch.receivedDate.split('T')[0],
      totalQuantity: batch.totalQuantity,
      goodQuantity: batch.goodQuantity,
      badQuantity: batch.badQuantity,
      qualityGrade: batch.qualityGrade,
      pricePerUnit: batch.pricePerUnit,
      notes: batch.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: BatchFormData) => {
    const data: CreateBatchData = {
      supplierId: formData.supplierId,
      receivedDate: formData.receivedDate,
      totalQuantity: formData.totalQuantity,
      goodQuantity: formData.goodQuantity,
      badQuantity: formData.badQuantity,
      qualityGrade: formData.qualityGrade as QualityGrade,
      pricePerUnit: formData.pricePerUnit,
      notes: formData.notes || undefined,
    };

    if (editingBatch) {
      await updateMutation.mutateAsync({ id: editingBatch.id, data });
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
        title="Coconut Batches"
        description="Manage incoming coconut batches and grading"
        icon={Package}
        action={
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> New Batch
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search batches..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-3.5 w-3.5" /> Filter
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Batch Code</TableHead>
              <TableHead className="text-xs">Supplier</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs text-right">Total</TableHead>
              <TableHead className="text-xs text-right">Good</TableHead>
              <TableHead className="text-xs text-right">Bad</TableHead>
              <TableHead className="text-xs text-right">Cost</TableHead>
              <TableHead className="text-xs">Grade</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(10)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No batches found. Create your first batch to get started.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((b) => (
                <TableRow key={b.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm font-medium">{b.batchNumber}</TableCell>
                  <TableCell className="text-sm">{b.supplier?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(b.receivedDate), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell className="text-sm text-right font-medium">{b.totalQuantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right">{b.goodQuantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right">{b.badQuantity}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(b.totalCost)}</TableCell>
                  <TableCell className="text-sm">{b.qualityGrade}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", statusColors[b.status] || statusColors.PENDING)}>
                      {b.status}
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
              {editingBatch ? 'Update batch information.' : 'Record a new coconut batch arrival.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplierId">Supplier *</Label>
                  <Controller
                    name="supplierId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.supplierId && <p className="text-sm text-destructive">{errors.supplierId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivedDate">Date *</Label>
                  <Input type="date" {...register("receivedDate")} />
                  {errors.receivedDate && <p className="text-sm text-destructive">{errors.receivedDate.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalQuantity">Total Qty *</Label>
                  <Input type="number" {...register("totalQuantity")} />
                  {errors.totalQuantity && <p className="text-sm text-destructive">{errors.totalQuantity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goodQuantity">Good Qty *</Label>
                  <Input type="number" {...register("goodQuantity")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badQuantity">Bad Qty *</Label>
                  <Input type="number" {...register("badQuantity")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qualityGrade">Quality Grade *</Label>
                  <Controller
                    name="qualityGrade"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Grade A</SelectItem>
                          <SelectItem value="B">Grade B</SelectItem>
                          <SelectItem value="C">Grade C</SelectItem>
                          <SelectItem value="MIXED">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerUnit">Price/Unit (₹) *</Label>
                  <Input type="number" step="0.01" {...register("pricePerUnit")} />
                  {errors.pricePerUnit && <p className="text-sm text-destructive">{errors.pricePerUnit.message}</p>}
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
