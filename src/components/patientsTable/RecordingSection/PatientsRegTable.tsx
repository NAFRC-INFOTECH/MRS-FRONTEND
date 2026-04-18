import { useEffect, useMemo, useState } from "react";
import { PlusIcon, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import type { PatientCondition, PatientStatus } from "../patientsDatas/types";
import { usePatientsQuery } from "@/api-integration/queries/patients";
import { useDeletePatientMutation, useUpdatePatientMutation } from "@/api-integration/mutations/patients";
import { toast } from "sonner";
import { useSearch } from "@/contexts/SearchContext";

export default function PatientsRegTable() {
  const q = usePatientsQuery();
  const [patients, setPatients] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "">("");
  const [searchCard, setSearchCard] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"" | "civilian" | "personnel">("");
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const del = useDeletePatientMutation();
  const update = useUpdatePatientMutation();
  const { query } = useSearch();

  const navigate = useNavigate();
  useEffect(() => {
    if (q.data) setPatients(q.data as any);
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

    if (action === "edit") {
      navigate(`/recordings/edit/${id}`);
      return;
    }

    if (action === "transfer") {
      update.mutate({ id, data: { patientQueue: "godp_vitals", patientStatus: "in_queue" as PatientStatus } }, {
        onSuccess: () => toast.success("Transferred to GOPD patients list"),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Transfer failed");
          update.mutate({ id, data: { patientStatus: "ok" as PatientStatus } });
        },
      });
      return;
    }

    const statusMap: Record<string, PatientStatus> = {
      "activate": "active",
      "deactivate": "inactive",
      "discharge": "discharged",
      "recover": "active",
    };
    if (statusMap[action]) {
      update.mutate({ id, data: { patientStatus: statusMap[action] } }, {
        onSuccess: () => toast.success("Status updated"),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Update failed");
        },
      });
      return;
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
      case "in_queue":
        return "bg-blue-100 text-blue-800";
      case "ok":
        return "bg-green-100 text-green-800";
    }
  };

  // Condition colors removed (column hidden). Re-enable if condition is displayed.

  // Filter by status AND search by name
  const rows = useMemo(() => {
    const list = (patients as any[]).map((p) => {
      const id = String(p._id || p.personalInfo?.id || "");
      const fullName =
        p.personalInfo?.fullName ||
        [p.surname, p.firstname, p.middlename].filter(Boolean).join(" ") ||
        "";
      const phone = p.personalInfo?.phone || p.phone || "";
      const address = p.personalInfo?.address || p.address || "";
      const condition: PatientCondition | "" = (p.personalInfo?.condition as PatientCondition) || "";
      const status: PatientStatus | "" = (p.patientStatus as PatientStatus) || (p.personalInfo?.status as PatientStatus) || "active";
      const imageUrl = p.personalInfo?.imageUrl || "";
      const veteran = !!p.veteran;
      const cardNumber = veteran ? (p.serviceNumber || "") : (p.membershipNumber || "");
      const rank = veteran ? (p.rank || "") : "";
      return { id, fullName, phone, address, condition, status, imageUrl, raw: p, veteran, cardNumber, rank };
    });
    return list.filter((r) => {
      if (hiddenIds.includes(r.id)) return false;
      const nmOk = query ? r.fullName.toLowerCase().includes(query.toLowerCase()) : true;
      const stOk = statusFilter ? r.status === statusFilter : true;
      const catOk = categoryFilter ? (categoryFilter === "personnel" ? r.veteran : !r.veteran) : true;
      const cardOk = searchCard
        ? ((r.cardNumber || r.id) as string).toLowerCase().includes(searchCard.toLowerCase())
        : true;
      return nmOk && stOk && catOk && cardOk;
    });
  }, [patients, hiddenIds, query, searchCard, statusFilter, categoryFilter]);

  // Form moved to PatientBiodataForm component to avoid render loops in this table

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Patients</h2>
        <button
          onClick={() => navigate("/recordings/patients/new")}
          className="flex items-center px-4 py-2 bg-[#56bbe3] text-white rounded hover:bg-[#56bbe3]/70 rounded-[8px]"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add <span className="hidden md:inline-block ml-2">Patient</span>
        </button>
      </div>

      {/* Filters + Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 max-w-[70rem]">
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
        <select
          className="border p-2 rounded"
          value={categoryFilter || "all"}
          onChange={(e) =>
            setCategoryFilter(e.target.value === "all" ? "" : (e.target.value as "civilian" | "personnel"))
          }
        >
          <option value="all">All Categories</option>
          <option value="civilian">Civilian</option>
          <option value="personnel">Veteran</option>
        </select>

        <input
          type="text"
          placeholder="Search by Card/UUID"
          className="border p-2 rounded"
          value={searchCard}
          onChange={(e) => setSearchCard(e.target.value)}
        />
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left">S/N</th>
              <th className="px-4 py-2 text-left">Card No</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.cardNumber || "-"}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{r.fullName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.phone || "-"}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.rank || "-"}</td>
                <td className="p-2">
                  {r.status ? (
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(r.status)}`}>
                      {r.status.toUpperCase()}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded">
                      <MoreVertical className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["edit","transfer"].map((action) => (
                        <DropdownMenuItem
                          key={action}
                          className={action === "delete" ? "text-red-600" : ""}
                          onClick={() => handleAction(r.id, action)}
                        >
                          {action === "edit"
                            ? "Edit Biodata"
                            : "Transfer to GOPD patients List"}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
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
