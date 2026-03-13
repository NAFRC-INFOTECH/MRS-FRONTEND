import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export const addDoctorDayListApi = async (payload: { patientId: string; sourceDepartment?: string }): Promise<any> => {
  const res = await api.post("/doctors/daylist", payload);
  return res.data;
};

export const useAddDoctorDayListMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { patientId: string; sourceDepartment?: string }) => addDoctorDayListApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctors", "daylist"] });
    },
  });
};
