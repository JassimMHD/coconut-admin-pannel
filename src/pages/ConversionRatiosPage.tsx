import { useState } from "react";
import { Scale, Plus, Search, Loader2, MoreHorizontal, Pencil, Power } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useConversionRatios, useCreateConversionRatio, useUpdateConversionRatio } from "@/hooks/api/useManufacturing";
import type { ConversionRatio, CreateConversionRatioData, ProductType, UnitOfMeasure } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const conversionRatioSchema = z.object({
  productType: z.enum([
    "OIL",
    "COPRA",
    "DESICCATED_COCONUT",
    "COCONUT_MILK",
    "COCONUT_CREAM",
    "COCONUT_WATER",
    "VIRGIN_COCONUT_OIL",
  ] as const),
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  coconutsPerUnit: z.coerce.number().min(0.01, "Coconuts per unit is required"),
  outputUnit: z.enum(["KG", "LITRE", "PIECE", "TONNE", "GALLON"] as const),
  huskYieldKg: z.coerce.number().min(0).optional(),
  shellYieldKg: z.coerce.number().min(0).optional(),
  coirYieldKg: z.coerce.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

type ConversionRatioFormData = z.infer<typeof conversionRatioSchema>;

const productTypeLabels: Record<ProductType, string> = {
  OIL: "Coconut Oil",
  COPRA: "Copra",
  DESICCATED_COCONUT: "Desiccated Coconut",
  COCONUT_MILK: "Coconut Milk",
  COCONUT_CREAM: "Coconut Cream",
  COCONUT_WATER: "Coconut Water",
  VIRGIN_COCONUT_OIL: "Virgin Coconut Oil",
};

const ConversionRatiosPage = () => {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRatio, setEditingRatio] = useState<ConversionRatio | null>(null);

  const { data: ratios = [], isLoading } = useConversionRatios({ includeInactive: true });
  const createMutation = useCreateConversionRatio();
  const updateMutation = useUpdateConversionRatio();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ConversionRatioFormData>({
    resolver: zodResolver(conversionRatioSchema),
    defaultValues: {
      productType: "OIL",
      outputUnit: "LITRE",
      coconutsPerUnit: 1,
      huskYieldKg: 0.2,
      shellYieldKg: 0.15,
      coirYieldKg: 0.05,
      isActive: true,
    },
  });

  const openCreateDialog = () => {
    setEditingRatio(null);
    reset({
      productType: "OIL",
      name: "",
      description: "",
      coconutsPerUnit: 1,
      outputUnit: "LITRE",
      huskYieldKg: 0.2,
      shellYieldKg: 0.15,
      coirYieldKg: 0.05,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (ratio: ConversionRatio) => {
    setEditingRatio(ratio);
    reset({
      productType: ratio.productType,
      name: ratio.name,
      description: ratio.description || "",
      coconutsPerUnit: ratio.coconutsPerUnit,
      outputUnit: ratio.outputUnit,
      huskYieldKg: ratio.huskYieldKg,
      shellYieldKg: ratio.shellYieldKg,
      coirYieldKg: ratio.coirYieldKg,
      isActive: ratio.isActive,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: ConversionRatioFormData) => {
    if (editingRatio) {
      await updateMutation.mutateAsync({
        id: editingRatio.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          coconutsPerUnit: formData.coconutsPerUnit,
          outputUnit: formData.outputUnit as UnitOfMeasure,
          huskYieldKg: formData.huskYieldKg,
          shellYieldKg: formData.shellYieldKg,
          coirYieldKg: formData.coirYieldKg,
          isActive: formData.isActive,
        },
      });
    } else {
      const payload: CreateConversionRatioData = {
        productType: formData.productType as ProductType,
        name: formData.name,
        description: formData.description || undefined,
        coconutsPerUnit: formData.coconutsPerUnit,
        outputUnit: formData.outputUnit as UnitOfMeasure,
        huskYieldKg: formData.huskYieldKg,
        shellYieldKg: formData.shellYieldKg,
        coirYieldKg: formData.coirYieldKg,
        isActive: formData.isActive,
      };
      await createMutation.mutateAsync(payload);
    }

    setIsDialogOpen(false);
    reset();
  };

  const handleToggleActive = async (ratio: ConversionRatio) => {
    await updateMutation.mutateAsync({
      id: ratio.id,
      data: { isActive: !ratio.isActive },
    });
  };

  const filteredRatios = ratios.filter((ratio) => {
    if (!search.trim()) return true;
    const needle = search.toLowerCase();
    return (
      ratio.name.toLowerCase().includes(needle) ||
      ratio.productType.toLowerCase().includes(needle) ||
      productTypeLabels[ratio.productType].toLowerCase().includes(needle)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversion Ratios"
        description="Configure coconut-to-product conversion ratios"
        icon={Scale}
        action={
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> Add Ratio
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search ratios..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Product</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Coconuts/Unit</TableHead>
              <TableHead className="text-xs">Output Unit</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Updated</TableHead>
              <TableHead className="text-xs w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRatios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No conversion ratios found. Add your first ratio to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredRatios.map((ratio) => (
                <TableRow key={ratio.id} className="cursor-pointer">
                  <TableCell className="text-sm font-medium">
                    {productTypeLabels[ratio.productType] || ratio.productType}
                  </TableCell>
                  <TableCell className="text-sm">{ratio.name}</TableCell>
                  <TableCell className="text-sm">{ratio.coconutsPerUnit}</TableCell>
                  <TableCell className="text-sm">{ratio.outputUnit}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${ratio.isActive ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`}
                    >
                      {ratio.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ratio.updatedAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(ratio)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(ratio)}>
                          <Power className="h-4 w-4 mr-2" /> {ratio.isActive ? "Deactivate" : "Activate"}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingRatio ? "Edit Conversion Ratio" : "Add Conversion Ratio"}</DialogTitle>
            <DialogDescription>
              {editingRatio ? "Update conversion ratio configuration." : "Create a new conversion ratio."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Type *</Label>
                  <Controller
                    name="productType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!editingRatio}
                      >
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
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Coconuts per Unit *</Label>
                  <Input type="number" step="0.01" {...register("coconutsPerUnit")} />
                  {errors.coconutsPerUnit && <p className="text-xs text-destructive">{errors.coconutsPerUnit.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Output Unit *</Label>
                  <Controller
                    name="outputUnit"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
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
                <div className="space-y-2">
                  <Label>Active</Label>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <span className="text-sm text-muted-foreground">
                          {field.value ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Husk Yield (kg)</Label>
                  <Input type="number" step="0.01" {...register("huskYieldKg")} />
                </div>
                <div className="space-y-2">
                  <Label>Shell Yield (kg)</Label>
                  <Input type="number" step="0.01" {...register("shellYieldKg")} />
                </div>
                <div className="space-y-2">
                  <Label>Coir Yield (kg)</Label>
                  <Input type="number" step="0.01" {...register("coirYieldKg")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...register("description")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingRatio ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConversionRatiosPage;
