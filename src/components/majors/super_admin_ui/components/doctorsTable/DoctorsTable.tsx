import { useState } from "react";
import { PlusIcon, MoreVertical } from "lucide-react"; // shadcn recommends lucide icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DoctorStatus } from "./types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { dummyDoctors } from "@/dummyData/dummyDoctor";
import type { doctorProfile } from "@/types/doctorProfile";


export default function DoctorsTable() {
  const [doctors, setDoctors] = useState(dummyDoctors);
  const [filters, setFilters] = useState<{
    status: DoctorStatus | "";
    hospital: string;
    specialty: string;
  }>({
    status: "",
    hospital: "",
    specialty: "",
  });

  const navigate = useNavigate();

  const handleAction = (id: string, action: string) => {
  if (action === "delete") {
    // Remove doctor by personalInfo.id
    setDoctors((prev) => prev.filter((doc) => doc.personalInfo.id !== id));
    return;
  }

  if (action === "profile") {
    navigate(`/mrs-admin/doctors/${id}`);
    return;
  }

  // Update status for other actions
  setDoctors((prev) =>
    prev.map((doc) =>
      doc.personalInfo.id === id
        ? {
            ...doc,
            personalInfo: {
              ...doc.personalInfo,
              status:
                action === "activate"
                  ? "active"
                  : action === "assign"
                  ? "assigned"
                  : action === "suspend"
                  ? "suspended"
                  : action === "sack"
                  ? "sacked"
                  : doc.personalInfo.status,
            },
          }
        : doc
    )
  );
};

  const getStatusColor = (status: doctorProfile["personalInfo"]["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      case "sacked":
        return "bg-red-100 text-red-800";
    }
  };

  const filteredDoctors = doctors.filter((doc) =>
    (filters.status ? doc.personalInfo.status === filters.status : true) &&
    (filters.hospital
      ? doc.personalInfo.hospital.toLowerCase().includes(filters.hospital.toLowerCase())
      : true) &&
    (filters.specialty
      ? doc.qualifications.specialization
          .toLowerCase()
          .includes(filters.specialty.toLowerCase())
      : true)
  );


  return (
    <div className="">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">View all Doctors</h2>
        <button
          // onClick={handleAddSpecialist}
          className="flex items-center px-4 py-2 bg-[#56bbe3] text-white rounded hover:bg-[#56bbe3]/70 rounded-[8px]"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add <span className="hidden md:inline-block ml-2">Specialist</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 max-w-[50rem]">
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value === "all" ? "" : (value as DoctorStatus),
            }))
          }
        >
          <SelectTrigger className="w-full py-5">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="sacked">Sacked</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <input
          type="text"
          placeholder="Filter by Hospital"
          className="border p-2 rounded"
          value={filters.hospital}
          onChange={(e) => setFilters((prev) => ({ ...prev, hospital: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Filter by Specialty"
          className="border p-2 rounded span-cols-2"
          value={filters.specialty}
          onChange={(e) => setFilters((prev) => ({ ...prev, specialty: e.target.value }))}
        />
      </div>

      {/* Doctors Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr className="">
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">UUID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Specialty</th>
              <th className="px-4 py-2 text-left">Hospital</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doc) => (
              <tr
                key={doc.personalInfo.id}
                // onClick={() => handleRowClick(doc.id)}
                className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#56bbe3] p-1 overflow-hidden">
                    <img src={doc.personalInfo.imageUrl} alt={doc.personalInfo.fullName} className="w-full h-full object-cover rounded-full" />
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{doc.personalInfo.id}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{doc.personalInfo.fullName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{doc.qualifications.specialization}</td>
                <td className="px-4 py-2 whitespace-nowrap">{doc.personalInfo.hospital}</td>
                <td className={`p-2`}>
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(doc.personalInfo.status)}`}>
                    {doc.personalInfo.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded">
                      <MoreVertical className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["profile","activate", "assign", "suspend", "sack", "delete"].map((action) => (
                        <DropdownMenuItem
                          key={action}
                          className={action === "delete" ? "text-red-600" : ""}
                          onClick={() => handleAction(doc.personalInfo.id, action)}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filteredDoctors.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
