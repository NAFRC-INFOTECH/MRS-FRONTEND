import { useMemo, useState } from "react";
import { Plus, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUsersQuery } from "@/api-integration/queries/users";
import { useDeleteUserMutation, useResetUserPasswordMutation, useSuspendUserMutation } from "@/api-integration/mutations/users";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateRadiologyDirectMutation } from "@/api-integration/mutations/invitations";
import { toast } from "sonner";
import { useSearch } from "@/contexts/SearchContext";

export default function RadiologyTable() {
  const { query } = useSearch();
  const navigate = useNavigate();
  const { data: users = [], isLoading, isError } = useUsersQuery("radiology");
  const del = useDeleteUserMutation();
  const suspend = useSuspendUserMutation();
  const resetPwd = useResetUserPasswordMutation();
  const createRadiology = useCreateRadiologyDirectMutation();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [showCreds, setShowCreds] = useState<{ open: boolean; name?: string; email?: string; password?: string }>({ open: false });

  const filteredUsers = useMemo(() => {
    return users.filter((user: any) => (user.name || "").toLowerCase().includes(query.toLowerCase()));
  }, [users, query]);

  const handleAction = (id: string, action: string) => {
    if (action === "view") navigate(`/mrs-admin/staff/${id}`);
    if (action === "reset-password") {
      resetPwd.mutate(id, {
        onSuccess: (res: any) => toast.success(`New password: ${res?.password || ""}`),
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to reset password"),
      });
    }
    if (action === "suspend") {
      suspend.mutate(
        { id, suspended: true },
        {
          onSuccess: () => toast.success("User suspended"),
          onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to suspend user"),
        }
      );
    }
    if (action === "activate") {
      suspend.mutate(
        { id, suspended: false },
        {
          onSuccess: () => toast.success("User activated"),
          onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to activate user"),
        }
      );
    }
    if (action === "delete") {
      del.mutate(id, {
        onSuccess: () => toast.success("User deleted"),
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to delete user"),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Radiology Staff</h2>
        <Button onClick={() => setShowInvite(true)} className="flex gap-2 bg-[#56bbe3] text-white hover:bg-[#56bbe3]">
          <Plus size={16} />
          Add Radiology Staff
        </Button>
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Radiology Staff Account</DialogTitle>
            <DialogDescription>Enter the staff&rsquo;s full name and email. A temporary password will be generated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="text" placeholder="Full Name (e.g., John Doe)" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
            <Input type="email" placeholder="radiology@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowInvite(false)} disabled={createRadiology.isPending}>
              Cancel
            </Button>
            <Button
              className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/70"
              type="button"
              onClick={() => {
                if (!inviteEmail || !inviteName) return;
                createRadiology.mutate(
                  { email: inviteEmail, name: inviteName },
                  {
                    onSuccess: (res) => {
                      setShowCreds({ open: true, name: inviteName, email: res.email, password: res.password });
                      setInviteEmail("");
                      setInviteName("");
                      setShowInvite(false);
                    },
                    onError: (err: unknown) => {
                      const msg = err instanceof Error ? err.message : String(err ?? "");
                      toast.error(msg || "Failed to create radiology staff");
                    },
                  }
                );
              }}
              disabled={createRadiology.isPending || !inviteEmail || !inviteName}
            >
              {createRadiology.isPending ? "Creating..." : "Create Radiology Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreds.open} onOpenChange={(o) => setShowCreds((prev) => ({ ...prev, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Radiology Staff Credentials</DialogTitle>
            <DialogDescription>Copy and share these credentials securely.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{showCreds.name}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{showCreds.email}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Password</span>
              <span className="font-medium">{showCreds.password}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCreds((p) => ({ ...p, open: false }))}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-red-600">
                  Failed to load users
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && filteredUsers.length > 0 ? (
              filteredUsers.map((user: any) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.imageUrl || ""} />
                        <AvatarFallback>{(user.name || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{(user.roles || []).join(", ")}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{user.suspended ? "Suspended" : "Active"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {["view", user.suspended ? "activate" : "suspend", "reset-password", "delete"].map((action) => (
                          <DropdownMenuItem
                            key={action}
                            className={action === "delete" ? "text-red-600" : ""}
                            onClick={() => handleAction(user._id, action)}
                          >
                            {action.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              !isLoading &&
              !isError && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users found.
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

