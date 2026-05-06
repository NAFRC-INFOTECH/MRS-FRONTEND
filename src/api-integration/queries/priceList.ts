import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { PriceCategory } from "../../Pages/adminPages/createPriceListsPage/components/priceListTypes";

export type PriceItem = {
  _id: string;
  name: string;
  category: PriceCategory;
  description: string;
  unit: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ListPriceItemsQuery = {
  q?: string;
  category?: PriceCategory | "all";
  activeOnly?: boolean;
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
    queryKey: ["price-list", query],
    queryFn: () => getPriceItemsApi(query),
  });
};

export const getPriceItemApi = async (id: string): Promise<PriceItem> => {
  const res = await api.get(`/price-list/${id}`);
  return res.data as PriceItem;
};

export const usePriceItemQuery = (id: string | null) => {
  return useQuery({
    queryKey: ["price-list", id],
    queryFn: () => getPriceItemApi(id!),
    enabled: !!id,
  });
};
