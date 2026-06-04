import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import { savePriceSummaryApi, type PriceItem } from "../queries/priceList";

export type CreatePriceItemPayload = {
  name: string;
  category: string;
  description?: string;
  unit?: string;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
  stockQuantity?: number;
  soldQuantity?: number;
};

export type UpdatePriceItemPayload = Partial<CreatePriceItemPayload>;

export const createPriceItemApi = async (payload: CreatePriceItemPayload): Promise<PriceItem> => {
  const res = await api.post("/price-list", payload);
  return res.data as PriceItem;
};

export const updatePriceItemApi = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePriceItemPayload;
}): Promise<PriceItem> => {
  const res = await api.patch(`/price-list/${id}`, payload);
  return res.data as PriceItem;
};

export const dispensePriceItemApi = async ({
  id,
  quantity,
}: {
  id: string;
  quantity: number;
}): Promise<PriceItem> => {
  const res = await api.patch(`/price-list/${id}/dispense`, { quantity });
  return res.data as PriceItem;
};

export const occupyBedApi = async ({ id, quantity }: { id: string; quantity: number }): Promise<PriceItem> => {
  const res = await api.patch(`/price-list/${id}/bed/occupy`, { quantity });
  return res.data as PriceItem;
};

export const releaseBedApi = async ({ id, quantity }: { id: string; quantity: number }): Promise<PriceItem> => {
  const res = await api.patch(`/price-list/${id}/bed/release`, { quantity });
  return res.data as PriceItem;
};

export const deletePriceItemApi = async (id: string): Promise<{ ok: boolean }> => {
  const res = await api.delete(`/price-list/${id}`);
  return res.data as { ok: boolean };
};

export const clonePriceListMonthApi = async (payload: {
  fromMonth: string;
  toMonth: string;
  overwrite?: boolean;
  resetSoldQuantity?: boolean;
  resetStockQuantity?: boolean;
}): Promise<{ ok: boolean; fromMonth: string; toMonth: string; sourceCount: number; deletedCount: number; createdCount: number }> => {
  const res = await api.post("/price-list/clone-month", payload);
  return res.data as { ok: boolean; fromMonth: string; toMonth: string; sourceCount: number; deletedCount: number; createdCount: number };
};

export const useCreatePriceItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPriceItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-list", "items"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "summary"] });
    },
  });
};

export const useUpdatePriceItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePriceItemApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["price-list", "items"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "detail", data._id] });
    },
  });
};

export const useDispensePriceItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dispensePriceItemApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["price-list", "items"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "detail", data._id] });
    },
  });
};

export const useOccupyBedMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: occupyBedApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["price-list", "items"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "detail", data._id] });
    },
  });
};

export const useReleaseBedMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: releaseBedApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["price-list", "items"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "detail", data._id] });
    },
  });
};

export const useDeletePriceItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePriceItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-list", "items"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "summary"] });
    },
  });
};

export const useClonePriceListMonthMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clonePriceListMonthApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-list", "items"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", "summary"] });
    },
  });
};

export const useSavePriceSummaryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePriceSummaryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-list", "summary"] });
    },
  });
};
