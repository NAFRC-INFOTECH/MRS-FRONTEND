import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useNHIAReferredPatientsQuery } from "@/api-integration/queries/patients";
import { useCheckNHIAAccessMutation, useUpdatePatientMutation } from "@/api-integration/mutations/patients";
import { useSearch } from "@/contexts/SearchContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildNHIARows,
  type CoverageCategory,
  type DeskFilter,
  type NHIARow,
} from "./nhiaPatients";

export default function NHIAPatientsList() {
  const navigate = useNavigate();
  const q = useNHIAReferredPatientsQuery();
  const update = useUpdatePatientMutation();
  const checkNHIA = useCheckNHIAAccessMutation();
  const { query } = useSearch();

  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deskFilter, setDeskFilter] = useState<DeskFilter>("awaiting-clearance");
  const [categoryFilter, setCategoryFilter] = useState<CoverageCategory>("all");

  useEffect(() => {
    if (q.data) setPatients(q.data as any[]);
  }, [q.data]);

  const rows = useMemo<NHIARow[]>(() => buildNHIARows(patients), [patients]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesDesk = deskFilter === "all" ? true : row.deskState === deskFilter;
      const matchesCategory = categoryFilter === "all" ? true : row.category === categoryFilter;
      const matchesLocalSearch = searchTerm
        ? `${row.cardNumber} ${row.fullName} ${row.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesGlobalSearch = query
        ? row.fullName.toLowerCase().includes(query.toLowerCase())
        : true;

      return matchesDesk && matchesCategory && matchesLocalSearch && matchesGlobalSearch;
    });
  }, [rows, deskFilter, categoryFilter, searchTerm, query]);

  const completeDeskReview = (id: string) => {
    update.mutate(
      { id, data: { patientStatus: "active", patientQueue: "", nhiaStatus: "cleared", nhiaUpdatedAt: new Date().toISOString() } },
      {
        onSuccess: () => {
          toast.success("Patient cleared from NHIA desk");
          checkNHIA.mutate(id);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Unable to complete NHIA processing");
        },
      }
    );
  };

  const markNotCleared = (id: string) => {
    update.mutate(
      { id, data: { patientStatus: "active", patientQueue: "", nhiaStatus: "not_cleared", nhiaUpdatedAt: new Date().toISOString() } },
      {
        onSuccess: () => {
          toast.success("Patient marked as not cleared by NHIA");
          checkNHIA.mutate(id);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Unable to update NHIA status");
        },
      }
    );
  };

  const getNHIAResultBadge = (row: NHIARow) => {
    if (row.nhiaStatus === "cleared") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Cleared</Badge>;
    }
    if (row.nhiaStatus === "not_cleared") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Not Cleared</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Awaiting</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">NHIA Patients List</h1>
          <p className="text-sm text-muted-foreground">
            Manage the operational queue for NHIA patients, apply desk filters, and complete per-patient
            NHIA verification.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/nhia")}>
          <ArrowRightLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NHIA Queue Controls</CardTitle>
          <CardDescription>
            Filter the queue by desk state, coverage category, or patient identifier to focus on active NHIA
            workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <Select value={deskFilter} onValueChange={(value) => setDeskFilter(value as DeskFilter)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Desk state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Desk States</SelectItem>
                <SelectItem value="awaiting-clearance">Awaiting Verification</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CoverageCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Coverage category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coverage Categories</SelectItem>
                <SelectItem value="civilian">Civilian / Dependent</SelectItem>
                <SelectItem value="personnel">Personnel / Veteran</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by card number, patient name or phone"
              className="lg:col-span-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>NHIA Operations Table</CardTitle>
          <CardDescription>
            This page is reserved for the live queue table and patient-level desk actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-gray-200">
              <thead className="bg-[#56bbe3] text-white">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">S/N</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Card No</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Patient Name</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Rank</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Coverage Category</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">NHIA Lane</th>
                  {/* <th className="px-4 py-3 text-left whitespace-nowrap">Queue</th> */}
                  <th className="px-4 py-3 text-left whitespace-nowrap">Desk State</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {q.isLoading && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading NHIA patients...
                    </td>
                  </tr>
                )}

                {q.isError && !q.isLoading && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-sm text-red-600">
                      Failed to load NHIA patients.
                    </td>
                  </tr>
                )}

                {!q.isLoading &&
                  !q.isError &&
                  filteredRows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-200 even:bg-[#f9f9f9]">
                      <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.cardNumber || "-"}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{row.fullName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.phone || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.rank || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline">{row.categoryLabel}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{row.coverageLane}</td>
                      {/* <td className="px-4 py-3 whitespace-nowrap text-sm">{row.queueLabel}</td> */}
                      <td className="px-4 py-3 whitespace-nowrap">{getNHIAResultBadge(row)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="rounded p-2 hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/nhia/invoices/${row.id}`)}>
                              View Invoices
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={row.deskState === "completed"}
                              onClick={() => completeDeskReview(row.id)}
                            >
                              Mark Verification Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={row.deskState === "completed"}
                              onClick={() => markNotCleared(row.id)}
                            >
                              Mark Not Cleared
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}

                {!q.isLoading && !q.isError && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center">
                      <div className="space-y-1">
                        <p className="font-medium">No NHIA patients found.</p>
                        <p className="text-sm text-muted-foreground">
                          Patients transferred to the NHIA desk will appear here for verification review.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
