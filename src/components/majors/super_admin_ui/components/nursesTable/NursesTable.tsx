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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateNurseDirectMutation } from "@/api-integration/mutations/invitations";
import { useNursesQuery } from "@/api-integration/queries/nurses";

// Type for nurse status
type NurseStatus = "active" | "assigned" | "suspended" | "sacked";

// No local dummy data; fetched from API instead

export default function NursesTable() {
  const { data: nurseUsers = [], isLoading, isError } = useNursesQuery();
  const [filters, setFilters] = useState<{
    status: NurseStatus | "";
    department: string;
  }>({
    status: "",
    department: "",
  });

  const navigate = useNavigate();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const createNurse = useCreateNurseDirectMutation();

  const handleAction = (id: string, action: string) => {
    if (action === "profile") {
      navigate(`/hospital-admin/nurses/${id}`);
      return;
    }

    toast.info(`Action "${action}" is not implemented yet`);
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

  const mapped = (nurseUsers || []).map((u) => ({
    personalInfo: {
      id: u._id,
      fullName: u.name,
      imageUrl: u.imageUrl || "",
      status: "active" as NurseStatus, // accepted invite -> user exists
    },
    department: "",
  }));
  const filteredNurses = mapped.filter(
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
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center px-4 py-2 bg-[#56bbe3] text-white rounded hover:bg-[#56bbe3] rounded-[8px]"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add <span className="hidden md:inline-block ml-2">Nurse</span>
        </button>
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Nurse Account</DialogTitle>
            <DialogDescription>Enter the nurse&rsquo;s full name and email. A temporary password will be generated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Full Name (e.g., Jane Doe)"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="nurse@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowInvite(false)}
              disabled={createNurse.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/70"
              type="button"
              onClick={() => {
                if (!inviteEmail || !inviteName) return;
                createNurse.mutate(
                  { email: inviteEmail, name: inviteName },
                  {
                    onSuccess: (res) => {
                      toast.success(`Nurse created. Temp password: ${res.password}`);
                      setInviteEmail("");
                      setInviteName("");
                      setShowInvite(false);
                    },
                    onError: (err: unknown) => {
                      const msg = err instanceof Error ? err.message : String(err ?? "");
                      toast.error(msg || "Failed to create nurse account");
                    },
                  }
                );
              }}
              disabled={createNurse.isPending || !inviteEmail || !inviteName}
            >
              {createNurse.isPending ? "Creating..." : "Create Nurse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-6">Loading nurses...</td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-red-600">Failed to load nurses</td>
              </tr>
            )}
            {!isLoading && !isError && filteredNurses.map((n) => (
              <tr key={n.personalInfo.id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#56bbe3] p-1 overflow-hidden">
                    <img
                      src={n.personalInfo.imageUrl || "https://placehold.co/80x80"}
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
