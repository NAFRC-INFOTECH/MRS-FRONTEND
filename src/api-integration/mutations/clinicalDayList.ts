import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export const addClinicalDayListApi = async (payload: { patientId: string; targetDepartment: "EarDoctor" | "EyeDoctor"; sourceDepartment?: string }): Promise<any> => {
  const res = await api.post("/clinical/daylist", payload);
  return res.data;
};

export const useAddClinicalDayListMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { patientId: string; targetDepartment: "EarDoctor" | "EyeDoctor"; sourceDepartment?: string }) => addClinicalDayListApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinical", "daylist"] });
    },
  });
};

