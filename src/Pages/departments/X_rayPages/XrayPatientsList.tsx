import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { useXrayReferralsQuery, type XrayReferral } from "@/api-integration/queries/xray";
import { useUpdateXrayReferralStatusMutation } from "@/api-integration/mutations/xrayReferrals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const { data: referrals = [], isLoading } = useXrayReferralsQuery({ status });
  const updateStatus = useUpdateXrayReferralStatusMutation();
  const navigate = useNavigate();

  const rows = useMemo(() => {
    return (referrals as XrayReferral[]).map((r) => ({
        id: r.id,
        patientId: r.patientId,
        date: r.date ? new Date(r.date).toLocaleDateString() : "-",
        name: [r.surname, r.forenames].filter(Boolean).join(", "),
        serviceNoOrUUID: r.serviceNoOrUUID || r.patientId,
        age: r.age || "-",
        imagingArea: r.imagingArea || "-",
        examinationRequired: r.examinationRequired || "-",
        status: r.status,
        billingRoute: r.billingRoute,
        isCleared: !!r.isCleared,
        clearanceLabel: r.clearanceLabel || (r.isCleared ? "Cleared" : "Not Cleared"),
      }));
  }, [referrals]);

  const getBillingRouteBadge = (billingRoute?: string) => {
    const v = String(billingRoute || "").toLowerCase();
    if (v === "nhia") return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">NHIA</Badge>;
    if (v === "paypoint") return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Paypoint</Badge>;
    return <Badge variant="outline">-</Badge>;
  };

  const getClearanceBadge = (row: { isCleared: boolean; clearanceLabel: string }) => {
    if (row.isCleared) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Cleared</Badge>;
    const label = String(row.clearanceLabel || "");
    if (label.toLowerCase().includes("nhia")) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{label}</Badge>;
    }
    if (label.toLowerCase().includes("copay")) {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{label}</Badge>;
    }
    if (label.toLowerCase().includes("awaiting")) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{label}</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{label || "Not Cleared"}</Badge>;
  };

  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Radiology Patients</h2>

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
              <th className="px-4 py-2 text-left">Payment</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={9} className="py-4 text-center text-gray-500">
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
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getBillingRouteBadge(r.billingRoute)}
                      {getClearanceBadge(r)}
                    </div>
                  </td>
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
                          disabled={updateStatus.isPending || r.status === "COMPLETED" || !r.isCleared}
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
                          disabled={updateStatus.isPending || r.status === "COMPLETED" || !r.isCleared}
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
                          disabled={!r.isCleared}
                          onClick={() => {
                            if (!r.isCleared) return;
                            navigate(`/radiology/patient-list/${r.patientId}`);
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
                <td colSpan={9} className="py-4 text-center">
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
