import { useMemo, useState } from "react";
import { PlusIcon, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useUsersQuery } from "@/api-integration/queries/users";
import { useDeleteUserMutation, useSuspendUserMutation } from "@/api-integration/mutations/users";

export default function UsersTable() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { data: users = [], isLoading, isError } = useUsersQuery(roleFilter === "all" ? undefined : roleFilter);
  const [searchName, setSearchName] = useState("");
  const del = useDeleteUserMutation();
  const suspend = useSuspendUserMutation();

  const handleAction = (id: string, action: string) => {
    if (action === "delete") {
      del.mutate(id, {
        onSuccess: () => toast.success("User deleted"),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Delete failed");
        },
      });
      return;
    }
    if (action === "activate") {
      suspend.mutate({ id, suspended: false }, {
        onSuccess: () => toast.success("User activated"),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Activation failed");
        },
      });
      return;
    }
    if (action === "suspend") {
      suspend.mutate({ id, suspended: true }, {
        onSuccess: () => toast.success("User suspended"),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Suspend failed");
        },
      });
      return;
    }
    if (action === "view") {
      toast.info("Profile view is not implemented yet");
      return;
    }
  };

  const getStatusColor = (suspended?: boolean) => {
    if (suspended) return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  const filteredUsers = useMemo(
    () =>
      (users ?? []).filter((u) =>
        searchName ? (u.name || "").toLowerCase().includes(searchName.toLowerCase()) : true
      ),
    [users, searchName]
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">View All Users</h2>
        <button className="flex items-center px-4 py-2 bg-[#56bbe3] text-white rounded hover:bg-[#56bbe3]/70 rounded-[8px]">
          <PlusIcon className="w-5 h-5 mr-2" /> Add <span className="hidden md:inline-block ml-2">User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 max-w-[50rem]">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full py-5">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="nurse">Nurse</SelectItem>
              <SelectItem value="patient">Patient</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <input
          type="text"
          placeholder="Search by Name"
          className="border-2 p-2 rounded-[8px] col-span-2 outline-none"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">UUID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Roles</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="text-center py-6">Loading users...</td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-red-600">Failed to load users</td>
              </tr>
            )}
            {!isLoading && !isError && filteredUsers.map((u) => (
              <tr key={u._id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#56bbe3] p-1 overflow-hidden">
                    <img
                      src={u.imageUrl || "https://placehold.co/80x80"}
                      alt={u.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{u._id}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{u.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{(u.roles || []).join(", ")}</td>
                <td className="p-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(u.suspended)}`}>
                    {u.suspended ? "SUSPENDED" : "ACTIVE"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded">
                      <MoreVertical className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {[ "view", u.suspended ? "activate" : "suspend", "delete" ].map((action) => (
                        <DropdownMenuItem
                          key={action}
                          className={action === "delete" ? "text-red-600" : ""}
                          onClick={() => handleAction(u._id, action)}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {!isLoading && !isError && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
