import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { PriceCategory, PriceSummary, SummaryPeriod } from "../../Pages/adminPages/createPriceListsPage/components/priceListTypes";

export type PriceItem = {
  _id: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
  stockQuantity: number;
  soldQuantity: number;
  createdAt: string;
  updatedAt: string;
};

export type ListPriceItemsQuery = {
  q?: string;
  category?: PriceCategory | "all";
  activeOnly?: boolean;
};

export type PriceSummaryFilters = {
  monthlyDate?: string;
  yearlyDate?: string;
};

export const getPriceItemsApi = async (query: ListPriceItemsQuery): Promise<PriceItem[]> => {
  const params = {
    q: query.q,
    category: query.category === "all" ? undefined : query.category,
    activeOnly: query.activeOnly,
  };
  const res = await api.get("/price-list", { params });
  return res.data as PriceItem[];
};

export const usePriceItemsQuery = (query: ListPriceItemsQuery) => {
  return useQuery({
    queryKey: ["price-list", "items", query],
    queryFn: () => getPriceItemsApi(query),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const getPriceItemApi = async (id: string): Promise<PriceItem> => {
  const res = await api.get(`/price-list/${id}`);
  return res.data as PriceItem;
};

export const usePriceItemQuery = (id: string | null) => {
  return useQuery({
    queryKey: ["price-list", "detail", id],
    queryFn: () => getPriceItemApi(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

const emptySummary = (period: SummaryPeriod): PriceSummary => ({
  period,
  from: "",
  to: "",
  totalItems: 0,
  activeItems: 0,
  drugs: 0,
  services: 0,
  servicesValue: 0,
  totalValue: 0,
  totalDrugs: 0,
  totalDrugsInStock: 0,
  totalDrugsSold: 0,
  totalDrugsSoldValue: 0,
});

const normalizeSummaryFilters = (filters?: PriceSummaryFilters): PriceSummaryFilters | undefined => {
  if (!filters) return undefined;
  const monthlyRaw = filters.monthlyDate?.trim();
  const yearlyRaw = filters.yearlyDate?.trim();
  const monthlyDate = monthlyRaw
    ? /^\d{4}-\d{2}$/.test(monthlyRaw)
      ? `${monthlyRaw}-01`
      : monthlyRaw
    : undefined;
  const yearlyDate = yearlyRaw
    ? /^\d{4}$/.test(yearlyRaw)
      ? `${yearlyRaw}-01-01`
      : yearlyRaw
    : undefined;

  return {
    monthlyDate,
    yearlyDate,
  };
};

export const getPriceSummariesApi = async (
  filters?: PriceSummaryFilters
): Promise<Record<SummaryPeriod, PriceSummary>> => {
  const params = normalizeSummaryFilters(filters);
  const res = await api.get("/price-list/summary", { params });
  const data = res.data as Partial<Record<SummaryPeriod, PriceSummary>>;
  return {
    monthly: data.monthly ?? emptySummary("monthly"),
    yearly: data.yearly ?? emptySummary("yearly"),
  };
};

export const usePriceSummariesQuery = (filters?: PriceSummaryFilters) => {
  return useQuery({
    queryKey: ["price-list", "summary", filters],
    queryFn: () => getPriceSummariesApi(filters),
    staleTime: Infinity, // Only refetch on manual invalidation
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: false,
  });
};

export const savePriceSummaryApi = async (summaryData: any): Promise<any> => {
  const res = await api.post("/price-list/summary", summaryData);
  return res.data;
};

export type TopSellingDrug = {
  _id: string;
  name: string;
  soldQuantity: number;
  stockQuantity: number;
  price: number;
  isActive: boolean;
  unit: string;
};

export const getTopSellingDrugsApi = async (opts?: { limit?: number; activeOnly?: boolean }): Promise<TopSellingDrug[]> => {
  const res = await api.get("/price-list/top-selling/drugs", { params: opts });
  return res.data as TopSellingDrug[];
};

export const useTopSellingDrugsQuery = (opts?: { limit?: number; activeOnly?: boolean }) => {
  return useQuery({
    queryKey: ["price-list", "top-selling-drugs", opts],
    queryFn: () => getTopSellingDrugsApi(opts),
    staleTime: 1000 * 30,
  });
};
