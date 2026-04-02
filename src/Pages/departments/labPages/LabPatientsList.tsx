import { useMemo, useState } from "react";
import { useLabReferralsQuery, type LabReferral } from "@/api-integration/queries/lab";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUpdateLabReferralStatusMutation } from "@/api-integration/mutations/labReferrals";
import { toast } from "sonner";
 
export default function LabPatientsList() {
  const [status, setStatus] = useState<string>("PENDING");
  const { data: referrals = [], isLoading } = useLabReferralsQuery(status);
  const updateStatus = useUpdateLabReferralStatusMutation();
 
  const rows = useMemo(() => {
    return (referrals as LabReferral[]).map((r) => ({
      id: r.id,
      date: r.date ? new Date(r.date).toLocaleDateString() : "-",
      name: [r.surname, r.forenames].filter(Boolean).join(", "),
      serviceNoOrUUID: r.serviceNoOrUUID || r.patientId,
      age: r.age || "-",
      specimen: r.specimen || "-",
      examinationRequired: r.examinationRequired || "-",
      status: r.status,
    }));
  }, [referrals]);
 
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Lab Referred Patients</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status</span>
          <Select value={status} onValueChange={(v) => setStatus(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="RECEIVED">Received</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
 
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left">S/N</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Service No / UUID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Age</th>
              <th className="px-4 py-2 text-left">Specimen</th>
              <th className="px-4 py-2 text-left">Examination</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">Loading…</td>
              </tr>
            )}
            {!isLoading && rows.map((r, idx) => (
              <tr key={r.id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.serviceNoOrUUID}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{r.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.age}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.specimen}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.examinationRequired}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.status}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updateStatus.isPending || r.status === "COMPLETED"}
                      onClick={() => {
                        updateStatus.mutate({ id: r.id, status: "RECEIVED" }, {
                          onSuccess: () => toast.success("Marked as Received"),
                          onError: () => toast.error("Failed to update"),
                        });
                      }}
                    >
                      Mark Received
                    </Button>
                    <Button
                      size="sm"
                      disabled={updateStatus.isPending || r.status === "COMPLETED"}
                      onClick={() => {
                        updateStatus.mutate({ id: r.id, status: "COMPLETED" }, {
                          onSuccess: () => toast.success("Marked as Completed"),
                          onError: () => toast.error("Failed to update"),
                        });
                      }}
                      className="bg-[#56bbe3] text-white"
                    >
                      Mark Completed
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4">No referred patients.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
