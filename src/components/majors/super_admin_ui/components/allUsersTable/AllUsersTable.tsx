import { useState } from "react";
import { PlusIcon, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// User status type
type UserStatus = "active" | "inactive" | "suspended";

// User type
type User = {
  id: string;
  fullName: string;
  imageUrl: string;
  email: string;
  phone: string;
  address: string;
  status: UserStatus;
};

// Dummy users data
const dummyUsers: User[] = [
  {
    id: "USR-1001",
    fullName: "Alice Johnson",
    imageUrl: "https://randomuser.me/api/portraits/women/10.jpg",
    email: "alice.johnson@example.com",
    phone: "+234 901 234 5670",
    address: "12 Palm Street, Lagos, Nigeria",
    status: "active",
  },
  {
    id: "USR-1002",
    fullName: "Bob Smith",
    imageUrl: "https://randomuser.me/api/portraits/men/11.jpg",
    email: "bob.smith@example.com",
    phone: "+234 902 345 6781",
    address: "45 Mango Avenue, Abuja, Nigeria",
    status: "inactive",
  },
  {
    id: "USR-1003",
    fullName: "Carol Adams",
    imageUrl: "https://randomuser.me/api/portraits/women/12.jpg",
    email: "carol.adams@example.com",
    phone: "+234 903 456 7892",
    address: "78 Pine Road, Port Harcourt, Nigeria",
    status: "suspended",
  },
];

export default function UsersTable() {
  const [users, setUsers] = useState(dummyUsers);
  const [searchName, setSearchName] = useState("");

  // Handle actions
  const handleAction = (id: string, action: string) => {
    if (action === "delete") {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return;
    }

    if (["activate", "deactivate", "suspend"].includes(action)) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status:
                  action === "activate"
                    ? "active"
                    : action === "deactivate"
                    ? "inactive"
                    : "suspended",
              }
            : u
        )
      );
    }
  };

  // Status colors
  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
    }
  };

  // Filter users by search name
  const filteredUsers = users.filter((u) =>
    searchName ? u.fullName.toLowerCase().includes(searchName.toLowerCase()) : true
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

      {/* Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 max-w-[15rem] md:min-w-[30rem]">
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
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2">
                  <div className="w-10 h-10 rounded-full border-2 border-[#56bbe3] p-1 overflow-hidden">
                    <img
                      src={u.imageUrl}
                      alt={u.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{u.id}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{u.fullName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.phone}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.address}</td>
                <td className="p-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(u.status)}`}>
                    {u.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded">
                      <MoreVertical className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["activate", "deactivate", "suspend", "delete"].map((action) => (
                        <DropdownMenuItem
                          key={action}
                          className={action === "delete" ? "text-red-600" : ""}
                          onClick={() => handleAction(u.id, action)}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4">
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
