import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDepartmentsQuery } from "@/api-integration/queries/departments";
import { useCreateDepartmentMutation, useDeleteDepartmentMutation, useUpdateDepartmentMutation } from "@/api-integration/mutations/departments";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AllDepartments() {
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

  return (
    <div className="">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Department Name</label>
              <Input placeholder="e.g., GOPD" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm text-gray-600">Description</label>
              <Input placeholder="Optional description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <Button
                className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/80"
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
                      },
                    }
                  );
                }}
                disabled={createDept.isPending}
              >
                {createDept.isPending ? "Creating..." : "Create Department"}
              </Button>
            </div>
          </div>

          <div>
            {isLoading && (
              <div className="text-center py-6">Loading...</div>
            )}
            {!isLoading && rows.length === 0 && (
              <div className="text-center py-4">No departments found.</div>
            )}
            {!isLoading && rows.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rows.map((d) => (
                  <Card key={d._id} className="border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg">{d.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-600">{d.description || "-"}</div>
                      <div className="text-xs text-gray-500">
                        Created: {d.createdAt ? new Date(d.createdAt).toLocaleString() : "-"}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => {
                            setEditId(d._id);
                            setEditName(d.name);
                            setEditDescription(d.description || "");
                          }}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              type="button"
                              onClick={() => setConfirmDeleteId(d._id)}
                            >
                              Delete
                            </Button>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Dialog open={!!editId} onOpenChange={(open) => !open && setEditId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Department</DialogTitle>
                <DialogDescription>Update name and description.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <Input placeholder="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditId(null)}
                  disabled={updateDept.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/80"
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
        </CardContent>
      </Card>
    </div>
  );
}
