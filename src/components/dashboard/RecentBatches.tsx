import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CoconutBatch } from "@/types/api.types";
import { format } from "date-fns";

// Fallback mock data for when API returns empty
const mockBatches = [
  { code: "BT-2026-001", supplier: "Ravi Traders", qty: 1200, good: 850, bad: 70, status: "COMPLETED", date: "Feb 8" },
  { code: "BT-2026-002", supplier: "Lakshmi Farms", qty: 800, good: 600, bad: 40, status: "PROCESSING", date: "Feb 7" },
  { code: "BT-2026-003", supplier: "Kumar & Sons", qty: 1500, good: 1100, bad: 80, status: "PENDING", date: "Feb 7" },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-info/10 text-info border-info/20",
  PROCESSING: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

interface RecentBatchesProps {
  batches?: CoconutBatch[];
  isLoading?: boolean;
}

export const RecentBatches = ({ batches, isLoading }: RecentBatchesProps) => {
  const displayBatches = batches && batches.length > 0 ? batches : null;
  const formatCount = (value?: number) => (typeof value === "number" ? value.toLocaleString() : "-");
  const formatBatchDate = (value?: string) => (value ? format(new Date(value), "MMM d") : "-");

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-5 pb-3">
        <div>
          <h3 className="text-base font-semibold font-heading">Recent Batches</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Latest coconut batch arrivals and status</p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs">Batch Code</TableHead>
            <TableHead className="text-xs">Supplier</TableHead>
            <TableHead className="text-xs text-right">Qty</TableHead>
            <TableHead className="text-xs text-right">Good</TableHead>
            <TableHead className="text-xs text-right">Bad</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-14" /></TableCell>
              </TableRow>
            ))
          ) : displayBatches ? (
            displayBatches.map((batch) => (
              <TableRow key={batch.id} className="cursor-pointer">
                <TableCell className="font-mono text-sm font-medium">{batch.batchNumber}</TableCell>
                <TableCell className="text-sm">{batch.supplier?.name || 'Unknown'}</TableCell>
                <TableCell className="text-sm text-right font-medium">{formatCount(batch.totalQuantity)}</TableCell>
                <TableCell className="text-sm text-right">{formatCount(batch.goodQuantity)}</TableCell>
                <TableCell className="text-sm text-right">{formatCount(batch.badQuantity)}</TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", statusColors[batch.status] || statusColors.PENDING)}>
                    {batch.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatBatchDate(batch.receivedDate)}</TableCell>
              </TableRow>
            ))
          ) : (
            mockBatches.map((batch) => (
              <TableRow key={batch.code} className="cursor-pointer">
                <TableCell className="font-mono text-sm font-medium">{batch.code}</TableCell>
                <TableCell className="text-sm">{batch.supplier}</TableCell>
                <TableCell className="text-sm text-right font-medium">{batch.qty.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-right">{batch.good.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-right">{batch.bad}</TableCell>
                <TableCell>
                  <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", statusColors[batch.status] || statusColors.PENDING)}>
                    {batch.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{batch.date}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
