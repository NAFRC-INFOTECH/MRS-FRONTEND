// import React from 'react'

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDoctorUsersQuery } from "@/api-integration/queries/doctors";
import { useDepartmentsQuery } from "@/api-integration/queries/departments";
import { useDutiesQuery } from "@/api-integration/queries/duties";
import { useCreateDutyMutation, useUpdateDutyMutation, useDeleteDutyMutation } from "@/api-integration/mutations/duties";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function DoctorsDailyShift() {
  const { data: doctors = [] } = useDoctorUsersQuery(true);
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
    role: "doctor",
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

  const [role, setRole] = useState<"doctor">("doctor");
  const [staffId, setStaffId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [shift, setShift] = useState<string>("");
  const [timeIn, setTimeIn] = useState<string>("");
  const [timeOut, setTimeOut] = useState<string>("");
  const [status, setStatus] = useState<string>("ON_DUTY");

  const mappedDoctors = useMemo(
    () => doctors.map((d: any) => ({ id: d._id, name: d.name })),
    [doctors]
  );
  const withinThreeDays = (d: string) => {
    if (!d) return false;
    const sel = new Date(d);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const max = new Date(start);
    max.setDate(max.getDate() + 3);
    const selStart = new Date(sel.getFullYear(), sel.getMonth(), sel.getDate());
    return selStart >= start && selStart <= max;
  };
  const nextDayStr = (d: string) => {
    const dt = new Date(d);
    dt.setDate(dt.getDate() + 1);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const applyShiftTimes = (d: string, s: string) => {
    if (!d || !s) return;
    if (s === "MORNING") {
      setTimeIn(`${d}T08:00`);
      setTimeOut(`${d}T14:00`);
    } else if (s === "AFTERNOON") {
      setTimeIn(`${d}T14:00`);
      setTimeOut(`${d}T21:00`);
    } else if (s === "NIGHT") {
      setTimeIn(`${d}T21:00`);
      setTimeOut(`${nextDayStr(d)}T07:59`);
    }
  };
  const exportCsv = () => {
    const headers = ["Doctor", "Department", "Date", "Shift", "Time In", "Time Out", "Status"];
    const rows = duties.map((d) => {
      const docName = mappedDoctors.find((x) => x.id === (d as any).doctorUserId)?.name || "-";
      const deptName = departments.find((x) => x._id === d.departmentId)?.name || "-";
      const dateText = new Date(d.date).toLocaleDateString();
      const shiftText = d.shift;
      const timeInText = new Date(d.timeIn).toLocaleString();
      const timeOutText = new Date(d.timeOut).toLocaleString();
      const statusText = d.status;
      return [docName, deptName, dateText, shiftText, timeInText, timeOutText, statusText];
    });
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = "\ufeff" + [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doctors_duties_${dateFilter || "today"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Duty Assignment</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Role" /></SelectTrigger>
              <SelectContent><SelectGroup>
                <SelectItem value="doctor">Doctor</SelectItem>
              </SelectGroup></SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Staff</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" type="button" className="justify-between">
                  {mappedDoctors.find((n) => n.id === staffId)?.name || "Select Staff"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]">
                <Command>
                  <CommandInput placeholder="Search staff by name..." />
                  <CommandList>
                    <CommandEmpty>No staff found.</CommandEmpty>
                    <CommandGroup>
                      {role === "doctor" &&
                        mappedDoctors.map((n) => (
                          <CommandItem
                            key={n.id}
                            value={n.name}
                            onSelect={() => {
                              setStaffId(n.id);
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
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Department" /></SelectTrigger>
              <SelectContent><SelectGroup>
                {departments.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
              </SelectGroup></SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="doctor-duty-date">Duty Date</Label>
            <Input id="doctor-duty-date" type="date" value={date} onChange={(e) => { const v = e.target.value; setDate(v); applyShiftTimes(v, shift); }} />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Shift</Label>
            <Select value={shift} onValueChange={(v) => { setShift(v); applyShiftTimes(date, v); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Shift" /></SelectTrigger>
              <SelectContent><SelectGroup>
                <SelectItem value="MORNING">Morning</SelectItem>
                <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                <SelectItem value="NIGHT">Night</SelectItem>
              </SelectGroup></SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="doctor-time-in">Time In</Label>
            <Input id="doctor-time-in" type="datetime-local" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="doctor-time-out">Time Out</Label>
            <Input id="doctor-time-out" type="datetime-local" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Status" /></SelectTrigger>
              <SelectContent><SelectGroup>
                <SelectItem value="ON_DUTY">On Duty</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="SWAPPED">Swapped</SelectItem>
              </SelectGroup></SelectContent>
            </Select>
          </div>
          <Button
            className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/80"
            type="button"
            onClick={() => {
              if (!role || !staffId || !departmentId || !date || !shift || !timeIn || !timeOut || !status) {
                toast.error("All fields are required");
                return;
              }
              if (!withinThreeDays(date)) {
                toast.error("Duty date must be within the next 3 days");
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Duty Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <Label>Filter Department</Label>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Department" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  {departments.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="doctor-filter-date">Filter Date</Label>
              <Input id="doctor-filter-date" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Filter Shift</Label>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Shift" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="MORNING">Morning</SelectItem>
                  <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                  <SelectItem value="NIGHT">Night</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" type="button" onClick={exportCsv} className="bg-[#56bbe3] text-white rounded-[8px]">Export CSV</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-[8px] overflow-hidden">
              <thead className="bg-[#56bbe3] text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Doctor</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Shift</th>
                  <th className="px-4 py-2 text-left">Time In</th>
                  <th className="px-4 py-2 text-left">Time Out</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {duties.map((d) => (
                  <tr key={d._id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                    <td className="px-4 py-2 whitespace-nowrap">{d.nurseUserId ? "Nurse" : "Doctor"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{mappedDoctors.find((x) => x.id === (d as any).doctorUserId)?.name || "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{departments.find((x) => x._id === d.departmentId)?.name || "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(d.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{d.shift}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(d.timeIn).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(d.timeOut).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{d.status}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditDuty(d);
                            setEditOpen(true);
                            setEditDepartmentId(d.departmentId);
                            setEditShift(d.shift);
                            setEditTimeIn(new Date(d.timeIn).toISOString().slice(0,16));
                            setEditTimeOut(new Date(d.timeOut).toISOString().slice(0,16));
                            setEditStatus(d.status);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            deleteDuty.mutate(d._id, {
                              onSuccess: () => toast.success("Duty deleted"),
                              onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed"),
                            });
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {duties.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4">No duties found.</td>
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
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Department" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  {departments.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Shift</Label>
              <Select value={editShift} onValueChange={setEditShift}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Shift" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="MORNING">Morning</SelectItem>
                  <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                  <SelectItem value="NIGHT">Night</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-time-in">Time In</Label>
              <Input id="edit-time-in" type="datetime-local" value={editTimeIn} onChange={(e) => setEditTimeIn(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-time-out">Time Out</Label>
              <Input id="edit-time-out" type="datetime-local" value={editTimeOut} onChange={(e) => setEditTimeOut(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="ON_DUTY">On Duty</SelectItem>
                  <SelectItem value="COMPLETED">Off Duty</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="SWAPPED">Swapped</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              type="button"
              onClick={() => {
                if (!editDuty) return;
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
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
