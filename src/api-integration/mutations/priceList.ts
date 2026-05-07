import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { PriceCategory } from "../../Pages/adminPages/createPriceListsPage/components/priceListTypes";
import type { PriceItem } from "../queries/priceList";

export type CreatePriceItemPayload = {
  name: string;
  category: PriceCategory;
  description?: string;
  unit?: string;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
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

export const deletePriceItemApi = async (id: string): Promise<{ ok: boolean }> => {
  const res = await api.delete(`/price-list/${id}`);
  return res.data as { ok: boolean };
};

export const useCreatePriceItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPriceItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-list"] });
    },
  });
};

export const useUpdatePriceItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePriceItemApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["price-list"] });
      queryClient.invalidateQueries({ queryKey: ["price-list", data._id] });
    },
  });
};

export const useDeletePriceItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePriceItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-list"] });
    },
  });
};
