import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePaypointReferredPatientsQuery } from "@/api-integration/queries/patients";
import { useUpdatePatientMutation } from "@/api-integration/mutations/patients";
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
import type { PatientStatus } from "@/components/patientsTable/patientsDatas/types";
import {
  buildPaypointRows,
  type BillingCategory,
  type DeskFilter,
  type PaypointRow,
} from "./paypointPatients";

export default function PaypointPatientsList() {
  const navigate = useNavigate();
  const q = usePaypointReferredPatientsQuery();
  const update = useUpdatePatientMutation();
  const { query } = useSearch();

  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deskFilter, setDeskFilter] = useState<DeskFilter>("awaiting-clearance");
  const [categoryFilter, setCategoryFilter] = useState<BillingCategory>("all");

  useEffect(() => {
    if (q.data) setPatients(q.data as any[]);
  }, [q.data]);

  const rows = useMemo<PaypointRow[]>(() => buildPaypointRows(patients), [patients]);

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
      { id, data: { patientStatus: "active", patientQueue: "" } },
      {
        onSuccess: () => toast.success("Patient cleared from paypoint desk"),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Unable to complete paypoint processing");
        },
      }
    );
  };

  const getDeskStateBadge = (deskState: PaypointRow["deskState"]) => {
    if (deskState === "awaiting-clearance") {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          Awaiting Clearance
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Completed
      </Badge>
    );
  };

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case "paypoint":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">PAYPOINT</Badge>;
      case "nhia":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">NHIA</Badge>;
      case "gopd":
        return <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">GOPD</Badge>;
      case "discharged":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">DISCHARGED</Badge>;
      case "inactive":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">INACTIVE</Badge>;
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">ACTIVE</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Paypoint Patients List</h1>
          <p className="text-sm text-muted-foreground">
            Manage the operational queue for paypoint patients, apply desk filters, and complete per-patient
            paypoint clearance.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/paypoint")}>
          <ArrowRightLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paypoint Queue Controls</CardTitle>
          <CardDescription>
            Filter the queue by desk state, billing category, or patient identifier to focus on active paypoint
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
                <SelectItem value="awaiting-clearance">Awaiting Clearance</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as BillingCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Billing category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Billing Categories</SelectItem>
                <SelectItem value="civilian">Civilian</SelectItem>
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
          <CardTitle>Paypoint Operations Table</CardTitle>
          <CardDescription>
            This page is reserved for the live queue table and patient-level desk actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-gray-200">
              <thead className="bg-[#56bbe3] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">S/N</th>
                  <th className="px-4 py-3 text-left">Card No</th>
                  <th className="px-4 py-3 text-left">Patient Name</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Billing Category</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Billing Lane</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Queue</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Desk State</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {q.isLoading && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading paypoint patients...
                    </td>
                  </tr>
                )}

                {q.isError && !q.isLoading && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-sm text-red-600">
                      Failed to load paypoint patients.
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{row.billingLane}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{row.queueLabel}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{getDeskStateBadge(row.deskState)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="rounded p-2 hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/recordings/edit/${row.id}`)}>
                              View Biodata
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={row.deskState === "completed"}
                              onClick={() => completeDeskReview(row.id)}
                            >
                              Mark Desk Cleared
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
                        <p className="font-medium">No paypoint patients found.</p>
                        <p className="text-sm text-muted-foreground">
                          Patients transferred to the paypoint desk will appear here for billing review.
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
