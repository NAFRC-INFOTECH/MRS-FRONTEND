import { useMemo, useState } from "react";
import { Plus, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useSearch } from "@/contexts/SearchContext";
import { useUsersQuery } from "@/api-integration/queries/users";
import { useCreateClinicalDirectMutation } from "@/api-integration/mutations/invitations";
import { useDeleteUserMutation, useResetUserPasswordMutation, useSuspendUserMutation } from "@/api-integration/mutations/users";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ClinicalDepartment = "EarDoctor" | "EyeDoctor";

export default function ClinicalTable() {
  const { query } = useSearch();
  const navigate = useNavigate();
  const { data: users = [], isLoading, isError } = useUsersQuery("clinical");
  const createClinical = useCreateClinicalDirectMutation();
  const del = useDeleteUserMutation();
  const suspend = useSuspendUserMutation();
  const resetPwd = useResetUserPasswordMutation();

  const [deptFilter, setDeptFilter] = useState<"all" | "eardoctor" | "eyedoctor">("all");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteDept, setInviteDept] = useState<ClinicalDepartment | "">("");
  const [showCreds, setShowCreds] = useState<{ open: boolean; name?: string; email?: string; password?: string }>({ open: false });

  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase();
    return (users as any[]).filter((u: any) => {
      const nameOk = (u.name || "").toLowerCase().includes(q);
      const dept = String(u.department || "").toLowerCase();
      const deptOk = deptFilter === "all" ? true : dept === deptFilter;
      return nameOk && deptOk;
    });
  }, [users, query, deptFilter]);

  const getStatusColor = (suspended?: boolean) => {
    if (suspended) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const handleAction = (id: string, action: string) => {
    if (action === "view") {
      navigate(`/hospital-admin/staffs/${id}`);
      return;
    }
    if (action === "activate") {
      suspend.mutate(
        { id, suspended: false },
        {
          onSuccess: () => toast.success("User activated"),
          onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Activation failed"),
        }
      );
      return;
    }
    if (action === "suspend") {
      suspend.mutate(
        { id, suspended: true },
        {
          onSuccess: () => toast.success("User suspended"),
          onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Suspend failed"),
        }
      );
      return;
    }
    if (action === "reset-password") {
      const u = (users as any[]).find((x) => x._id === id);
      resetPwd.mutate(id, {
        onSuccess: (res) => {
          setShowCreds({ open: true, name: u?.name, email: u?.email, password: res.password });
          toast.success("Temporary password generated");
          try {
            navigator.clipboard.writeText(res.password);
          } catch {}
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Reset failed"),
      });
      return;
    }
    if (action === "delete") {
      del.mutate(id, {
        onSuccess: () => toast.success("User deleted"),
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Delete failed"),
      });
      return;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Clinical Users</h2>
        <Button onClick={() => setShowInvite(true)} className="flex gap-2 bg-[#56bbe3] text-white hover:bg-[#56bbe3]">
          <Plus size={16} />
          Add Clinical User
        </Button>
      </div>

      <div className="max-w-[20rem]">
        <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v as any)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="eardoctor">EarDoctor</SelectItem>
              <SelectItem value="eyedoctor">EyeDoctor</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Clinical Account</DialogTitle>
            <DialogDescription>Enter the user&rsquo;s full name, email, and department. A temporary password will be generated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="text" placeholder="Full Name (e.g., John Doe)" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
            <Input type="email" placeholder="clinical@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <Select value={inviteDept} onValueChange={(v) => setInviteDept(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="EarDoctor">Ear Doctor</SelectItem>
                  <SelectItem value="EyeDoctor">Eye Doctor</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowInvite(false)} disabled={createClinical.isPending}>
              Cancel
            </Button>
            <Button
              className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/70"
              type="button"
              onClick={() => {
                if (!inviteEmail || !inviteName || !inviteDept) return;
                createClinical.mutate(
                  { email: inviteEmail, name: inviteName, department: inviteDept as ClinicalDepartment },
                  {
                    onSuccess: (res) => {
                      setShowCreds({ open: true, name: inviteName, email: res.email, password: res.password });
                      setInviteEmail("");
                      setInviteName("");
                      setInviteDept("");
                      setShowInvite(false);
                    },
                    onError: (err: unknown) => {
                      const msg = err instanceof Error ? err.message : String(err ?? "");
                      toast.error(msg || "Failed to create clinical user");
                    },
                  }
                );
              }}
              disabled={createClinical.isPending || !inviteEmail || !inviteName || !inviteDept}
            >
              {createClinical.isPending ? "Creating..." : "Create Clinical User"}
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
                toast.success("Password copied");
              }}
              className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/70"
            >
              Copy Password
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreds({ open: false })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-t-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-[#56bbe3] hover:bg-[#56bbe3] rounded-t-lg overflow-hidden">
            <TableRow className="bg-[#56bbe3] hover:bg-[#56bbe3] rounded-t-lg overflow-hidden">
              <TableHead className="text-white font-bold">Image</TableHead>
              <TableHead className="text-white font-bold">Name</TableHead>
              <TableHead className="text-white font-bold">Email</TableHead>
              <TableHead className="text-white font-bold">Department</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-white font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-red-600">
                  Failed to load users
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && filteredUsers.length > 0 ? (
              filteredUsers.map((user: any) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={user.imageUrl || ""} />
                      <AvatarFallback>{(user.name || "U").charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(user.suspended)}`}>
                      {user.suspended ? "SUSPENDED" : "ACTIVE"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded">
                        <MoreVertical className="w-5 h-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleAction(user._id, "view")}>View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(user._id, "reset-password")}>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(user._id, "activate")}>Activate</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(user._id, "suspend")}>Suspend</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleAction(user._id, "delete")}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              !isLoading &&
              !isError && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No clinical users found
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

