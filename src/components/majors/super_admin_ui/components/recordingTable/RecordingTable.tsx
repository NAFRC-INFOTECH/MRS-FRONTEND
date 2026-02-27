import { useState, useMemo } from "react";
import { Plus, Search, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useUsersQuery } from "@/api-integration/queries/users";
import { useDeleteUserMutation, useSuspendUserMutation, useResetUserPasswordMutation } from "@/api-integration/mutations/users";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useCreateRecordingDirectMutation } from "@/api-integration/mutations/invitations";

export default function RecordingTable() {
  const navigate = useNavigate();
  const { data: users = [], isLoading, isError } = useUsersQuery("recording");
  const del = useDeleteUserMutation();
  const suspend = useSuspendUserMutation();
  const resetPwd = useResetUserPasswordMutation();
  const createRecording = useCreateRecordingDirectMutation();
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [showCreds, setShowCreds] = useState<{ open: boolean; name?: string; email?: string; password?: string }>({ open: false });

  const filteredUsers = useMemo(() => {
    return users.filter((user: any) =>
      (user.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const getStatusColor = (suspended?: boolean) => {
    if (suspended) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const handleAction = (id: string, action: string) => {
    if (action === "view") {
      navigate(`/mrs-admin/users/${id}`);
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
    if (action === "sack") {
      // Map 'sack' to suspension for recording staff (no separate 'sacked' status on users)
      suspend.mutate(
        { id, suspended: true },
        {
          onSuccess: () => toast.success("User sacked (suspended)"),
          onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Sack failed"),
        }
      );
      return;
    }
    if (action === "reset-password") {
      resetPwd.mutate(id, {
        onSuccess: (res) => {
          toast.success(`Temporary password: ${res.password}`);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Recording Staffs</h2>

        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="relative w-[250px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Add Button */}
          <Button onClick={() => setShowInvite(true)} className="flex gap-2 bg-[#56bbe3] text-white hover:bg-[#56bbe3]">
            <Plus size={16} />
            Add Recording Staff
          </Button>
        </div>
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Recording Staff Account</DialogTitle>
            <DialogDescription>Enter the staff&rsquo;s full name and email. A temporary password will be generated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Full Name (e.g., John Doe)"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="recording@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowInvite(false)}
              disabled={createRecording.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/70"
              type="button"
              onClick={() => {
                if (!inviteEmail || !inviteName) return;
                createRecording.mutate(
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
                      toast.error(msg || "Failed to create recording staff");
                    },
                  }
                );
              }}
              disabled={createRecording.isPending || !inviteEmail || !inviteName}
            >
              {createRecording.isPending ? "Creating..." : "Create Recording Staff"}
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

      {/* Table */}
      <div className="rounded-t-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#56bbe3] hover:bg-[#56bbe3] rounded-t-lg overflow-hidden">
            <TableRow className="bg-[#56bbe3] hover:bg-[#56bbe3] rounded-t-lg overflow-hidden">
              <TableHead className="text-white font-bold">Image</TableHead>
              <TableHead className="text-white font-bold">Name</TableHead>
              <TableHead className="text-white font-bold">Email</TableHead>
              <TableHead className="text-white font-bold">Phone</TableHead>
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
                      <AvatarFallback>
                        {(user.name || "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>

                  <TableCell className="font-medium">
                    {user.name}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {user.phone || ""}
                  </TableCell>
                  <TableCell className="p-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(user.suspended)}`}>
                      {user.suspended ? "SUSPENDED" : "ACTIVE"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded">
                        <MoreVertical size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {["view", "activate", "reset-password", "suspend", "sack", "delete"].map((action) => (
                          <DropdownMenuItem
                            key={action}
                            className={action === "delete" ? "text-red-600" : ""}
                            onClick={() => handleAction(user._id, action)}
                          >
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
