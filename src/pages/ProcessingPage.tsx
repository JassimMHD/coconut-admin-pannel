import { useState } from "react";
import { Cog, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { useProcessingList, useCreateProcessing, useUpdateProcessing, useDeleteProcessing, useRemovalTypes } from "@/hooks/api/useProcessing";
import { useBatches } from "@/hooks/api/useBatches";
import type { Processing, CreateProcessingData, CoconutGrade } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasRequiredRole } from "@/components/ProtectedRoute";

/**
 * Backend createProcessingSchema requires:
 * - batchId (cuid, required)
 * - removalTypeId (cuid, required) — NOT processingType string
 * - coconutGrade ('BIG'|'SMALL'|'CANCELLED', required)
 * - quantity (int, required)
 * - processingDate (ISO datetime, optional)
 * - notes (optional)
 */
const processingSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  removalTypeId: z.string().min(1, "Removal type is required"),
  coconutGrade: z.enum(["BIG", "SMALL", "CANCELLED"] as const),
  quantity: z.coerce.number().int().min(1, "Quantity is required"),
  processingDate: z.string().optional(),
  notes: z.string().optional(),
});

type ProcessingFormData = z.infer<typeof processingSchema>;

const gradeLabels: Record<CoconutGrade, string> = {
  BIG: "Big",
  SMALL: "Small",
  CANCELLED: "Cancelled",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const ProcessingPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcessing, setEditingProcessing] = useState<Processing | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useProcessingList({ search, page, limit: 20 });
  const { data: batchesData } = useBatches({ limit: 100 });
  const { data: removalTypes = [] } = useRemovalTypes();
  const createMutation = useCreateProcessing();
  const updateMutation = useUpdateProcessing();
  const deleteMutation = useDeleteProcessing();
  const { user } = useAuth();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProcessingFormData>({
    resolver: zodResolver(processingSchema),
    defaultValues: { coconutGrade: "BIG" },
  });

  const processingRecords = data?.data || [];
  const batches = batchesData?.data || [];
  const canManageRemovalTypes = !!user && hasRequiredRole(user.role, ["ADMIN"]);
  const canCreateProcessing = removalTypes.length > 0 || !!editingProcessing;

  const openCreateDialog = () => {
    setEditingProcessing(null);
    reset({ batchId: "", removalTypeId: "", coconutGrade: "BIG", quantity: 0, processingDate: new Date().toISOString().split('T')[0], notes: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (proc: Processing) => {
    setEditingProcessing(proc);
    reset({
      batchId: proc.batchId,
      removalTypeId: proc.removalTypeId,
      coconutGrade: proc.coconutGrade,
      quantity: proc.quantity,
      processingDate: proc.processingDate?.split('T')[0] || "",
      notes: proc.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: ProcessingFormData) => {
    const payload: CreateProcessingData = {
      batchId: formData.batchId,
      removalTypeId: formData.removalTypeId,
      coconutGrade: formData.coconutGrade as CoconutGrade,
      quantity: formData.quantity,
      processingDate: formData.processingDate ? new Date(formData.processingDate).toISOString() : undefined,
      notes: formData.notes || undefined,
    };

    if (editingProcessing) {
      await updateMutation.mutateAsync({ id: editingProcessing.id, data: { quantity: payload.quantity, processingDate: payload.processingDate, notes: payload.notes } });
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Processing"
        description="Manage coconut de-husking, shelling, and processing operations"
        icon={Cog}
        action={
          <Button className="gap-2" onClick={openCreateDialog} disabled={!canCreateProcessing}>
            <Plus className="h-4 w-4" /> New Processing
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search processing..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Batch</TableHead>
              <TableHead className="text-xs">Removal Type</TableHead>
              <TableHead className="text-xs">Grade</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs text-right">Quantity</TableHead>
              <TableHead className="text-xs text-right">Cost/Unit</TableHead>
              <TableHead className="text-xs text-right">Total Cost</TableHead>
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
            ) : processingRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No processing records found. Start a new processing operation.
                </TableCell>
              </TableRow>
            ) : (
              processingRecords.map((p) => (
                <TableRow key={p.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm">{p.batch?.batchCode || '-'}</TableCell>
                  <TableCell className="text-sm font-medium">{p.removalType?.name || p.removalTypeId}</TableCell>
                  <TableCell className="text-sm">{gradeLabels[p.coconutGrade] || p.coconutGrade}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.processingDate ? format(new Date(p.processingDate), 'yyyy-MM-dd') : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-right">{p.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">₹{p.costPerCoconut}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(p.totalProcessingCost)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(p)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(p.id)} className="text-destructive">
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
            <DialogTitle>{editingProcessing ? 'Edit Processing' : 'New Processing'}</DialogTitle>
            <DialogDescription>
              {editingProcessing ? 'Update processing details.' : 'Record a new coconut processing operation.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Batch */}
              <div className="space-y-2">
                <Label htmlFor="batchId">Batch *</Label>
                <Controller
                  name="batchId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!editingProcessing}>
                      <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                      <SelectContent>
                        {batches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.batchCode}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.batchId && <p className="text-xs text-destructive">{errors.batchId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Removal Type */}
                <div className="space-y-2">
                  <Label htmlFor="removalTypeId">Removal Type *</Label>
                  <Controller
                    name="removalTypeId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!editingProcessing || removalTypes.length === 0}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {removalTypes.map((rt) => (
                            <SelectItem key={rt.id} value={rt.id}>{rt.name} (₹{rt.costPerCoconut}/pc)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {removalTypes.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No removal types configured.
                      {canManageRemovalTypes && (
                        <span className="ml-1">
                          <Link to="/removal-types" className="text-primary underline-offset-4 hover:underline">
                            Add removal types
                          </Link>
                          .
                        </span>
                      )}
                    </p>
                  )}
                  {errors.removalTypeId && <p className="text-xs text-destructive">{errors.removalTypeId.message}</p>}
                </div>

                {/* Coconut Grade */}
                <div className="space-y-2">
                  <Label htmlFor="coconutGrade">Coconut Grade *</Label>
                  <Controller
                    name="coconutGrade"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BIG">Big</SelectItem>
                          <SelectItem value="SMALL">Small</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input id="quantity" type="number" {...register("quantity")} />
                  {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processingDate">Processing Date</Label>
                  <Input id="processingDate" type="date" {...register("processingDate")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" {...register("notes")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                disabled={!canCreateProcessing || createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProcessing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Processing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
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

export default ProcessingPage;
