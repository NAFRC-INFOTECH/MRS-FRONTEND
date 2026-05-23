import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type EventRecord = {
  _id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  version?: number;
  occurredAt: string;
  payload: Record<string, any>;
  meta?: Record<string, any>;
};

export const getEventsApi = async (params?: {
  aggregateType?: string;
  aggregateId?: string;
  eventType?: string;
  from?: string;
  to?: string;
  limit?: number;
  skip?: number;
}): Promise<EventRecord[]> => {
  const res = await api.get("/events", { params });
  return res.data as EventRecord[];
};

export const useEventsQuery = (params?: {
  aggregateType?: string;
  aggregateId?: string;
  eventType?: string;
  from?: string;
  to?: string;
  limit?: number;
  skip?: number;
}) => {
  return useQuery({
    queryKey: [
      "events",
      params?.aggregateType ?? "",
      params?.aggregateId ?? "",
      params?.eventType ?? "",
      params?.from ?? "",
      params?.to ?? "",
      String(params?.limit ?? ""),
      String(params?.skip ?? "")
    ],
    queryFn: () => getEventsApi(params)
  });
};

