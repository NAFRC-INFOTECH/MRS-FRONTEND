import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { useLabReferralsQuery, type LabReferral } from "@/api-integration/queries/lab";
import { useUpdateLabReferralStatusMutation } from "@/api-integration/mutations/labReferrals";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function XrayPatientsList() {
  const [status, setStatus] = useState<string>("PENDING");
  const { data: referrals = [], isLoading } = useLabReferralsQuery(status);
  const updateStatus = useUpdateLabReferralStatusMutation();
  const navigate = useNavigate();

  const rows = useMemo(() => {
    return (referrals as LabReferral[])
      .filter((r) => (r.to || "").toLowerCase() === "x-ray")
      .map((r) => ({
        id: r.id,
        patientId: r.patientId,
        date: r.date ? new Date(r.date).toLocaleDateString() : "-",
        name: [r.surname, r.forenames].filter(Boolean).join(", "),
        serviceNoOrUUID: r.serviceNoOrUUID || r.patientId,
        age: r.age || "-",
        imagingArea: r.specimen || "-",
        examinationRequired: r.examinationRequired || "-",
        status: r.status,
      }));
  }, [referrals]);

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">X-Ray Patients</h2>

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
        <table className="min-w-full overflow-hidden rounded-t-[8px] border border-gray-200">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left">S/N</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Service No / UUID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Age</th>
              <th className="px-4 py-2 text-left">Imaging Area</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((r, idx) => (
                <tr key={r.id} className="border-b border-gray-200 even:bg-[#f9f9f9]">
                  <td className="px-4 py-2 whitespace-nowrap">{idx + 1}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.serviceNoOrUUID}</td>
                  <td className="px-4 py-2 font-medium whitespace-nowrap">{r.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.age}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.imagingArea}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.status}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4 rotate-90" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={updateStatus.isPending || r.status === "COMPLETED"}
                          onClick={() => {
                            updateStatus.mutate(
                              { id: r.id, status: "RECEIVED" },
                              {
                                onSuccess: () => toast.success("Marked as Received"),
                                onError: () => toast.error("Failed to update"),
                              }
                            );
                          }}
                        >
                          Mark as Received
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          disabled={updateStatus.isPending || r.status === "COMPLETED"}
                          onClick={() => {
                            updateStatus.mutate(
                              { id: r.id, status: "COMPLETED" },
                              {
                                onSuccess: () => toast.success("Marked as Completed"),
                                onError: () => toast.error("Failed to update"),
                              }
                            );
                          }}
                        >
                          Mark as Completed
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => {
                            navigate(`/xray/patient-list/${r.patientId}`);
                          }}
                        >
                          Required Test
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => toast.info("Refer back to doctor")}>
                          Refer Back to Doctor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-center">
                  No referred patients.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
