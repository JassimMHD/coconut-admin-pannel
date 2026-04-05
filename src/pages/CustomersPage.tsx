import { useState } from "react";
import { UserCheck, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@/hooks/api/useCustomers";
import type { Customer, CreateCustomerData } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Backend createCustomerSchema: name required, phone required (min 10)
const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  customerType: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"] as const).optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  altPhone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  paymentTermDays: z.coerce.number().min(0).optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const CustomersPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useCustomers({ search, page, limit: 20 });
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { customerType: "RETAIL" },
  });

  const customers = data?.data || [];

  const openCreateDialog = () => {
    setEditingCustomer(null);
    reset({ name: "", phone: "", altPhone: "", email: "", address: "", city: "", district: "", customerType: "RETAIL", creditLimit: 0, paymentTermDays: 30, taxId: "", notes: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    reset({
      name: customer.name,
      phone: customer.phone || "",
      altPhone: customer.altPhone || "",
      email: customer.email || "",
      address: customer.address || "",
      city: customer.city || "",
      district: customer.district || "",
      customerType: (customer.customerType as any) || "RETAIL",
      creditLimit: customer.creditLimit ?? 0,
      paymentTermDays: customer.paymentTermDays ?? 30,
      taxId: customer.taxId || "",
      notes: customer.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: CustomerFormData) => {
    const payload: CreateCustomerData = {
      name: formData.name,
      customerType: formData.customerType,
      phone: formData.phone,
      altPhone: formData.altPhone || undefined,
      email: formData.email || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      district: formData.district || undefined,
      paymentTermDays: formData.paymentTermDays || undefined,
      creditLimit: formData.creditLimit || undefined,
      taxId: formData.taxId || undefined,
      notes: formData.notes || undefined,
    };

    if (editingCustomer) {
      await updateMutation.mutateAsync({ id: editingCustomer.id, data: payload });
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
      <PageHeader title="Customers" description="Manage buyers and customer accounts" icon={UserCheck}
        action={<Button className="gap-2" onClick={openCreateDialog}><Plus className="h-4 w-4" /> Add Customer</Button>} />
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search customers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Code</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Phone</TableHead>
              <TableHead className="text-xs">City</TableHead>
              <TableHead className="text-xs text-right">Balance</TableHead>
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
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No customers found. Add your first customer to get started.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  {/* Backend returns 'code', not 'customerCode' */}
                  <TableCell className="font-mono text-sm">{c.code}</TableCell>
                  <TableCell className="text-sm font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.customerType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.phone || "-"}</TableCell>
                  <TableCell className="text-sm">{c.city || "-"}</TableCell>
                  {/* Backend uses accountReceivable.balance, not currentBalance */}
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(c.accountReceivable?.balance ?? 0)}</TableCell>
                  <TableCell>
                    {/* Backend uses isActive boolean */}
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${c.isActive ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`}>
                      {c.isActive ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => openEditDialog(c)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(c.id)} className="text-destructive">
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
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? 'Update customer information.' : 'Add a new customer to your system.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerType">Type</Label>
                  <Controller
                    name="customerType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RETAIL">Retail</SelectItem>
                          <SelectItem value="WHOLESALE">Wholesale</SelectItem>
                          <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input type="tel" {...register("phone")} placeholder="10+ digits" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altPhone">Alt. Phone</Label>
                  <Input type="tel" {...register("altPhone")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input {...register("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input {...register("district")} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                  <Input type="number" {...register("creditLimit")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTermDays">Pay Terms (days)</Label>
                  <Input type="number" {...register("paymentTermDays")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input {...register("taxId")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea {...register("address")} />
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
                {editingCustomer ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
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

export default CustomersPage;
