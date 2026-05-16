import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUsersQuery } from "@/api-integration/queries/users";
import { useDepartmentsQuery } from "@/api-integration/queries/departments";
import { useDutiesQuery } from "@/api-integration/queries/duties";
import { useCreateDutyMutation, useDeleteDutyMutation, useUpdateDutyMutation } from "@/api-integration/mutations/duties";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DUTY_SHIFT_OPTIONS, getShiftTimes } from "@/lib/duty-shifts";

export default function RadiologyDailyShift() {
  const [openCombobox, setOpenCombobox] = useState(false);
  const { data: radiologyUsers = [] } = useUsersQuery("radiology");
  const { data: departments = [] } = useDepartmentsQuery();

  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [shiftFilter, setShiftFilter] = useState<string>("all");

  const { data: duties = [] } = useDutiesQuery({
    role: "radiology",
    departmentId: deptFilter && deptFilter !== "all" ? deptFilter : undefined,
    date: dateFilter || undefined,
    shift: shiftFilter && shiftFilter !== "all" ? (shiftFilter as any) : undefined,
  });

  const createDuty = useCreateDutyMutation();
  const updateDuty = useUpdateDutyMutation();
  const deleteDuty = useDeleteDutyMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [editDuty, setEditDuty] = useState<any>(null);
  const [editDepartmentId, setEditDepartmentId] = useState<string>("");
  const [editShift, setEditShift] = useState<string>("");
  const [editTimeIn, setEditTimeIn] = useState<string>("");
  const [editTimeOut, setEditTimeOut] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("ON_DUTY");

  const [role, setRole] = useState<"radiology">("radiology");
  const [staffId, setStaffId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [shift, setShift] = useState<string>("");
  const [timeIn, setTimeIn] = useState<string>("");
  const [timeOut, setTimeOut] = useState<string>("");
  const [status, setStatus] = useState<string>("ON_DUTY");

  const mappedRadiologyUsers = useMemo(
    () => radiologyUsers.map((d: any) => ({ id: d._id, name: d.name })),
    [radiologyUsers]
  );

  const applyShiftTimes = (d: string, s: string) => {
    const { timeIn, timeOut } = getShiftTimes(d, s);
    setTimeIn(timeIn);
    setTimeOut(timeOut);
  };

  const applyEditShiftTimes = (d: string, s: string) => {
    const { timeIn, timeOut } = getShiftTimes(d, s);
    setEditTimeIn(timeIn);
    setEditTimeOut(timeOut);
  };

  return (
    <div className="py-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Duty Assignment</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="radiology">Radiology</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Staff</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button variant="outline" type="button" className="justify-between">
                  {mappedRadiologyUsers.find((n) => n.id === staffId)?.name || "Select Staff"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]">
                <Command>
                  <CommandInput placeholder="Search staff by name..." />
                  <CommandList>
                    <CommandEmpty>No staff found.</CommandEmpty>
                    <CommandGroup>
                      {role === "radiology" &&
                        mappedRadiologyUsers.map((n) => (
                          <CommandItem
                            key={n.id}
                            value={n.name}
                            onSelect={() => {
                              setStaffId(n.id);
                              setOpenCombobox(false);
                            }}
                          >
                            {n.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {departments.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="radiology-duty-date">Duty Date</Label>
            <Input
              id="radiology-duty-date"
              type="date"
              value={date}
              onChange={(e) => {
                const v = e.target.value;
                setDate(v);
                applyShiftTimes(v, shift);
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Shift</Label>
            <Select
              value={shift}
              onValueChange={(v) => {
                setShift(v);
                if (date) applyShiftTimes(date, v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {DUTY_SHIFT_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Time In</Label>
            <Input type="datetime-local" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Time Out</Label>
            <Input type="datetime-local" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ON_DUTY">ON_DUTY</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="ABSENT">ABSENT</SelectItem>
                  <SelectItem value="SWAPPED">SWAPPED</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={() => {
                if (!staffId || !departmentId || !date || !shift || !timeIn || !timeOut) {
                  toast.error("Please fill all required fields");
                  return;
                }
                createDuty.mutate(
                  {
                    role,
                    staffId,
                    departmentId,
                    date,
                    shift: shift as any,
                    timeIn,
                    timeOut,
                    status: status as any,
                    assignedBy: "admin",
                  },
                  {
                    onSuccess: () => toast.success("Duty created"),
                    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed"),
                  }
                );
              }}
              disabled={createDuty.isPending}
            >
              {createDuty.isPending ? "Assigning..." : "Assign Duty"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Duty Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <Label>Department</Label>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Duty Date</Label>
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Shift</Label>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Shifts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    {DUTY_SHIFT_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-[8px] overflow-hidden">
              <thead className="bg-[#56bbe3] text-white">
                <tr>
                  {/* <th className="px-4 py-2 text-left uppercase text-sm">Role</th> */}
                  <th className="px-4 py-2 text-left uppercase text-sm">Staff</th>
                  <th className="px-4 py-2 text-left uppercase text-sm">Department</th>
                  <th className="px-4 py-2 text-left uppercase text-sm">Date</th>
                  <th className="px-4 py-2 text-left uppercase text-sm">Shift</th>
                  <th className="px-4 py-2 text-left uppercase text-sm">Time In</th>
                  <th className="px-4 py-2 text-left uppercase text-sm">Time Out</th>
                  <th className="px-4 py-2 text-left uppercase text-sm">Status</th>
                  <th className="px-4 py-2 text-left uppercase text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {duties.map((d: any) => (
                  <tr key={d._id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {mappedRadiologyUsers.find((x) => x.id === d.radiologyUserId)?.name || "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{departments.find((x) => x._id === d.departmentId)?.name || "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(d.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{d.shift}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(d.timeIn).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(d.timeOut).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{d.status}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditDuty(d);
                            setEditDepartmentId(d.departmentId);
                            setEditShift(d.shift);
                            setEditStatus(d.status);
                            setEditTimeIn(new Date(d.timeIn).toISOString().slice(0, 16));
                            setEditTimeOut(new Date(d.timeOut).toISOString().slice(0, 16));
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            deleteDuty.mutate(d._id, {
                              onSuccess: () => toast.success("Duty deleted"),
                              onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed"),
                            });
                          }}
                          disabled={deleteDuty.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {duties.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No duties found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Duty</DialogTitle>
            <DialogDescription>Update shift, time in/out, and status.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label>Department</Label>
              <Select value={editDepartmentId} onValueChange={setEditDepartmentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {departments.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Shift</Label>
              <Select
                value={editShift}
                onValueChange={(v) => {
                  setEditShift(v);
                  if (editDuty?.date) applyEditShiftTimes(new Date(editDuty.date).toISOString().slice(0, 10), v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {DUTY_SHIFT_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Time In</Label>
              <Input type="datetime-local" value={editTimeIn} onChange={(e) => setEditTimeIn(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Time Out</Label>
              <Input type="datetime-local" value={editTimeOut} onChange={(e) => setEditTimeOut(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ON_DUTY">ON_DUTY</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    <SelectItem value="ABSENT">ABSENT</SelectItem>
                    <SelectItem value="SWAPPED">SWAPPED</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                if (!editDuty?._id) return;
                updateDuty.mutate(
                  {
                    id: editDuty._id,
                    payload: {
                      departmentId: editDepartmentId,
                      shift: editShift as any,
                      timeIn: editTimeIn,
                      timeOut: editTimeOut,
                      status: editStatus as any,
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Duty updated");
                      setEditOpen(false);
                    },
                    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed"),
                  }
                );
              }}
              disabled={updateDuty.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
