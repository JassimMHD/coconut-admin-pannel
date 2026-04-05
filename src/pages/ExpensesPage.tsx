import { useState } from "react";
import { Receipt, Plus, Search, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense, useExpenseSummary } from "@/hooks/api/useExpenses";
import type { GeneralExpense, CreateExpenseData, ExpenseCategory } from "@/types/api.types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const expenseSchema = z.object({
  category: z.enum(["TRANSPORT", "LABOUR", "COMMISSION", "FUEL", "ELECTRICITY", "MAINTENANCE", "PACKAGING", "STORAGE", "OTHER"] as const),
  amount: z.coerce.number().min(0.01, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  expenseDate: z.string().min(1, "Date is required"),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

const categoryColors: Record<string, string> = {
  TRANSPORT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  LABOUR: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  COMMISSION: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  FUEL: "bg-red-500/10 text-red-500 border-red-500/20",
  ELECTRICITY: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  MAINTENANCE: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  PACKAGING: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  STORAGE: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  OTHER: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const ExpensesPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<GeneralExpense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useExpenses({ search, page, limit: 20 });
  const { data: summaryData } = useExpenseSummary();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { 
      category: "OTHER",
      expenseDate: new Date().toISOString().split('T')[0],
    },
  });

  const expenses = data?.data || [];
  const summary = summaryData;

  const openCreateDialog = () => {
    setEditingExpense(null);
    reset({ 
      category: "OTHER", 
      amount: 0, 
      description: "", 
      expenseDate: new Date().toISOString().split('T')[0],
      receiptNumber: "",
      notes: "" 
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (expense: GeneralExpense) => {
    setEditingExpense(expense);
    reset({
      category: expense.category as any,
      amount: expense.amount,
      description: expense.description,
      expenseDate: expense.expenseDate.split('T')[0],
      receiptNumber: expense.receiptNumber || "",
      notes: expense.notes || "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: ExpenseFormData) => {
    const data: CreateExpenseData = {
      category: formData.category as ExpenseCategory,
      amount: formData.amount,
      description: formData.description,
      expenseDate: new Date(formData.expenseDate).toISOString(),
      receiptNumber: formData.receiptNumber || undefined,
      notes: formData.notes || undefined,
    };

    if (editingExpense) {
      await updateMutation.mutateAsync({ id: editingExpense.id, data });
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
        title="Expenses" 
        description="Track batch, manufacturing, and general business expenses" 
        icon={Receipt}
        action={<Button className="gap-2" onClick={openCreateDialog}><Plus className="h-4 w-4" /> Add Expense</Button>}
      />

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.todayTotal)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.weekTotal)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.monthTotal)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search expenses..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Description</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
              <TableHead className="text-xs">Receipt #</TableHead>
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
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No expenses found. Log your first expense to get started.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id} className="cursor-pointer">
                  <TableCell className="text-sm text-muted-foreground">
                    {expense.expenseDate ? format(new Date(expense.expenseDate), 'yyyy-MM-dd') : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", categoryColors[expense.category] || categoryColors.OTHER)}>
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{expense.description}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{expense.receiptNumber || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(expense)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(expense.id)} className="text-destructive">
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
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            <DialogDescription>
              {editingExpense ? 'Update expense details.' : 'Log a new expense.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRANSPORT">Transport</SelectItem>
                          <SelectItem value="LABOUR">Labour</SelectItem>
                          <SelectItem value="COMMISSION">Commission</SelectItem>
                          <SelectItem value="FUEL">Fuel</SelectItem>
                          <SelectItem value="ELECTRICITY">Electricity</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                          <SelectItem value="PACKAGING">Packaging</SelectItem>
                          <SelectItem value="STORAGE">Storage</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expenseDate">Date *</Label>
                  <Input type="date" {...register("expenseDate")} />
                  {errors.expenseDate && <p className="text-sm text-destructive">{errors.expenseDate.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input {...register("description")} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹) *</Label>
                  <Input type="number" step="0.01" {...register("amount")} />
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptNumber">Receipt #</Label>
                  <Input {...register("receiptNumber")} />
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
                {editingExpense ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
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

export default ExpensesPage;
