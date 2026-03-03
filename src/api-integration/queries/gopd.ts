import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type GopdQueueItem = {
  _id: string;
  patientId: string;
  category?: string;
  cardNumber?: string;
  fullName?: string;
  phone?: string;
  rank?: string;
};

export const getGopdQueueApi = async (): Promise<GopdQueueItem[]> => {
  const res = await api.get("/gopd/queue");
  return res.data as any;
};

export const useGopdQueueQuery = () => {
  return useQuery({
    queryKey: ["gopd-queue"],
    queryFn: () => getGopdQueueApi(),
  });
};
