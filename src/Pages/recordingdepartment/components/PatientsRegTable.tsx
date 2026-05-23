import { useEffect, useMemo, useState } from "react";
import { PlusIcon, MoreVertical, Search, Plus, Minus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import type { PatientCondition, PatientStatus } from "../../../components/patientsTable/patientsDatas/types";
import { usePatientsQuery } from "@/api-integration/queries/patients";
import { useCheckNHIAAccessMutation, useDeletePatientMutation, useUpdatePatientMutation } from "@/api-integration/mutations/patients";
import { useCreateInvoiceMutation } from "@/api-integration/mutations/invoices";
import { usePriceItemsQuery } from "@/api-integration/queries/priceList";
import { useAllInvoicesQuery, PAYMENT_STATUS, type Invoice } from "@/api-integration/queries/invoices";
import { formatCurrency } from "@/Pages/adminPages/createPriceListsPage/components/priceListTypes";
import { toast } from "sonner";
import { useSearch } from "@/contexts/SearchContext";

export default function PatientsRegTable() {
  const q = usePatientsQuery();
  const createInvoice = useCreateInvoiceMutation();
  const { data: billableItems = [] } = usePriceItemsQuery({ category: "all" as any, activeOnly: true });
  const { data: allInvoices = [] } = useAllInvoicesQuery();
  const [patients, setPatients] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "">("");
  const [searchCard, setSearchCard] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"" | "civilian" | "personnel">("");
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoicePatientId, setInvoicePatientId] = useState<string | null>(null);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceCart, setInvoiceCart] = useState<
    { priceItemId: string; name: string; category: string; unit: string; unitPrice: number; quantity: number }[]
  >([]);
  const del = useDeletePatientMutation();
  const update = useUpdatePatientMutation();
  const checkNHIA = useCheckNHIAAccessMutation();
  const { query } = useSearch();
  const transferOptions = {
    gopd: {
      label: "GOPD",
      queue: "godp_vitals",
      status: "gopd" as PatientStatus,
      successMessage: "Transferred to GOPD patients list",
    },
    nhia: {
      label: "NHIA",
      queue: "nhia",
      status: "nhia" as PatientStatus,
      successMessage: "Transferred to NHIA patients list",
    },
    paypoint: {
      label: "Paypoint",
      queue: "paypoint",
      status: "paypoint" as PatientStatus,
      successMessage: "Transferred to Paypoint patients list",
    },
  } as const;

  const navigate = useNavigate();
  useEffect(() => {
    if (q.data) setPatients(q.data as any);
  }, [q.data]);

  // Handle actions
  const handleAction = (id: string, action: string) => {
    if (action === "delete") {
      setHiddenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      del.mutate(id, {
        onSuccess: () => toast.success("Patient deleted"),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Delete failed");
          setHiddenIds((prev) => prev.filter((x) => x !== id));
        },
      });
      return;
    }

    if (action === "edit") {
      navigate(`/recordings/edit/${id}`);
      return;
    }

    if (action === "doctorReports") {
      navigate(`/recordings/doctor-reports/${id}`);
      return;
    }

    if (action === "checkNhia") {
      checkNHIA.mutate(id, {
        onSuccess: (res) => {
          const t = res.status === "cleared" ? "CLEARED" : res.status === "not_cleared" ? "NOT CLEARED" : res.status === "awaiting" ? "AWAITING" : "UNKNOWN";
          toast.success(`NHIA: ${t}`);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Unable to validate NHIA access");
        }
      });
      return;
    }

    if (action === "paypoint") {
      setInvoicePatientId(id);
      setInvoiceSearch("");
      setInvoiceCart([]);
      setInvoiceOpen(true);
      return;
    }

    if (action in transferOptions) {
      const destination = transferOptions[action as keyof typeof transferOptions];
      update.mutate({ id, data: { patientQueue: destination.queue, patientStatus: destination.status, ...(action === "nhia" ? { nhiaStatus: "awaiting", nhiaUpdatedAt: new Date().toISOString() } : {}) } }, {
        onSuccess: () => toast.success(destination.successMessage),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Transfer failed");
          update.mutate({ id, data: { patientStatus: "ok" as PatientStatus } });
        },
      });
      return;
    }

    const statusMap: Record<string, PatientStatus> = {
      "activate": "active",
      "deactivate": "inactive",
      "discharge": "discharged",
      "recover": "active",
    };
    if (statusMap[action]) {
      update.mutate({ id, data: { patientStatus: statusMap[action] } }, {
        onSuccess: () => toast.success("Status updated"),
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Update failed");
        },
      });
      return;
    }
  };

  // Status colors
  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "discharged":
        return "bg-red-100 text-red-800";
      case "in_queue":
        return "bg-blue-100 text-blue-800";
      case "gopd":
        return "bg-sky-100 text-sky-800";
      case "nhia":
        return "bg-purple-100 text-purple-800";
      case "paypoint":
        return "bg-orange-100 text-orange-800";
      case "ok":
        return "bg-green-100 text-green-800";
    }
  };

  const getPaymentBadge = (status?: string) => {
    if (!status) return <span className="text-muted-foreground">-</span>;
    if (status === PAYMENT_STATUS.PAID) {
      return <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">PAID</span>;
    }
    if (status === PAYMENT_STATUS.CANCELED) {
      return <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">CANCELED</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">AWAITING</span>;
  };

  // Condition colors removed (column hidden). Re-enable if condition is displayed.

  // Filter by status AND search by name
  const rows = useMemo(() => {
    const list = (patients as any[]).map((p) => {
      const id = String(p._id || p.personalInfo?.id || "");
      const fullName =
        p.personalInfo?.fullName ||
        [p.surname, p.firstname, p.middlename].filter(Boolean).join(" ") ||
        "";
      const phone = p.personalInfo?.phone || p.phone || "";
      const address = p.personalInfo?.address || p.address || "";
      const condition: PatientCondition | "" = (p.personalInfo?.condition as PatientCondition) || "";
      const status: PatientStatus | "" = (p.patientStatus as PatientStatus) || (p.personalInfo?.status as PatientStatus) || "active";
      const patientQueue = String(p.patientQueue || p.personalInfo?.patientQueue || "");
      const nhiaStatus = String(p.nhiaStatus || p.personalInfo?.nhiaStatus || "");
      const imageUrl = p.personalInfo?.imageUrl || "";
      const veteran = !!p.veteran;
      const cardNumber = veteran ? (p.serviceNumber || "") : (p.membershipNumber || "");
      const rank = veteran ? (p.rank || "") : "";
      return { id, fullName, phone, address, condition, status, patientQueue, nhiaStatus, imageUrl, raw: p, veteran, cardNumber, rank };
    });
    return list.filter((r) => {
      if (hiddenIds.includes(r.id)) return false;
      const nmOk = query ? r.fullName.toLowerCase().includes(query.toLowerCase()) : true;
      const stOk = statusFilter ? r.status === statusFilter : true;
      const catOk = categoryFilter ? (categoryFilter === "personnel" ? r.veteran : !r.veteran) : true;
      const cardOk = searchCard
        ? ((r.cardNumber || r.id) as string).toLowerCase().includes(searchCard.toLowerCase())
        : true;
      return nmOk && stOk && catOk && cardOk;
    });
  }, [patients, hiddenIds, query, searchCard, statusFilter, categoryFilter]);

  const getNHIABadge = (row: { status: PatientStatus | ""; patientQueue: string; nhiaStatus: string }) => {
    const inNhia = row.status === "nhia" || row.patientQueue.toLowerCase() === "nhia";
    if (inNhia) return <span className="px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800">AWAITING</span>;
    if (row.nhiaStatus === "cleared") return <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">CLEARED</span>;
    if (row.nhiaStatus === "not_cleared") return <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">NOT CLEARED</span>;
    return <span className="text-muted-foreground">-</span>;
  };

  const latestInvoiceByPatientId = useMemo(() => {
    const ids = new Set(rows.map((r) => r.id));
    const sorted = [...(allInvoices as Invoice[])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const map = new Map<string, Invoice>();
    for (const inv of sorted) {
      const pid = String(inv.patientId || "");
      if (!pid || !ids.has(pid)) continue;
      if (!map.has(pid)) map.set(pid, inv);
    }
    return map;
  }, [allInvoices, rows]);

  const selectedInvoicePatient = useMemo(() => {
    if (!invoicePatientId) return null;
    return rows.find((r) => r.id === invoicePatientId) || null;
  }, [rows, invoicePatientId]);

  const availableInvoiceItems = useMemo(() => {
    const q = invoiceSearch.trim().toLowerCase();
    const excluded = new Set(invoiceCart.map((x) => x.priceItemId));
    return (billableItems as any[])
      .filter((item) => String(item.category || "").toLowerCase() !== "drug")
      .filter((item) => (q ? String(item.name || "").toLowerCase().includes(q) : true))
      .filter((item) => !excluded.has(String(item._id)));
  }, [billableItems, invoiceSearch, invoiceCart]);

  const invoiceTotal = useMemo(() => {
    return invoiceCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [invoiceCart]);

  const addInvoiceItem = (item: any) => {
    const id = String(item._id);
    if (!id) return;
    if (invoiceCart.some((x) => x.priceItemId === id)) return;
    setInvoiceCart((prev) => [
      ...prev,
      {
        priceItemId: id,
        name: String(item.name || ""),
        category: String(item.category || ""),
        unit: String(item.unit || ""),
        unitPrice: Number(item.price || 0),
        quantity: 1,
      },
    ]);
  };

  const removeInvoiceItem = (priceItemId: string) => {
    setInvoiceCart((prev) => prev.filter((x) => x.priceItemId !== priceItemId));
  };

  const setInvoiceQty = (priceItemId: string, nextQty: number) => {
    const qty = Number.isFinite(nextQty) ? Math.max(1, Math.floor(nextQty)) : 1;
    setInvoiceCart((prev) => prev.map((x) => (x.priceItemId === priceItemId ? { ...x, quantity: qty } : x)));
  };

  const sendInvoiceAndTransfer = async () => {
    if (!invoicePatientId) return;
    if (invoiceCart.length === 0) {
      toast.error("Add at least one item to the invoice");
      return;
    }

    try {
      const items = invoiceCart.map((x) => ({
        priceItemId: x.priceItemId,
        category: x.category,
        unit: x.unit,
        name: x.name,
        quantity: x.quantity,
        unitPrice: x.unitPrice,
        totalPrice: x.unitPrice * x.quantity,
      }));

      await createInvoice.mutateAsync({ patientId: invoicePatientId, items });

      update.mutate(
        { id: invoicePatientId, data: { patientQueue: transferOptions.paypoint.queue, patientStatus: transferOptions.paypoint.status } },
        {
          onSuccess: () => toast.success("Invoice sent and patient transferred to Paypoint"),
          onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err ?? "");
            toast.error(msg || "Transfer failed");
          },
        }
      );

      setInvoiceOpen(false);
      setInvoicePatientId(null);
      setInvoiceSearch("");
      setInvoiceCart([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      toast.error(msg || "Failed to create invoice");
    }
  };

  // Form moved to PatientBiodataForm component to avoid render loops in this table

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Patients</h2>
        <button
          onClick={() => navigate("/recordings/patients/new")}
          className="flex items-center px-4 py-2 bg-[#56bbe3] text-white rounded hover:bg-[#56bbe3]/70 rounded-[8px]"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add <span className="hidden md:inline-block ml-2">Patient</span>
        </button>
      </div>

      {/* Filters + Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 max-w-[70rem]">
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) =>
            setStatusFilter(value === "all" ? "" : (value as PatientStatus))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="discharged">Discharged</SelectItem>
            <SelectItem value="gopd">GOPD</SelectItem>
            <SelectItem value="nhia">NHIA</SelectItem>
            <SelectItem value="paypoint">Paypoint</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={categoryFilter || "all"}
          onValueChange={(value) =>
            setCategoryFilter(value === "all" ? "" : (value as "civilian" | "personnel"))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="civilian">Civilian</SelectItem>
            <SelectItem value="personnel">Personnel / Veteran</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Search by Card/UUID"
          value={searchCard}
          onChange={(e) => setSearchCard(e.target.value)}
        />
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left">S/N</th>
              <th className="px-4 py-2 text-left">Card No</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">NHIA</th>
              <th className="px-4 py-2 text-left">Payment</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.cardNumber || "-"}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{r.fullName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.phone || "-"}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.rank || "-"}</td>
                <td className="p-2">
                  {r.status ? (
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(r.status)}`}>
                      {r.status.toUpperCase()}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{getNHIABadge(r)}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {getPaymentBadge(latestInvoiceByPatientId.get(r.id)?.paymentStatus)}
                </td>
                <td className="px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-gray-200 rounded">
                      <MoreVertical className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleAction(r.id, "edit")}>
                        Edit Biodata
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(r.id, "doctorReports")}>
                        Doctor Reports
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(r.id, "checkNhia")}>
                        Validate NHIA Access
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          Transfer
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {Object.entries(transferOptions).map(([key, option]) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => handleAction(r.id, key)}
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent
          className="
            sm:max-w-2xl
            lg:max-w-3xl
            xl:max-w-4xl
            h-[90vh]
            overflow-hidden
            p-0
            gap-0
            mt-8
          "
        >
          <div className="flex flex-col w-full h-full min-h-0">
            <DialogHeader className="border-b px-6 py-5">
              <DialogTitle className="text-lg sm:text-2xl font-bold">
                Create Paypoint Invoice
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {selectedInvoicePatient
                  ? `${selectedInvoicePatient.fullName} • ${selectedInvoicePatient.cardNumber || selectedInvoicePatient.id}`
                  : "Select invoice items from the price list before transferring to paypoint."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden min-h-0">
              <div className="grid lg:grid-cols-[300px_1fr] h-full">
                <div className="border-r p-5 overflow-y-auto space-y-5">
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm font-semibold">Search Price List</div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={invoiceSearch}
                        onChange={(e) => setInvoiceSearch(e.target.value)}
                        placeholder="Registration fee, consultation fee..."
                        className="pl-9 h-10 rounded-md border-muted-foreground/20"
                      />
                    </div>
                  </div>

                  {invoiceSearch && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-semibold">Available Items</h3>
                        <span className="text-xs text-muted-foreground">
                          {availableInvoiceItems.length} found
                        </span>
                      </div>

                      <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                        {availableInvoiceItems.length > 0 ? (
                          availableInvoiceItems.map((item) => (
                            <div
                              key={item._id}
                              className="
                                flex items-center justify-between gap-3
                                rounded-2xl border
                                p-3
                                bg-card/50
                                transition-all duration-200
                                hover:border-primary/30
                                hover:bg-muted/40
                                hover:shadow-sm
                              "
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{item.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {String(item.category || "")} • {formatCurrency(Number(item.price || 0))}
                                </div>
                              </div>
                              <Button size="icon" className="rounded-full" onClick={() => addInvoiceItem(item)}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="py-4 lg:py-10 text-center rounded-2xl border border-dashed">
                            <p className="text-xs sm:text-sm font-medium">No items found</p>
                            <p className="text-xs text-muted-foreground">Try another keyword</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col h-full overflow-hidden">
                  <div className="border-b px-6 py-1">
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-semibold">Invoice Cart</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Add quantities for each fee item and review totals.
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {invoiceCart.length > 0 ? (
                      <div className="space-y-5">
                        {invoiceCart.map((item) => (
                          <div
                            key={item.priceItemId}
                            className="
                              rounded-2xl border
                              bg-card/50
                              p-5
                              shadow-sm
                              transition-all duration-200
                              hover:shadow-md
                              hover:border-primary/30
                              space-y-4
                            "
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="font-semibold truncate">{item.name}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                  {item.category} • {formatCurrency(item.unitPrice)}
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="rounded-xl"
                                onClick={() => removeInvoiceItem(item.priceItemId)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() => setInvoiceQty(item.priceItemId, item.quantity - 1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => setInvoiceQty(item.priceItemId, Number(e.target.value || 1))}
                                  className="w-20 text-center rounded-xl"
                                />
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() => setInvoiceQty(item.priceItemId, item.quantity + 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="text-sm font-medium">
                                {formatCurrency(item.unitPrice * item.quantity)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground">No items added.</p>
                      </div>
                    )}
                  </div>

                  {invoiceCart.length > 0 && (
                    <div className="border-t px-6 py-2 bg-muted/30">
                      <div className="flex items-center justify-between px-4">
                        <div className="text-sm font-semibold">Total</div>
                        <div className="text-sm font-semibold">{formatCurrency(invoiceTotal)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter
              className="
                border-t
                px-6 py-4
                flex-row
                items-center
                justify-between
                bg-background
                mt-auto
                shrink-0
              "
            >
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setInvoiceOpen(false);
                  setInvoicePatientId(null);
                  setInvoiceSearch("");
                  setInvoiceCart([]);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!invoicePatientId || invoiceCart.length === 0 || createInvoice.isPending || update.isPending}
                className="rounded-xl min-w-[180px] bg-[#56bbe3] text-white hover:bg-[#56bbe3]/80"
                onClick={sendInvoiceAndTransfer}
              >
                {createInvoice.isPending ? "Sending..." : "Send Invoice to Paypoint"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
