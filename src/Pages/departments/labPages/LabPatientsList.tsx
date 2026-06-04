import { useMemo, useState } from "react";
import { useLabReferralsQuery, type LabReferral } from "@/api-integration/queries/lab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUpdateLabReferralStatusMutation } from "@/api-integration/mutations/labReferrals";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LabPatientsList() {
  const [status, setStatus] = useState<string>("PENDING");
  const { data: referrals = [], isLoading } = useLabReferralsQuery(status);
  const updateStatus = useUpdateLabReferralStatusMutation();
  const navigate = useNavigate();

  const rows = useMemo(() => {
    return (referrals as LabReferral[]).map((r) => ({
      id: r.id,
      patientId: r.patientId,
      date: r.date ? new Date(r.date).toLocaleDateString() : "-",
      name: [r.surname, r.forenames].filter(Boolean).join(", "),
      serviceNoOrUUID: r.serviceNoOrUUID || r.patientId,
      age: r.age || "-",
      specimen: r.specimen || "-",
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Lab Patients</h2>

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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left">S/N</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">
                Service No / UUID
              </th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Age</th>
              <th className="px-4 py-2 text-left">Specimen</th>
              <th className="px-4 py-2 text-left">Payment</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Loading */}
            {isLoading && (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  Loading…
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {!isLoading &&
              rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className="even:bg-[#f9f9f9] border-b border-gray-200"
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {r.serviceNoOrUUID}
                  </td>
                  <td className="px-4 py-2 font-medium whitespace-nowrap">
                    {r.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {r.age}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {r.specimen}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getBillingRouteBadge(r.billingRoute)}
                      {getClearanceBadge(r)}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {r.status}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-4 py-2 whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4 rotate-90" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {/* Status Actions */}
                        <DropdownMenuItem
                          disabled={
                            updateStatus.isPending ||
                            r.status === "COMPLETED" ||
                            !r.isCleared
                          }
                          onClick={() => {
                            updateStatus.mutate(
                              { id: r.id, status: "RECEIVED" },
                              {
                                onSuccess: () =>
                                  toast.success("Marked as Received"),
                                onError: () =>
                                  toast.error("Failed to update"),
                              }
                            );
                          }}
                        >
                          Mark as Received
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          disabled={
                            updateStatus.isPending ||
                            r.status === "COMPLETED" ||
                            !r.isCleared
                          }
                          onClick={() => {
                            updateStatus.mutate(
                              { id: r.id, status: "COMPLETED" },
                              {
                                onSuccess: () =>
                                  toast.success("Marked as Completed"),
                                onError: () =>
                                  toast.error("Failed to update"),
                              }
                            );
                          }}
                        >
                          Mark as Completed
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Lab Actions */}
                        <DropdownMenuItem
                          disabled={!r.isCleared}
                          onClick={() => {
                            if (!r.isCleared) return;
                            navigate(`/lab/patient-list/${r.patientId}`);
                          }}
                        >
                          Required Test
                        </DropdownMenuItem>

                        <DropdownMenuItem
                        >
                          Refer Back to Doctor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}

            {/* Empty State */}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4">
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
