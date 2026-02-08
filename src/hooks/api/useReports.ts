import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import type { ReportParams } from '@/types/api.types';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api';

export const reportKeys = {
  all: ['reports'] as const,
  dailySummary: (date?: string) => [...reportKeys.all, 'daily-summary', date] as const,
  dailySummaries: (params: ReportParams) => [...reportKeys.all, 'daily-summaries', params] as const,
  productionChart: (params: ReportParams) => [...reportKeys.all, 'production-chart', params] as const,
  auditLogs: (params: ReportParams) => [...reportKeys.all, 'audit-logs', params] as const,
  summary: (params: ReportParams) => [...reportKeys.all, 'summary', params] as const,
  profitability: (params: ReportParams) => [...reportKeys.all, 'profitability', params] as const,
  sales: (params: ReportParams) => [...reportKeys.all, 'sales', params] as const,
};

export const useDailySummary = (date?: string) => {
  return useQuery({
    queryKey: reportKeys.dailySummary(date),
    queryFn: () => reportsService.getDailySummary(date),
  });
};

export const useDailySummaries = (params: ReportParams) => {
  return useQuery({
    queryKey: reportKeys.dailySummaries(params),
    queryFn: () => reportsService.getDailySummaries(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useProductionChart = (params: ReportParams) => {
  return useQuery({
    queryKey: reportKeys.productionChart(params),
    queryFn: () => reportsService.getProductionChart(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useAuditLogs = (params: ReportParams) => {
  return useQuery({
    queryKey: reportKeys.auditLogs(params),
    queryFn: () => reportsService.getAuditLogs(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useReportSummary = (params: ReportParams) => {
  return useQuery({
    queryKey: reportKeys.summary(params),
    queryFn: () => reportsService.getSummary(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useProfitabilityReport = (params: ReportParams) => {
  return useQuery({
    queryKey: reportKeys.profitability(params),
    queryFn: () => reportsService.getProfitabilityReport(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useSalesReport = (params: ReportParams) => {
  return useQuery({
    queryKey: reportKeys.sales(params),
    queryFn: () => reportsService.getSalesReportData(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useGenerateDailySummary = () => {
  return useMutation({
    mutationFn: (date?: string) => reportsService.generateDailySummary(date),
    onSuccess: () => {
      toast.success('Daily summary generated successfully');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const useGenerateProductionReport = () => {
  return useMutation({
    mutationFn: (params: ReportParams) => reportsService.generateProductionReport(params),
    onSuccess: (blob) => {
      downloadBlob(blob, `production-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Production report downloaded');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useGenerateSalesReport = () => {
  return useMutation({
    mutationFn: (params: ReportParams) => reportsService.generateSalesReport(params),
    onSuccess: (blob) => {
      downloadBlob(blob, `sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Sales report downloaded');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useGenerateExpenseReport = () => {
  return useMutation({
    mutationFn: (params: ReportParams) => reportsService.generateExpenseReport(params),
    onSuccess: (blob) => {
      downloadBlob(blob, `expense-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Expense report downloaded');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};

export const useGenerateFinancialReport = () => {
  return useMutation({
    mutationFn: (params: ReportParams) => reportsService.generateFinancialReport(params),
    onSuccess: (blob) => {
      downloadBlob(blob, `financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Financial report downloaded');
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      toast.error(apiError.message);
    },
  });
};
