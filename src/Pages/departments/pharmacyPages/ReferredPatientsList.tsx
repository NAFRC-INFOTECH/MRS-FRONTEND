import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePharmacyReferredPatientsQuery } from "@/api-integration/queries/patients";
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
  buildPharmacyRows,
  type CoverageCategory,
  type DeskFilter,
  type PharmacyRow,
} from "./pharmacyPatients";

export default function ReferredPatientsList() {
  const navigate = useNavigate();
  const q = usePharmacyReferredPatientsQuery();
  const { query } = useSearch();

  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deskFilter, setDeskFilter] = useState<DeskFilter>("awaiting-dispense");
  const [categoryFilter, setCategoryFilter] = useState<CoverageCategory>("all");

  useEffect(() => {
    if (q.data) {
    //   console.log("Pharmacy patients data:", q.data);
      setPatients(q.data as any[]);
    }
  }, [q.data]);

  const rows = useMemo<PharmacyRow[]>(() => buildPharmacyRows(patients), [patients]);

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

  const getDeskStateBadge = (deskState: PharmacyRow["deskState"]) => {
    if (deskState === "awaiting-dispense") {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          Awaiting Dispense
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Dispensed
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Pharmacy Patients List</h1>
          <p className="text-sm text-muted-foreground">
            Manage the operational queue for pharmacy patients, apply desk filters, and complete per-patient
            medication dispensing.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/pharmacy")}>
          <ArrowRightLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pharmacy Queue Controls</CardTitle>
          <CardDescription>
            Filter the queue by desk state, coverage category, or patient identifier to focus on active pharmacy
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
                <SelectItem value="awaiting-dispense">Awaiting Dispense</SelectItem>
                <SelectItem value="completed">Dispensed</SelectItem>
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
          <CardTitle>Pharmacy Operations Table</CardTitle>
          <CardDescription>
            This page is reserved for the live queue table and patient-level desk actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-gray-200">
              <thead className="bg-[#4ade80] text-white">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">S/N</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Card No</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Patient Name</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Rank</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Coverage Category</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Clearance</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Ward</th>
                  {/* <th className="px-4 py-3 text-left whitespace-nowrap">Queue</th> */}
                  <th className="px-4 py-3 text-left whitespace-nowrap">Desk State</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {q.isLoading && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading pharmacy patients...
                    </td>
                  </tr>
                )}

                {q.isError && !q.isLoading && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-sm text-red-600">
                      Failed to load pharmacy patients.
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          className={
                            row.cleared ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {row.clearanceLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.hasBed ? (
                          row.admitted ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{row.admittedWardUnit}</Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending</Badge>
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      {/* <td className="px-4 py-3 whitespace-nowrap text-sm">{row.queueLabel}</td> */}
                      <td className="px-4 py-3 whitespace-nowrap">{getDeskStateBadge(row.deskState)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="rounded p-2 hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/pharmacy/prescription/${row.id}`)}>
                              View Prescription
                            </DropdownMenuItem>
                            {row.admitted && row.admittedWardUnit && (
                              <DropdownMenuItem
                                onClick={() => {
                                  const unit = row.admittedWardUnit.toLowerCase();
                                  const path =
                                    unit.includes("children")
                                      ? "/wards/children"
                                      : unit.includes("femalevip")
                                        ? "/wards/female-vip"
                                        : unit.includes("malevip")
                                          ? "/wards/male-vip"
                                          : unit.includes("female")
                                            ? "/wards/female"
                                            : "/wards/male";
                                  navigate(path);
                                }}
                              >
                                Open Ward
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}

                {!q.isLoading && !q.isError && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center">
                      <div className="space-y-1">
                        <p className="font-medium">No pharmacy patients found.</p>
                        <p className="text-sm text-muted-foreground">
                          Patients transferred to the pharmacy will appear here for dispensing review.
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
