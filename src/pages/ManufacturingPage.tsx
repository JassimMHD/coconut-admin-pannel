import { useState } from "react";
import { Factory, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { useManufacturingList, useCreateManufacturing, useUpdateManufacturing, useDeleteManufacturing, useConversionRatios } from "@/hooks/api/useManufacturing";
import type { ManufacturingBatch, CreateManufacturingData, ProductType, UnitOfMeasure } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasRequiredRole } from "@/components/ProtectedRoute";

/**
 * Backend createManufacturingSchema requires:
 * - productType ('OIL'|'COPRA'|'DESICCATED_COCONUT'|..., required)
 * - conversionRatioId (cuid, required) — NOT just any free-form field
 * - totalCoconutsUsed (int, required)
 * - quantityProduced (float, required)
 * - unit ('KG'|'LITRE'|'PIECE'|'TONNE'|'GALLON', required)
 * Optional: labourCost, utilityCost, packagingCost, otherCost, manufacturingDate, expiryDate, notes
 */
const manufacturingSchema = z.object({
  productType: z.enum(["OIL", "COPRA", "DESICCATED_COCONUT", "COCONUT_MILK", "COCONUT_CREAM", "COCONUT_WATER", "VIRGIN_COCONUT_OIL"] as const),
  conversionRatioId: z.string().min(1, "Conversion ratio is required"),
  totalCoconutsUsed: z.coerce.number().int().min(1, "Total coconuts used is required"),
  quantityProduced: z.coerce.number().min(0.01, "Quantity produced is required"),
  unit: z.enum(["KG", "LITRE", "PIECE", "TONNE", "GALLON"] as const),
  labourCost: z.coerce.number().min(0).optional(),
  utilityCost: z.coerce.number().min(0).optional(),
  packagingCost: z.coerce.number().min(0).optional(),
  otherCost: z.coerce.number().min(0).optional(),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

type ManufacturingFormData = z.infer<typeof manufacturingSchema>;

const productTypeLabels: Record<ProductType, string> = {
  OIL: "Coconut Oil",
  COPRA: "Copra",
  DESICCATED_COCONUT: "Desiccated Coconut",
  COCONUT_MILK: "Coconut Milk",
  COCONUT_CREAM: "Coconut Cream",
  COCONUT_WATER: "Coconut Water",
  VIRGIN_COCONUT_OIL: "Virgin Coconut Oil",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const ManufacturingPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ManufacturingBatch | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useManufacturingList({ search, page, limit: 20 });
  const { data: conversionRatios = [] } = useConversionRatios();
  const createMutation = useCreateManufacturing();
  const updateMutation = useUpdateManufacturing();
  const deleteMutation = useDeleteManufacturing();
  const { user } = useAuth();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ManufacturingFormData>({
    resolver: zodResolver(manufacturingSchema),
    defaultValues: {
      productType: "OIL",
      unit: "KG",
      manufacturingDate: new Date().toISOString().split('T')[0],
    },
  });

  const records = data?.data || [];
  const canManageRatios = !!user && hasRequiredRole(user.role, ["ADMIN"]);
  const canCreateManufacturing = conversionRatios.length > 0 || !!editingRecord;

  const openCreateDialog = () => {
    setEditingRecord(null);
    reset({
      productType: "OIL",
      conversionRatioId: "",
      totalCoconutsUsed: 0,
      quantityProduced: 0,
      unit: "KG",
      labourCost: 0,
      utilityCost: 0,
      packagingCost: 0,
      otherCost: 0,
      manufacturingDate: new Date().toISOString().split('T')[0],
      expiryDate: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (record: ManufacturingBatch) => {
    setEditingRecord(record);
    reset({
      productType: record.productType,
      conversionRatioId: record.conversionRatioId,
      totalCoconutsUsed: record.totalCoconutsUsed,
      quantityProduced: record.quantityProduced,
      unit: record.unit,
      labourCost: record.labourCost ?? 0,
      utilityCost: record.utilityCost ?? 0,
      packagingCost: record.packagingCost ?? 0,
      otherCost: record.otherCost ?? 0,
      manufacturingDate: record.manufacturingDate?.split('T')[0] || "",
      expiryDate: record.expiryDate?.split('T')[0] || "",
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: ManufacturingFormData) => {
    const payload: CreateManufacturingData = {
      productType: formData.productType as ProductType,
      conversionRatioId: formData.conversionRatioId,
      totalCoconutsUsed: formData.totalCoconutsUsed,
      quantityProduced: formData.quantityProduced,
      unit: formData.unit as UnitOfMeasure,
      labourCost: formData.labourCost || undefined,
      utilityCost: formData.utilityCost || undefined,
      packagingCost: formData.packagingCost || undefined,
      otherCost: formData.otherCost || undefined,
      manufacturingDate: formData.manufacturingDate ? new Date(formData.manufacturingDate).toISOString() : undefined,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
      notes: formData.notes || undefined,
    };

    if (editingRecord) {
      await updateMutation.mutateAsync({
        id: editingRecord.id,
        data: {
          quantityProduced: payload.quantityProduced,
          labourCost: payload.labourCost,
          utilityCost: payload.utilityCost,
          packagingCost: payload.packagingCost,
          otherCost: payload.otherCost,
          expiryDate: payload.expiryDate,
          notes: payload.notes,
        },
      });
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
        title="Manufacturing"
        description="Convert processed coconuts into Oil, Copra, and finished products"
        icon={Factory}
        action={
          <Button className="gap-2" onClick={openCreateDialog} disabled={!canCreateManufacturing}>
            <Plus className="h-4 w-4" /> New Batch
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search manufacturing..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Batch Code</TableHead>
              <TableHead className="text-xs">Product</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs text-right">Coconuts Used</TableHead>
              <TableHead className="text-xs text-right">Qty Produced</TableHead>
              <TableHead className="text-xs text-right">Total Cost</TableHead>
              <TableHead className="text-xs text-right">Cost/Unit</TableHead>
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
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No manufacturing records found. Start a new production batch.
                </TableCell>
              </TableRow>
            ) : (
              records.map((m) => (
                <TableRow key={m.id} className="cursor-pointer">
                  {/* Backend field is batchCode, not batchNumber */}
                  <TableCell className="font-mono text-sm">{m.batchCode}</TableCell>
                  <TableCell className="text-sm font-medium">{productTypeLabels[m.productType] || m.productType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.manufacturingDate ? format(new Date(m.manufacturingDate), 'yyyy-MM-dd') : '-'}
                  </TableCell>
                  {/* Backend uses totalCoconutsUsed, not inputQuantity */}
                  <TableCell className="text-sm text-right">{m.totalCoconutsUsed.toLocaleString()}</TableCell>
                  {/* Backend uses quantityProduced + unit, not outputQuantity */}
                  <TableCell className="text-sm text-right">{m.quantityProduced} {m.unit}</TableCell>
                  {/* Backend uses totalCost, not productionCost */}
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(m.totalCost)}</TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">
                    {formatCurrency(m.costPerUnit)}/{m.unit}
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Manufacturing' : 'New Manufacturing Batch'}</DialogTitle>
            <DialogDescription>
              {editingRecord ? 'Update manufacturing details.' : 'Start a new manufacturing batch.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                {/* Product Type */}
                <div className="space-y-2">
                  <Label>Product Type *</Label>
                  <Controller
                    name="productType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!editingRecord}>
                        <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(productTypeLabels).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Conversion Ratio */}
                <div className="space-y-2">
                  <Label>Conversion Ratio *</Label>
                  <Controller
                    name="conversionRatioId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!editingRecord || conversionRatios.length === 0}>
                        <SelectTrigger><SelectValue placeholder="Select ratio" /></SelectTrigger>
                        <SelectContent>
                          {conversionRatios.map((cr) => (
                            <SelectItem key={cr.id} value={cr.id}>
                              {cr.name} ({cr.coconutsPerUnit} nuts/{cr.outputUnit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {conversionRatios.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No ratios configured.
                      {canManageRatios && (
                        <span className="ml-1">
                          <Link to="/conversion-ratios" className="text-primary underline-offset-4 hover:underline">
                            Add conversion ratios
                          </Link>
                          .
                        </span>
                      )}
                    </p>
                  )}
                  {errors.conversionRatioId && <p className="text-xs text-destructive">{errors.conversionRatioId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Coconuts Used *</Label>
                  <Input type="number" {...register("totalCoconutsUsed")} disabled={!!editingRecord} />
                  {errors.totalCoconutsUsed && <p className="text-xs text-destructive">{errors.totalCoconutsUsed.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Qty Produced *</Label>
                  <Input type="number" step="0.01" {...register("quantityProduced")} />
                  {errors.quantityProduced && <p className="text-xs text-destructive">{errors.quantityProduced.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Unit *</Label>
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!editingRecord}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="LITRE">Litre</SelectItem>
                          <SelectItem value="PIECE">Piece</SelectItem>
                          <SelectItem value="TONNE">Tonne</SelectItem>
                          <SelectItem value="GALLON">Gallon</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>Labour (₹)</Label>
                  <Input type="number" step="0.01" {...register("labourCost")} />
                </div>
                <div className="space-y-2">
                  <Label>Utilities (₹)</Label>
                  <Input type="number" step="0.01" {...register("utilityCost")} />
                </div>
                <div className="space-y-2">
                  <Label>Packaging (₹)</Label>
                  <Input type="number" step="0.01" {...register("packagingCost")} />
                </div>
                <div className="space-y-2">
                  <Label>Other (₹)</Label>
                  <Input type="number" step="0.01" {...register("otherCost")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Manufacturing Date</Label>
                  <Input type="date" {...register("manufacturingDate")} />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input type="date" {...register("expiryDate")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea {...register("notes")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                disabled={!canCreateManufacturing || createMutation.isPending || updateMutation.isPending}
              >
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
            <AlertDialogTitle>Delete Manufacturing Batch</AlertDialogTitle>
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

export default ManufacturingPage;
