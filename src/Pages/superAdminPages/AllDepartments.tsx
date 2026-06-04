import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDepartmentsQuery } from "@/api-integration/queries/departments";
import { useCreateDepartmentMutation, useDeleteDepartmentMutation, useUpdateDepartmentMutation } from "@/api-integration/mutations/departments";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSearch } from "@/contexts/SearchContext";
import { Folder, MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function AllDepartments() {
  const { query } = useSearch();
  const { data: departments = [], isLoading } = useDepartmentsQuery();
  const createDept = useCreateDepartmentMutation();
  const deleteDept = useDeleteDepartmentMutation();
  const updateDept = useUpdateDepartmentMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const rows = useMemo(() => departments, [departments]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const filteredRows = useMemo(() => {
    if (!query) {
      return rows;
    }
    return rows.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, rows]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Departments</h1>
        <p className="text-gray-600">Manage your departments like a file explorer</p>
      </div>

      {/* Create Department Form */}
      <Card className="mb-8 border-0 shadow-sm rounded-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Plus className="w-5 h-5" />
            Create New Department
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
              <Input placeholder="e.g., GOPD" value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
            </div>
            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input placeholder="Optional description" value={description} onChange={(e) => setDescription(e.target.value)} className="h-10" />
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button
                className="w-full h-10 bg-[#56bbe3] hover:bg-[#56bbe3]/60 text-white shadow-md"
                type="button"
                onClick={() => {
                  if (!name.trim()) {
                    toast.error("Department name is required");
                    return;
                  }
                  createDept.mutate(
                    { name: name.trim(), description: description.trim() || undefined },
                    {
                      onSuccess: () => {
                        toast.success("Department created");
                        setName("");
                        setDescription("");
                      },
                      onError: (err: unknown) => {
                        const msg = err instanceof Error ? err.message : String(err ?? "");
                        toast.error(msg || "Failed to create department");
                      }
                    }
                  );
                }}
                disabled={createDept.isPending}
              >
                {createDept.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departments Grid */}
      <div>
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-gray-500">Loading departments...</div>
          </div>
        )}
        {!isLoading && filteredRows.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No departments found</h3>
            <p className="text-gray-500">Create your first department to get started!</p>
          </div>
        )}
        {!isLoading && filteredRows.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredRows.map((d) => (
              <div
                key={d._id}
                className="group relative mb-4"
              >
                {/* Departmental FOLDER container */}
                <div>
                  {/* Departmental FOLDER */}
                  <div className="card-wrapper">
                    <div className="folder">
                        <div className="folder__back">
                            <div className="paper"></div>
                            <div className="folder__front">
                              <div className="flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-7 rounded-full hover:bg-gray-500/50"
                                    >
                                      <MoreHorizontal className="h-8 w-8 text-gray-100 rotate-90" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 cursor-pointer"
                                      onClick={() => {
                                        setEditId(d._id);
                                        setEditName(d.name);
                                        setEditDescription(d.description || "");
                                      }}
                                    >
                                      <Pencil className="w-4 h-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setConfirmDeleteId(d._id);
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. Are you sure you want to delete this department?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() => {
                                              if (!confirmDeleteId) return;
                                              deleteDept.mutate(confirmDeleteId, {
                                                onSuccess: () => {
                                                  toast.success("Department deleted");
                                                  setConfirmDeleteId(null);
                                                },
                                                onError: (err: unknown) => {
                                                  const msg = err instanceof Error ? err.message : String(err ?? "");
                                                  toast.error(msg || "Failed to delete department");
                                                },
                                              });
                                            }}
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <div className="folder__front right"></div>
                        </div>
                    </div>
                  </div>
                  {/* Departmental FOLDER Content */}
                  <div className="z-100 px-2">
                    <b className="first-letter:uppercase">{d.name}</b>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-"}</span>
                    </div>
                  </div>
                </div>
    
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Department</DialogTitle>
            <DialogDescription>Update department name and description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input placeholder="Department name" value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <Input placeholder="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setEditId(null)}
              disabled={updateDept.isPending}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-10"
              type="button"
              onClick={() => {
                if (!editId) return;
                if (!editName.trim()) {
                  toast.error("Name is required");
                  return;
                }
                updateDept.mutate(
                  { id: editId, data: { name: editName.trim(), description: editDescription.trim() || undefined } },
                  {
                    onSuccess: () => {
                      toast.success("Department updated");
                      setEditId(null);
                    },
                    onError: (err: unknown) => {
                      const msg = err instanceof Error ? err.message : String(err ?? "");
                      toast.error(msg || "Failed to update department");
                    },
                  }
                );
              }}
              disabled={updateDept.isPending}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
