import { useEffect, useMemo, useState } from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import type { PatientCondition, PatientStatus } from "./patientsDatas/types";
import { useSearch } from "@/contexts/SearchContext";
import { useDeletePatientMutation, useUpdatePatientMutation } from "@/api-integration/mutations/patients";
import { usePatientsQuery } from "@/api-integration/queries/patients";
import { toast } from "sonner";

export default function PatientsTable() {
  const q = usePatientsQuery();
  const [patients, setPatients] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "">("");
  const [searchServiceNo, setSearchServiceNo] = useState("");
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const { query } = useSearch();
  const del = useDeletePatientMutation();
  const update = useUpdatePatientMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (q.data) setPatients(q.data as any[]);
  }, [q.data]);
  // Handle actions
  const handleAction = (id: string, action: string) => {
    if (action === "delete") {
      setHiddenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      del.mutate(id, {
        onSuccess: () => toast.success("Patient deleted"),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Delete failed");
          setHiddenIds((prev) => prev.filter((x) => x !== id));
        },
      });
      return;
    }

    if (action === "profile") {
      navigate(`/recordings/edit/${id}`);
      return;
    }

    const statusMap: Record<string, PatientStatus> = {
      activate: "active",
      deactivate: "inactive",
      discharge: "discharged",
      recover: "active",
    };

    if (statusMap[action]) {
      update.mutate(
        { id, data: { patientStatus: statusMap[action] } },
        {
          onSuccess: () => toast.success("Patient status updated"),
          onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err ?? "");
            toast.error(msg || "Update failed");
          },
        }
      );
    }
  };

  // Status colors
  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "discharged":
        return "bg-red-100 text-red-800";
    }
  };

  // Condition colors
  const getConditionColor = (condition: PatientCondition) => {
    switch (condition) {
      case "on medication":
        return "bg-blue-100 text-blue-800";
      case "on sick bed":
        return "bg-yellow-100 text-yellow-800";
      case "discharged":
        return "bg-red-100 text-red-800";
      case "recovered":
        return "bg-green-100 text-green-800";
    }
  };

  const filteredPatients = useMemo(() => {
    const rows = (patients as any[]).map((p) => {
      const id = String(p._id || p.personalInfo?.id || "");
      const veteran = !!p.veteran;
      const fullName =
        p.personalInfo?.fullName ||
        [p.surname, p.firstname, p.middlename].filter(Boolean).join(" ") ||
        "";
      const phone = p.personalInfo?.phone || p.phone || "";
      const email = p.personalInfo?.email || p.email || "";
      const address = p.personalInfo?.address || p.address || "";
      const serviceNumber = veteran
        ? (p.serviceNumber || "")
        : (p.membershipNumber || p.memberNumber || "");
      const rawCondition = (p.personalInfo?.condition as PatientCondition | undefined) || undefined;
      const status = (p.patientStatus as PatientStatus | undefined) || (p.personalInfo?.status as PatientStatus | undefined) || "active";
      const condition =
        rawCondition ||
        (status === "inactive"
          ? "on sick bed"
          : status === "discharged"
          ? "discharged"
          : status === "active"
          ? "on medication"
          : "recovered");
      const imageUrl = p.personalInfo?.imageUrl || "";
      return { id, fullName, phone, email, address, serviceNumber, condition, status, imageUrl };
    });

    return rows.filter(
      (p) =>
        !hiddenIds.includes(p.id) &&
        (statusFilter ? p.status === statusFilter : true) &&
        (searchServiceNo
          ? `${p.serviceNumber} ${p.id}`.toLowerCase().includes(searchServiceNo.toLowerCase())
          : true) &&
        (query ? p.fullName.toLowerCase().includes(query.toLowerCase()) : true)
    );
  }, [patients, hiddenIds, query, searchServiceNo, statusFilter]);


  console.log(filteredPatients)

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">View All Patients</h2>
      </div>

      {/* Filters + Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 max-w-[50rem]">
        <select
          className="border p-2 rounded"
          value={statusFilter || "all"}
          onChange={(e) =>
            setStatusFilter(
              e.target.value === "all" ? "" : (e.target.value as PatientStatus)
            )
          }
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="discharged">Discharged</option>
        </select>

        <input
          type="text"
          placeholder="Search by Service No/UUID"
          className="border p-2 rounded col-span-2"
          value={searchServiceNo}
          onChange={(e) => setSearchServiceNo(e.target.value)}
        />
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap">Service No / UUID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Condition</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading && (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  Loading patients...
                </td>
              </tr>
            )}
            {q.isError && !q.isLoading && (
              <tr>
                <td colSpan={9} className="text-center py-4 text-red-600">
                  Failed to load patients.
                </td>
              </tr>
            )}
            {!q.isLoading && !q.isError && filteredPatients.map((p) => (
              <tr
                key={p.id}
                className="even:bg-[#f9f9f9] border-b border-gray-200"
              >
                
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium">{p.serviceNumber || "-"}</span>
                    {/* <span className="text-xs text-gray-500">{p.id}</span> */}
                  </div>
                </td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">
                  {p.fullName}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {p.phone || "-"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {p.email || "-"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {p.address || "-"}
                </td>
                <td className="p-2 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getConditionColor(p.condition)}`}
                  >
                    {p.condition.toUpperCase()}
                  </span>
                </td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(p.status)}`}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded">
                      <MoreVertical className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {[
                        "profile",
                        "activate",
                        "deactivate",
                        "discharge",
                        "recover",
                        "delete",
                      ].map((action) => (
                        <DropdownMenuItem
                          key={action}
                          className={action === "delete" ? "text-red-600" : ""}
                          onClick={() =>
                            handleAction(p.id, action)
                          }
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}

            {!q.isLoading && !q.isError && filteredPatients.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
