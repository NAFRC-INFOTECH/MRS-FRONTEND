import { useState } from "react";
import { PlusIcon, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

// Type for nurse status
type NurseStatus = "active" | "assigned" | "suspended" | "sacked";

// Dummy nurses data
const dummyNurses: {
  personalInfo: {
    id: string;
    fullName: string;
    imageUrl: string;
    status: NurseStatus;
  };
  department: string;
}[] = [
  {
    personalInfo: {
      id: "NUR-1001",
      fullName: "Alice Johnson",
      imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      status: "active",
    },
    department: "Pediatrics",
  },
  {
    personalInfo: {
      id: "NUR-1002",
      fullName: "Brian Smith",
      imageUrl: "https://randomuser.me/api/portraits/men/45.jpg",
      status: "assigned",
    },
    department: "Emergency",
  },
  {
    personalInfo: {
      id: "NUR-1003",
      fullName: "Clara Evans",
      imageUrl: "https://randomuser.me/api/portraits/women/46.jpg",
      status: "suspended",
    },
    department: "ICU",
  },
  {
    personalInfo: {
      id: "NUR-1004",
      fullName: "David Lee",
      imageUrl: "https://randomuser.me/api/portraits/men/47.jpg",
      status: "sacked",
    },
    department: "Surgery",
  },
];

export default function NursesTable() {
  const [nurses, setNurses] = useState(dummyNurses);
  const [filters, setFilters] = useState<{
    status: NurseStatus | "";
    department: string;
  }>({
    status: "",
    department: "",
  });

  const navigate = useNavigate();

  const handleAction = (id: string, action: string) => {
    if (action === "delete") {
      setNurses((prev) => prev.filter((n) => n.personalInfo.id !== id));
      return;
    }

    if (action === "profile") {
      navigate(`/hospital-admin/nurses/${id}`);
      return;
    }

    setNurses((prev) =>
      prev.map((n) =>
        n.personalInfo.id === id
          ? {
              ...n,
              personalInfo: {
                ...n.personalInfo,
                status:
                  action === "activate"
                    ? "active"
                    : action === "assign"
                    ? "assigned"
                    : action === "suspend"
                    ? "suspended"
                    : action === "sack"
                    ? "sacked"
                    : n.personalInfo.status,
              },
            }
          : n
      )
    );
  };

  const getStatusColor = (status: NurseStatus) => {
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

  const filteredNurses = nurses.filter(
    (n) =>
      (filters.status ? n.personalInfo.status === filters.status : true) &&
      (filters.department
        ? n.department.toLowerCase().includes(filters.department.toLowerCase())
        : true)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">View all Nurses</h2>
        <button className="flex items-center px-4 py-2 bg-[#56bbe3] text-white rounded hover:bg-[#56bbe3] rounded-[8px]">
          <PlusIcon className="w-5 h-5 mr-2" /> Add <span className="hidden md:inline-block ml-2">Nurse</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-4 max-w-[50rem]">
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value === "all" ? "" : (value as NurseStatus),
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
          placeholder="Filter by Department"
          className="border p-2 rounded"
          value={filters.department}
          onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
        />
      </div>

      {/* Nurses Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">UUID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredNurses.map((n) => (
              <tr key={n.personalInfo.id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#56bbe3] p-1 overflow-hidden">
                    <img
                      src={n.personalInfo.imageUrl}
                      alt={n.personalInfo.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{n.personalInfo.id}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{n.personalInfo.fullName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{n.department}</td>
                <td className="p-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getStatusColor(n.personalInfo.status)}`}
                  >
                    {n.personalInfo.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded">
                      <MoreVertical className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["profile", "activate", "assign", "suspend", "sack", "delete"].map((action) => (
                        <DropdownMenuItem
                          key={action}
                          className={action === "delete" ? "text-red-600" : ""}
                          onClick={() => handleAction(n.personalInfo.id, action)}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filteredNurses.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No nurses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
