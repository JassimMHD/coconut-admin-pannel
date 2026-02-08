import { useState } from "react";
import { Factory, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2, CheckCircle } from "lucide-react";
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
import { useManufacturing, useCreateManufacturing, useUpdateManufacturing, useDeleteManufacturing, useCompleteManufacturing } from "@/hooks/api/useManufacturing";
import { useProcessing } from "@/hooks/api/useProcessing";
import type { Manufacturing, CreateManufacturingData, ProductType } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const manufacturingSchema = z.object({
  processingId: z.string().min(1, "Processing record is required"),
  productType: z.enum(["COCONUT_OIL", "COPRA", "COCONUT_MILK", "DESICCATED_COCONUT", "COIR", "SHELL_CHARCOAL"] as const),
  inputQuantity: z.coerce.number().min(1, "Input quantity is required"),
  notes: z.string().optional(),
});

type ManufacturingFormData = z.infer<typeof manufacturingSchema>;

const statusColors: Record<string, string> = {
  PENDING: "bg-info/10 text-info border-info/20",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const productTypeLabels: Record<string, string> = {
  COCONUT_OIL: "Coconut Oil",
  COPRA: "Copra",
  COCONUT_MILK: "Coconut Milk",
  DESICCATED_COCONUT: "Desiccated Coconut",
  COIR: "Coir",
  SHELL_CHARCOAL: "Shell Charcoal",
};

const ManufacturingPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Manufacturing | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useManufacturing({ search, page, limit: 20 });
  const { data: processingData } = useProcessing({ status: 'COMPLETED', limit: 100 });
  const createMutation = useCreateManufacturing();
  const updateMutation = useUpdateManufacturing();
  const deleteMutation = useDeleteManufacturing();
  const completeMutation = useCompleteManufacturing();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ManufacturingFormData>({
    resolver: zodResolver(manufacturingSchema),
    defaultValues: { productType: "COCONUT_OIL" },
  });

  const records = data?.data || [];
  const processingRecords = processingData?.data || [];

  const openCreateDialog = () => {
    setEditingRecord(null);
    reset({ processingId: "", productType: "COCONUT_OIL", inputQuantity: 0, notes: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (record: Manufacturing) => {
    setEditingRecord(record);
    reset({
      processingId: record.processingId,
      productType: record.productType,
      inputQuantity: record.inputQuantity,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: ManufacturingFormData) => {
    const data: CreateManufacturingData = {
      processingId: formData.processingId,
      productType: formData.productType as ProductType,
      inputQuantity: formData.inputQuantity,
      notes: formData.notes || undefined,
    };

    if (editingRecord) {
      await updateMutation.mutateAsync({ id: editingRecord.id, data });
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

  const handleComplete = async (id: string, outputQuantity: number) => {
    await completeMutation.mutateAsync({ id, outputQuantity });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Manufacturing" 
        description="Convert processed coconuts into Oil, Copra, and finished products" 
        icon={Factory}
        action={<Button className="gap-2" onClick={openCreateDialog}><Plus className="h-4 w-4" /> New Batch</Button>}
      />
      
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search manufacturing..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Batch</TableHead>
              <TableHead className="text-xs">Product</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs text-right">Input</TableHead>
              <TableHead className="text-xs text-right">Output</TableHead>
              <TableHead className="text-xs text-right">Cost</TableHead>
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
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No manufacturing records found. Start a new production batch.
                </TableCell>
              </TableRow>
            ) : (
              records.map((m) => (
                <TableRow key={m.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm">{m.batchNumber}</TableCell>
                  <TableCell className="text-sm font-medium">{productTypeLabels[m.productType] || m.productType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(m.manufacturingDate), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell className="text-sm text-right">{m.inputQuantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-right">{m.outputQuantity?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(m.productionCost)}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", statusColors[m.status] || statusColors.PENDING)}>
                      {m.status.replace('_', ' ')}
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
                        <DropdownMenuItem onClick={() => openEditDialog(m)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        {m.status !== 'COMPLETED' && (
                          <DropdownMenuItem onClick={() => handleComplete(m.id, m.inputQuantity * 0.4)}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setDeletingId(m.id)} className="text-destructive">
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
            <DialogTitle>{editingRecord ? 'Edit Manufacturing' : 'New Manufacturing'}</DialogTitle>
            <DialogDescription>
              {editingRecord ? 'Update manufacturing batch details.' : 'Start a new manufacturing batch.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processingId">Processing Record *</Label>
                  <Controller
                    name="processingId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select processing" /></SelectTrigger>
                        <SelectContent>
                          {processingRecords.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.batch?.batchNumber} - {p.processingType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.processingId && <p className="text-sm text-destructive">{errors.processingId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type *</Label>
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
                {editingRecord ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manufacturing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this manufacturing record? This action cannot be undone.
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

export default ManufacturingPage;
