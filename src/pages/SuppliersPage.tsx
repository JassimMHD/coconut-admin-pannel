import { useState } from "react";
import { Users, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, useToggleSupplierStatus } from "@/hooks/api/useSuppliers";
import type { Supplier, CreateSupplierData } from "@/types/api.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Backend createSupplierSchema: name required, phone required (min 10)
const supplierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  contactPerson: z.string().optional(),
  altPhone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  paymentTermDays: z.coerce.number().min(0).optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

const SuppliersPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error } = useSuppliers({ search, page, limit: 20 });
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();
  const toggleStatusMutation = useToggleSupplierStatus();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });

  const suppliers = data?.data || [];

  const openCreateDialog = () => {
    setEditingSupplier(null);
    reset({ name: "", phone: "", contactPerson: "", altPhone: "", email: "", address: "", city: "", district: "", paymentTermDays: 30, creditLimit: 0, notes: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      phone: supplier.phone || "",
      contactPerson: supplier.contactPerson || "",
      altPhone: supplier.altPhone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      city: supplier.city || "",
      district: supplier.district || "",
      paymentTermDays: supplier.paymentTermDays ?? 30,
      creditLimit: supplier.creditLimit ?? 0,
      notes: supplier.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: SupplierFormData) => {
    const payload: CreateSupplierData = {
      name: formData.name,
      phone: formData.phone,
      contactPerson: formData.contactPerson || undefined,
      altPhone: formData.altPhone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      district: formData.district || undefined,
      paymentTermDays: formData.paymentTermDays || undefined,
      creditLimit: formData.creditLimit || undefined,
      notes: formData.notes || undefined,
    };

    if (editingSupplier) {
      await updateMutation.mutateAsync({ id: editingSupplier.id, data: payload });
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
      <PageHeader title="Suppliers" description="Manage coconut suppliers and dealers" icon={Users}
        action={<Button className="gap-2" onClick={openCreateDialog}><Plus className="h-4 w-4" /> Add Supplier</Button>} />
      
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search suppliers..." 
          className="pl-9" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Code</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Phone</TableHead>
              <TableHead className="text-xs">City</TableHead>
              <TableHead className="text-xs text-right">Balance Due</TableHead>
              <TableHead className="text-xs">Status</TableHead>
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
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No suppliers found. Add your first supplier to get started.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((s) => (
                <TableRow key={s.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm">{s.code}</TableCell>
                  <TableCell className="text-sm font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.phone || '-'}</TableCell>
                  <TableCell className="text-sm">{s.city || '-'}</TableCell>
                  <TableCell className="text-sm text-right font-medium">
                    {s.supplierBalance ? formatCurrency(s.supplierBalance.balance) : '₹0'}
                  </TableCell>
                  <TableCell>
                    {/* Backend uses isActive boolean, not status string */}
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.isActive ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`}>
                      {s.isActive ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => openEditDialog(s)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatusMutation.mutate({ id: s.id, isActive: !s.isActive })}>
                          {s.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(s.id)} className="text-destructive">
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
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
            <DialogDescription>
              {editingSupplier ? 'Update supplier information.' : 'Add a new coconut supplier.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input id="contactPerson" {...register("contactPerson")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" {...register("phone")} placeholder="10+ digits" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altPhone">Alt. Phone</Label>
                  <Input id="altPhone" type="tel" {...register("altPhone")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" {...register("district")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="paymentTermDays">Payment Terms (days)</Label>
                  <Input id="paymentTermDays" type="number" {...register("paymentTermDays")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                  <Input id="creditLimit" type="number" {...register("creditLimit")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" {...register("address")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" {...register("notes")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingSupplier ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this supplier? This action cannot be undone.
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

export default SuppliersPage;
