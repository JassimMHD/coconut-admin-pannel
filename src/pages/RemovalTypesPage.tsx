import { useState } from "react";
import { Layers, Plus, Search, Loader2, MoreHorizontal, Pencil, Power } from "lucide-react";
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
import { useRemovalTypes, useCreateRemovalType, useUpdateRemovalType } from "@/hooks/api/useProcessing";
import type { RemovalTypeConfig, CreateRemovalTypeData, RemovalTypeEnum } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const removalTypeSchema = z.object({
  type: z.enum(["NORMAL", "JUMBO", "DC", "MAALU"] as const),
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  costPerCoconut: z.coerce.number().min(0, "Cost must be 0 or more"),
  isActive: z.boolean().default(true),
});

type RemovalTypeFormData = z.infer<typeof removalTypeSchema>;

const removalTypeLabels: Record<RemovalTypeEnum, string> = {
  NORMAL: "Normal",
  JUMBO: "Jumbo",
  DC: "DC",
  MAALU: "Maalu",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const RemovalTypesPage = () => {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRemovalType, setEditingRemovalType] = useState<RemovalTypeConfig | null>(null);

  const { data: removalTypes = [], isLoading } = useRemovalTypes({ includeInactive: true });
  const createMutation = useCreateRemovalType();
  const updateMutation = useUpdateRemovalType();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<RemovalTypeFormData>({
    resolver: zodResolver(removalTypeSchema),
    defaultValues: { type: "NORMAL", isActive: true, costPerCoconut: 0 },
  });

  const openCreateDialog = () => {
    setEditingRemovalType(null);
    reset({ type: "NORMAL", name: "", description: "", costPerCoconut: 0, isActive: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (removalType: RemovalTypeConfig) => {
    setEditingRemovalType(removalType);
    reset({
      type: removalType.type,
      name: removalType.name,
      description: removalType.description || "",
      costPerCoconut: removalType.costPerCoconut,
      isActive: removalType.isActive,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: RemovalTypeFormData) => {
    if (editingRemovalType) {
      await updateMutation.mutateAsync({
        id: editingRemovalType.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          costPerCoconut: formData.costPerCoconut,
          isActive: formData.isActive,
        },
      });
    } else {
      const payload: CreateRemovalTypeData = {
        type: formData.type,
        name: formData.name,
        description: formData.description || undefined,
        costPerCoconut: formData.costPerCoconut,
        isActive: formData.isActive,
      };
      await createMutation.mutateAsync(payload);
    }

    setIsDialogOpen(false);
    reset();
  };

  const handleToggleActive = async (removalType: RemovalTypeConfig) => {
    await updateMutation.mutateAsync({
      id: removalType.id,
      data: { isActive: !removalType.isActive },
    });
  };

  const filteredRemovalTypes = removalTypes.filter((rt) => {
    if (!search.trim()) return true;
    const needle = search.toLowerCase();
    return (
      rt.name.toLowerCase().includes(needle) ||
      rt.type.toLowerCase().includes(needle) ||
      removalTypeLabels[rt.type].toLowerCase().includes(needle)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Removal Types"
        description="Configure removal types and processing costs"
        icon={Layers}
        action={
          <Button className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> Add Removal Type
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search removal types..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Cost/Unit</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Updated</TableHead>
              <TableHead className="text-xs w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRemovalTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No removal types found. Add your first removal type to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredRemovalTypes.map((rt) => (
                <TableRow key={rt.id} className="cursor-pointer">
                  <TableCell className="text-sm font-medium">{removalTypeLabels[rt.type]}</TableCell>
                  <TableCell className="text-sm">{rt.name}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(rt.costPerCoconut)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${rt.isActive ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`}
                    >
                      {rt.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(rt.updatedAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(rt)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(rt)}>
                          <Power className="h-4 w-4 mr-2" /> {rt.isActive ? "Deactivate" : "Activate"}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRemovalType ? "Edit Removal Type" : "Add Removal Type"}</DialogTitle>
            <DialogDescription>
              {editingRemovalType ? "Update removal type configuration." : "Create a new removal type for processing."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!editingRemovalType}
                      >
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="JUMBO">Jumbo</SelectItem>
                          <SelectItem value="DC">DC</SelectItem>
                          <SelectItem value="MAALU">Maalu</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPerCoconut">Cost per Coconut (INR) *</Label>
                  <Input id="costPerCoconut" type="number" {...register("costPerCoconut")} />
                  {errors.costPerCoconut && (
                    <p className="text-xs text-destructive">{errors.costPerCoconut.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Active</Label>
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingRemovalType ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RemovalTypesPage;
