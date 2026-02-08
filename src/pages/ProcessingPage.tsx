import { useState } from "react";
import { Cog, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2, CheckCircle } from "lucide-react";
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
import { useProcessing, useCreateProcessing, useUpdateProcessing, useDeleteProcessing, useCompleteProcessing } from "@/hooks/api/useProcessing";
import { useBatches } from "@/hooks/api/useBatches";
import type { Processing, CreateProcessingData, ProcessingType } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const processingSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  processingType: z.enum(["DEHUSKING", "SHELLING", "DRYING", "EXTRACTION"] as const),
  inputQuantity: z.coerce.number().min(1, "Input quantity is required"),
  notes: z.string().optional(),
});

type ProcessingFormData = z.infer<typeof processingSchema>;

const statusColors: Record<string, string> = {
  PENDING: "bg-info/10 text-info border-info/20",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const ProcessingPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcessing, setEditingProcessing] = useState<Processing | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useProcessing({ search, page, limit: 20 });
  const { data: batchesData } = useBatches({ limit: 100 });
  const createMutation = useCreateProcessing();
  const updateMutation = useUpdateProcessing();
  const deleteMutation = useDeleteProcessing();
  const completeMutation = useCompleteProcessing();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProcessingFormData>({
    resolver: zodResolver(processingSchema),
    defaultValues: { processingType: "DEHUSKING" },
  });

  const processingRecords = data?.data || [];
  const batches = batchesData?.data || [];

  const openCreateDialog = () => {
    setEditingProcessing(null);
    reset({ batchId: "", processingType: "DEHUSKING", inputQuantity: 0, notes: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (proc: Processing) => {
    setEditingProcessing(proc);
    reset({
      batchId: proc.batchId,
      processingType: proc.processingType,
      inputQuantity: proc.inputQuantity,
      notes: proc.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: ProcessingFormData) => {
    const data: CreateProcessingData = {
      batchId: formData.batchId,
      processingType: formData.processingType as ProcessingType,
      inputQuantity: formData.inputQuantity,
      notes: formData.notes || undefined,
    };

    if (editingProcessing) {
      await updateMutation.mutateAsync({ id: editingProcessing.id, data });
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

  const handleComplete = async (id: string, outputQuantity: number, wasteQuantity: number) => {
    await completeMutation.mutateAsync({ id, outputQuantity, wasteQuantity });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Processing" 
        description="Manage coconut de-husking, shelling, and processing operations" 
        icon={Cog}
        action={<Button className="gap-2" onClick={openCreateDialog}><Plus className="h-4 w-4" /> New Processing</Button>}
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
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs text-right">Input</TableHead>
              <TableHead className="text-xs text-right">Output</TableHead>
              <TableHead className="text-xs text-right">Waste</TableHead>
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
            ) : processingRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No processing records found. Start a new processing operation.
                </TableCell>
              </TableRow>
            ) : (
              processingRecords.map((p) => (
                <TableRow key={p.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm">{p.batch?.batchNumber || '-'}</TableCell>
                  <TableCell className="text-sm font-medium">{p.processingType.replace('_', ' ')}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(p.processingDate), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell className="text-sm text-right">{p.inputQuantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right">{p.outputQuantity?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="text-sm text-right">{p.wasteQuantity || '-'}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", statusColors[p.status] || statusColors.PENDING)}>
                      {p.status.replace('_', ' ')}
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
                        <DropdownMenuItem onClick={() => openEditDialog(p)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        {p.status !== 'COMPLETED' && (
                          <DropdownMenuItem onClick={() => handleComplete(p.id, p.inputQuantity * 0.85, p.inputQuantity * 0.15)}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Complete
                          </DropdownMenuItem>
                        )}
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
              {editingProcessing ? 'Update processing details.' : 'Start a new processing operation.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchId">Batch *</Label>
                  <Controller
                    name="batchId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                        <SelectContent>
                          {batches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.batchNumber}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.batchId && <p className="text-sm text-destructive">{errors.batchId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processingType">Type *</Label>
                  <Controller
                    name="processingType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEHUSKING">Dehusking</SelectItem>
                          <SelectItem value="SHELLING">Shelling</SelectItem>
                          <SelectItem value="DRYING">Drying</SelectItem>
                          <SelectItem value="EXTRACTION">Extraction</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inputQuantity">Input Quantity *</Label>
                <Input type="number" {...register("inputQuantity")} />
                {errors.inputQuantity && <p className="text-sm text-destructive">{errors.inputQuantity.message}</p>}
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
              Are you sure you want to delete this processing record? This action cannot be undone.
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
