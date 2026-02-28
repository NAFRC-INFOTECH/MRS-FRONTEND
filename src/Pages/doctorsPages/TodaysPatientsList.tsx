

import { useState } from "react";
import { PlusIcon, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { dummyPatients } from "@/components/patientsTable/patientsDatas/patientsData";
import type { PatientCondition, PatientStatus } from "@/components/patientsTable/patientsDatas/types";
// import { dummyPatients } from "./patientsDatas/patientsData";
// import type { PatientCondition, PatientStatus } from "./patientsDatas/types";


export default function TodaysPatientsList() {
  const [patients, setPatients] = useState(dummyPatients);
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "">("");
  const [searchName, setSearchName] = useState(""); // <--- search state

  const navigate = useNavigate();

  // Map condition to status
  const conditionToStatus = (condition: PatientCondition): PatientStatus => {
    switch (condition) {
      case "on medication":
      case "recovered":
        return "active";
      case "on sick bed":
        return "inactive";
      case "discharged":
        return "discharged";
    }
  };

  // Handle actions
  const handleAction = (id: string, action: string) => {
    if (action === "delete") {
      setPatients((prev) => prev.filter((p) => p.personalInfo.id !== id));
      return;
    }

    if (action === "profile") {
      navigate(`/hospital-admin/patients/${id}`);
      return;
    }

    const conditionActionMap: Record<string, PatientCondition> = {
      "activate": "on medication",
      "deactivate": "on sick bed",
      "discharge": "discharged",
      "recover": "recovered",
    };

    if (conditionActionMap[action]) {
      const newCondition = conditionActionMap[action];
      setPatients((prev) =>
        prev.map((p) =>
          p.personalInfo.id === id
            ? {
                ...p,
                personalInfo: {
                  ...p.personalInfo,
                  condition: newCondition,
                  status: conditionToStatus(newCondition),
                },
              }
            : p
        )
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

  // Filter by status AND search by name
  const filteredPatients = patients.filter(
    (p) =>
      (statusFilter ? p.personalInfo.status === statusFilter : true) &&
      (searchName
        ? p.personalInfo.fullName.toLowerCase().includes(searchName.toLowerCase())
        : true)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">View All Patients</h2>
        <button className="flex items-center px-4 py-2 bg-[#56bbe3] text-white rounded hover:bg-[#56bbe3]/70 rounded-[8px]">
          <PlusIcon className="w-5 h-5 mr-2" /> Add <span className="hidden md:inline-block ml-2">Patient</span>
        </button>
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
          placeholder="Search by Name"
          className="border p-2 rounded col-span-2"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">UUID</th>
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
            {filteredPatients.map((p) => (
              <tr key={p.personalInfo.id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#56bbe3] p-1 overflow-hidden">
                    <img
                      src={p.personalInfo.imageUrl}
                      alt={p.personalInfo.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{p.personalInfo.id}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{p.personalInfo.fullName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.personalInfo.phone}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.personalInfo.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{p.personalInfo.address}</td>
                <td className="p-2 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getConditionColor(
                      p.personalInfo.condition
                    )}`}
                  >
                    {p.personalInfo.condition.toUpperCase()}
                  </span>
                </td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                      p.personalInfo.status
                    )}`}
                  >
                    {p.personalInfo.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded">
                      <MoreVertical className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["profile", "activate", "deactivate", "discharge", "recover", "delete"].map((action) => (
                        <DropdownMenuItem
                          key={action}
                          className={action === "delete" ? "text-red-600" : ""}
                          onClick={() => handleAction(p.personalInfo.id, action)}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
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

