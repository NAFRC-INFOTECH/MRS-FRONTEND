import { useMemo, useState } from "react";
import { PlusIcon, MoreVertical } from "lucide-react"; // shadcn recommends lucide icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import type { doctorProfile } from "@/api-integration/types/doctorProfile";
import { useDoctorsQuery } from "@/api-integration/queries/doctors";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateDoctorDirectMutation } from "@/api-integration/mutations/invitations";
import { useDeleteUserMutation, useSuspendUserMutation } from "@/api-integration/mutations/users";
import { useUpdateDoctorStatusMutation, useDeleteDoctorProfileMutation, useResetDoctorPasswordMutation } from "@/api-integration/mutations/doctorProfiles";
import { toast } from "sonner";


export default function DoctorsTable() {
  const { data, isLoading, isError } = useDoctorsQuery();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const createDoctor = useCreateDoctorDirectMutation();
  const deleteUser = useDeleteUserMutation();
  const suspendUser = useSuspendUserMutation();
  const updateStatus = useUpdateDoctorStatusMutation();
  const deleteProfile = useDeleteDoctorProfileMutation();
  const resetPassword = useResetDoctorPasswordMutation();
  const [showCreds, setShowCreds] = useState<{ open: boolean; name?: string; email?: string; password?: string }>({ open: false });
  const [filters, setFilters] = useState<{
    status: doctorProfile["personalInfo"]["status"] | "";
    hospital: string;
    specialty: string;
  }>({
    status: "",
    hospital: "",
    specialty: "",
  });

  console.log(data)

  const navigate = useNavigate();

  const handleAction = (id: string, action: string) => {
  if (action === "delete") {
    deleteUser.mutate(id, {
      onSuccess: () => {
        deleteProfile.mutate(id);
        toast.success("Doctor deleted");
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err ?? "");
        toast.error(msg || "Delete failed");
      },
    });
    return;
  }

  if (action === "profile") {
    navigate(`/mrs-admin/doctors/${id}`);
    return;
  }

  if (action === "activate") {
    updateStatus.mutate({ userId: id, status: "active" }, {
      onSuccess: () => toast.success("Doctor approved"),
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err ?? "");
        toast.error(msg || "Approval failed");
      },
    });
    return;
  }

  if (action === "suspend") {
    suspendUser.mutate({ id, suspended: true }, {
      onSuccess: () => {
        updateStatus.mutate({ userId: id, status: "suspended" });
        toast.success("Doctor suspended");
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err ?? "");
        toast.error(msg || "Suspend failed");
      },
    });
    return;
  }

  if (action === "sack") {
    updateStatus.mutate({ userId: id, status: "sacked" }, {
      onSuccess: () => toast.success("Doctor marked as sacked"),
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err ?? "");
        toast.error(msg || "Action failed");
      },
    });
    return;
  }

  if (action === "reset-password") {
    resetPassword.mutate(id, {
      onSuccess: (res) => {
        setShowCreds({ open: true, password: res.password });
        toast.success("Temporary password generated");
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err ?? "");
        toast.error(msg || "Reset failed");
      },
    });
    return;
  }
  // if (action === "assign") {
  //   toast.info("Assign action is not implemented yet");
  //   return;
  // }
};

  const getStatusColor = (status: doctorProfile["personalInfo"]["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      case "sacked":
        return "bg-red-100 text-red-800";
    }
  };

  const filteredDoctors = useMemo(
    () =>
      (data ?? []).filter((doc) =>
        (filters.status ? doc.personalInfo.status === filters.status : true) &&
        (filters.hospital
          ? (doc.personalInfo.hospital ?? "").toLowerCase().includes(filters.hospital.toLowerCase())
          : true) &&
        (filters.specialty
          ? (doc.qualifications.specialization ?? "")
              .toLowerCase()
              .includes(filters.specialty.toLowerCase())
          : true)
      ),
    [data, filters]
  );


  return (
    <div className="">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">View all Doctors</h2>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center px-4 py-2 bg-[#56bbe3] text-white rounded hover:bg-[#56bbe3]/70 rounded-[8px]"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add <span className="hidden md:inline-block ml-2">Specialist</span>
        </button>
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Doctor Account</DialogTitle>
            <DialogDescription>Enter the doctor&rsquo;s full name and email. A temporary password will be generated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Full Name (e.g., Dr. Jane Doe)"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="doctor@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowInvite(false)}
              disabled={createDoctor.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/70"
              type="button"
              onClick={() => {
                if (!inviteEmail || !inviteName) return;
                createDoctor.mutate(
                  { email: inviteEmail, name: inviteName },
                  {
                    onSuccess: (res) => {
                      setShowCreds({ open: true, name: inviteName, email: inviteEmail, password: res.password });
                      setInviteEmail("");
                      setInviteName("");
                      setShowInvite(false);
                    },
                    onError: (err: unknown) => {
                      const msg = err instanceof Error ? err.message : String(err ?? "");
                      toast.error(msg || "Failed to create doctor account");
                    },
                  }
                );
              }}
              disabled={createDoctor.isPending || !inviteEmail || !inviteName}
            >
              {createDoctor.isPending ? "Creating..." : "Create Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showCreds.open} onOpenChange={(o) => setShowCreds((prev) => ({ ...prev, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary Password</DialogTitle>
            <DialogDescription>Copy and share securely. It will not be shown again.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {showCreds.name && <div><strong>Name:</strong> {showCreds.name}</div>}
            {showCreds.email && <div><strong>Email:</strong> {showCreds.email}</div>}
            <div><strong>Password:</strong> {showCreds.password}</div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                if (showCreds.password) navigator.clipboard.writeText(showCreds.password);
                toast.success("Copied");
              }}
            >
              Copy
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreds({ open: false })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 max-w-[50rem]">
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value === "all" ? "" : (value as doctorProfile["personalInfo"]["status"]),
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
            {isLoading && (
              <tr>
                <td colSpan={7} className="text-center py-6">
                  Loading doctors...
                </td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-red-600">
                  Failed to load doctors
                </td>
              </tr>
            )}
            {filteredDoctors.map((doc) => (
              <tr
                key={doc.personalInfo.id}
                // onClick={() => handleRowClick(doc.id)}
                className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#56bbe3] p-1 overflow-hidden">
                    <img src={doc.personalInfo.imageUrl || "https://placehold.co/80x80"} alt={doc.personalInfo.fullName} className="w-full h-full object-cover rounded-full" />
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
                      {["profile","activate","reset-password","suspend","sack","delete"].map((action) => (
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
            {filteredDoctors.length === 0 && !isLoading && (
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
