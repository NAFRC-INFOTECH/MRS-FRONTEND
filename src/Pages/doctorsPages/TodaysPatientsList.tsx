
import { useMemo, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, History, ArrowRightCircle, FlaskConical, Scan, Pill, CreditCard, ShieldCheck, Trash2, Plus, Minus, ShoppingCart, Search, Send, BedDouble } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDoctorDayListQuery } from "@/api-integration/queries/doctorDayList";
import { usePriceItemsQuery } from "@/api-integration/queries/priceList";
import { useAddPatientToPharmacyMutation } from "@/api-integration/mutations/patients";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import TransferRequestFormModal from "./components/forms/TransferRequestFormModal";
import { useSearch } from "@/contexts/SearchContext";
import type { PriceItem } from "../adminPages/createPriceListsPage/components/priceListTypes";
import { Badge } from "@/components/ui/badge";


export default function TodaysPatientsList() {
  const { query } = useSearch();
  const { data: daylist = [] } = useDoctorDayListQuery("GOPD", "all");
  const { data: drugPriceItems = [] } = usePriceItemsQuery({
    category: "drug",
    activeOnly: true,
  });
  const { data: bedPriceItems = [] } = usePriceItemsQuery({
    category: "bed",
    activeOnly: true,
  });
  const navigate = useNavigate();
  const addToPharmacy = useAddPatientToPharmacyMutation();
  const [searchIdService, setSearchIdService] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [pharmacyFormOpen, setPharmacyFormOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [destination, setDestination] = useState<"lab" | "xray" | "nhia" | "paypoint" | "pharmacy" | null>(null);
  const [cart, setCart] = useState<{ itemId: string; prescription: string; quantity: number }[]>([]);
  const [drugSearch, setDrugSearch] = useState("");

  const allItems = useMemo(() => {
    return [...drugPriceItems, ...bedPriceItems];
  }, [drugPriceItems, bedPriceItems]);

  const rows = useMemo(() => {
    const list = (daylist as any[]).map((q) => {
      const id = String(q.patientId || "");
      const fullName = q.fullName || q.fullname || "";
      const phone = q.phone || "";
      const cardNumber = q.cardNumber || "";
      const rank = q.rank || "";
      return { id, fullName, phone, cardNumber, rank };
    });
    return list.filter((r) => {
      const nmOk = query ? r.fullName.toLowerCase().includes(query.toLowerCase()) : true;
      const idOk = searchIdService
        ? r.id.toLowerCase().includes(searchIdService.toLowerCase()) ||
          r.cardNumber.toLowerCase().includes(searchIdService.toLowerCase())
        : true;
      return nmOk && idOk;
    });
  }, [daylist, query, searchIdService]);

  const filteredItems = useMemo(() => {
    const q = drugSearch.trim().toLowerCase();
    if (!q) return [];
    return allItems.filter((item) => {
      if (!item.name.toLowerCase().includes(q)) return false;
      if (cart.find((c) => c.itemId === item._id)) return false;
      if (String(item.category || "").toLowerCase() === "bed") {
        const remaining = Number(item.stockQuantity || 0) - Number(item.soldQuantity || 0);
        return remaining > 0;
      }
      return true;
    });
  }, [allItems, drugSearch, cart]);

  const cartItems = useMemo(() => {
    return cart.map((item) => {
      const priceItem = allItems.find((d) => d._id === item.itemId);
      return { ...item, priceItem };
    });
  }, [cart, allItems]);

  const cartItemsLatestFirst = useMemo(() => {
    return [...cartItems].reverse();
  }, [cartItems]);

  const allPrescriptionsFilled = useMemo(() => {
    return cartItems.every((item) => {
      const cat = String(item.priceItem?.category || "").toLowerCase();
      if (cat === "bed") return true;
      return item.prescription.trim().length > 0;
    });
  }, [cartItems]);

  const addToCart = (priceItem: PriceItem) => {
    const cat = String(priceItem.category || "").toLowerCase();
    if (cat === "bed") {
      const remaining = Number(priceItem.stockQuantity || 0) - Number(priceItem.soldQuantity || 0);
      if (remaining <= 0) {
        toast.error("No beds remaining in this ward");
        return;
      }
    }
    setCart([...cart, { itemId: priceItem._id, prescription: cat === "bed" ? "Bed assigned" : "", quantity: 1 }]);
    setDrugSearch("");
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.itemId !== itemId));
  };

  const updateItemPrescription = (itemId: string, prescription: string) => {
    setCart(cart.map(item => 
      item.itemId === itemId ? { ...item, prescription } : item
    ));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(cart.map(item => 
      item.itemId === itemId ? { ...item, quantity } : item
    ));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Today's Patients (Transferred)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 max-w-[60rem]">
        <input
          type="text"
          placeholder="Search by UUID / Service Number"
          className="border p-2 rounded md:col-span-2"
          value={searchIdService}
          onChange={(e) => setSearchIdService(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left">S/N</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">UUID / Svc No</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {r.cardNumber || "-"}
                </td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{r.fullName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.phone || "-"}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.rank || "-"}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="rounded-[8px] flex items-center gap-2">
                        Select
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => navigate(`/doctors-dashboard/patient-history/${r.id}`)} className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        <span>View Patient History</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSelectedPatientId(r.id); setTransferOpen(true); }}
                        className="flex items-center gap-2"
                      >
                        <ArrowRightCircle className="w-4 h-4" />
                        <span>Transfer</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No patients in queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Destination</DialogTitle>
            <DialogDescription>Choose a department to transfer the patient.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setDestination("lab");
                setTransferOpen(false);
                setFormOpen(true);
              }}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Lab</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setDestination("xray");
                setTransferOpen(false);
                setFormOpen(true);
              }}
            >
              <Scan className="w-4 h-4" />
              <span>X-ray</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setDestination("nhia");
                setTransferOpen(false);
                setFormOpen(true);
              }}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>NHIA</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setDestination("paypoint");
                setTransferOpen(false);
                setFormOpen(true);
              }}
            >
              <CreditCard className="w-4 h-4" />
              <span>Paypoint</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 md:col-span-2"
              onClick={() => {
                setDestination("pharmacy");
                setTransferOpen(false);
                setPharmacyFormOpen(true);
              }}
            >
              <Pill className="w-4 h-4" />
              <span>Pharmacy</span>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TransferRequestFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        patientId={selectedPatientId}
        destination={destination as "lab" | "xray" | "nhia" | "paypoint" | null}
        onSubmitted={(dest) => {
          const destLabel = dest === "lab" ? "Lab" : dest === "xray" ? "X-ray" : dest === "nhia" ? "NHIA" : "Paypoint";
          toast.success(`Request sent to ${destLabel}`);
          if (dest === "lab") navigate("");
          else if (dest === "xray") navigate("");
          else if (dest === "nhia") navigate("");
          else if (dest === "paypoint") navigate("");
        }}
      />

      <Dialog open={pharmacyFormOpen} onOpenChange={setPharmacyFormOpen}>
        <DialogContent
          className="
            sm:max-w-2xl
            lg:ml-30
            xl:ml-20
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
            {/* HEADER */}
            <DialogHeader className="border-b px-6 py-5">
              <DialogTitle className="text-lg sm:text-2xl font-bold">
                Pharmacy Transfer
              </DialogTitle>

              <DialogDescription className="text-xs sm:text-sm">
                Search and add medications, configure quantities,
                and write prescription instructions.
              </DialogDescription>
            </DialogHeader>

            {/* BODY */}
            <div className="flex-1 overflow-hidden min-h-0">
              <div className="grid lg:grid-cols-[300px_1fr] h-full">
                {/* LEFT SIDE */}
                <div className="border-r p-5 overflow-y-auto space-y-5">
                  {/* SEARCH */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="drug-search"
                      className="text-xs sm:text-sm font-semibold"
                    >
                      Search Drugs or Ward
                    </Label>

                    <Input
                      id="drug-search"
                      placeholder="Search by drug name or Ward name..."
                      value={drugSearch}
                      onChange={(e) =>
                        setDrugSearch(e.target.value)
                      }
                      className="
                        h-10
                        rounded-md
                        border-muted-foreground/20
                      "
                    />
                  </div>

                  {/* SEARCH RESULTS */}
                  {drugSearch && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-semibold">
                          Available Items
                        </h3>

                        <span className="text-xs text-muted-foreground">
                          {filteredItems.length} found
                        </span>
                      </div>

                      <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                        {filteredItems.length > 0 ? (
                          filteredItems.map((item) => (
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
                              <div className="flex items-center gap-3">
                                <div
                                  className="
                                    w-11 h-11
                                    rounded-xl
                                    bg-primary/10
                                    flex items-center justify-center
                                  "
                                >
                                  {String(item.category || "").toLowerCase() === "bed" ? (
                                    <BedDouble className="w-5 h-5 text-primary" />
                                  ) : (
                                    <Pill className="w-5 h-5 text-primary" />
                                  )}
                                </div>

                                <div>
                                  <div className="font-medium text-sm">
                                    {item.name}
                                  </div>

                                  <div className="text-xs text-muted-foreground">
                                    {item.unit}
                                  </div>
                                </div>
                              </div>

                              <Button
                                size="icon"
                                className="rounded-full"
                                onClick={() => addToCart(item as any)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div
                              className="
                              py-4
                              lg:py-10
                              text-center
                              rounded-2xl border border-dashed
                            "
                          >
                            <Search className="w-8 h-8 mx-auto text-muted-foreground mb-2" />

                            <p className="text-xs sm:text-sm font-medium">
                              No items found
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Try another keyword
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE */}
                <div className="flex flex-col h-full overflow-hidden">
                  {/* TOP INFO */}
                  <div className="border-b px-6 py-1">
                    <div className="">
                      <h3 className="text-base sm:text-lg font-semibold">
                        Selected Items
                      </h3>

                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Configure quantity and prescription details
                        for each item.
                      </p>
                    </div>
                  </div>

                  {/* CART */}
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {cartItems.length > 0 ? (
                      <div className="space-y-5">
                        {cartItemsLatestFirst.map((item) => (
                          <div
                            key={item.itemId}
                            className="
                              rounded-2xl border
                              bg-card/50
                              p-5
                              shadow-sm
                              transition-all duration-200
                              hover:shadow-md
                              hover:border-primary/30
                              space-y-5
                            "
                          >
                            {/* CARD HEADER */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="
                                    w-12 h-12
                                    rounded-xl
                                    bg-primary/10
                                    flex items-center justify-center
                                  "
                                >
                                  {String(item.priceItem?.category || "").toLowerCase() === "bed" ? (
                                    <BedDouble className="w-5 h-5 text-primary" />
                                  ) : (
                                    <Pill className="w-5 h-5 text-primary" />
                                  )}
                                </div>

                                <div>
                                  <div className="font-semibold">
                                    {item.priceItem?.name || "Unknown Item"}
                                  </div>

                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {item.priceItem?.unit || ""}
                                  </div>
                                </div>
                              </div>

                              <Button
                                variant="destructive"
                                size="icon"
                                className="rounded-xl"
                                onClick={() =>
                                  removeFromCart(item.itemId)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* QUANTITY */}
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-semibold">
                                Quantity
                              </Label>

                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() =>
                                    updateItemQuantity(
                                      item.itemId,
                                      Math.max(
                                        1,
                                        item.quantity - 1
                                      )
                                    )
                                  }
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>

                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItemQuantity(
                                      item.itemId,
                                      parseInt(e.target.value) ||
                                        1
                                    )
                                  }
                                  className="
                                    w-24
                                    text-center
                                    rounded-xl
                                  "
                                />

                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() =>
                                    updateItemQuantity(
                                      item.itemId,
                                      item.quantity + 1
                                    )
                                  }
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* PRESCRIPTION */}
                            {String(item.priceItem?.category || "").toLowerCase() === "bed" ? (
                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-semibold">
                                  Bed Assignment
                                </Label>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                  This bed fee will be included with the request.
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-semibold">
                                  Prescription Instructions
                                </Label>

                                <Textarea
                                  placeholder="Write prescription instructions..."
                                  value={item.prescription}
                                  onChange={(e) =>
                                    updateItemPrescription(
                                      item.itemId,
                                      e.target.value
                                    )
                                  }
                                  rows={4}
                                  className="
                                    min-h-[120px]
                                    rounded-2xl
                                    resize-none
                                    focus-visible:ring-2
                                  "
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="
                          h-full
                          flex flex-col
                          items-center
                          justify-center
                          text-center
                        "
                      >
                        <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />

                        <h3 className="text-base sm:text-lg font-semibold">
                          No items added
                        </h3>

                        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                          Search and add medications from the left
                          panel to begin creating a request.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SUMMARY */}
                  {cartItems.length > 0 && (
                    <div className="border-t px-6 py-2 bg-muted/30">
                      <div
                        className="
                          flex items-center justify-between
                          px-4
                        "
                      >
                        <div>
                          <div className="font-semibold">
                            {cartItems.length} item
                            {cartItems.length > 1 ? "s" : ""} selected
                          </div>

                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Ensure all prescriptions are completed
                            before sending.
                          </div>
                        </div>

                        <Badge variant="secondary">
                          {allPrescriptionsFilled
                            ? "Ready"
                            : "Incomplete"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
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
                onClick={() => setPharmacyFormOpen(false)}
              >
                Cancel
              </Button>

              <Button
                disabled={
                  cartItems.length === 0 ||
                  !allPrescriptionsFilled ||
                  addToPharmacy.isPending
                }
                className="rounded-xl min-w-[180px] bg-primary text-primary-foreground"
                onClick={async () => {
                  if (!selectedPatientId) return;

                  try {
                    const drugs = cartItemsLatestFirst.map((item) => {
                      const p = item.priceItem;
                      const cat = String(p?.category || "").toLowerCase();
                      return {
                        priceItemId: p?._id,
                        category: p?.category,
                        unit: p?.unit,
                        name: p?.name || "Unknown Item",
                        dosage: cat === "bed" ? "Bed Fee" : "As prescribed",
                        quantity: item.quantity,
                        instructions: cat === "bed" ? "Ward bed requested" : item.prescription,
                        dispensed: false,
                      };
                    });

                    const prescription = cartItemsLatestFirst
                      .map((item) => {
                        const p = item.priceItem;
                        const cat = String(p?.category || "").toLowerCase();
                        if (cat === "bed") return `${p?.name || "Bed Fee"} (Qty: ${item.quantity})`;
                        return `${p?.name || "Unknown Drug"} (Qty: ${item.quantity}): ${item.prescription}`;
                      })
                      .join("\n");

                    await addToPharmacy.mutateAsync({
                      patientId: selectedPatientId,
                      prescription,
                      drugs,
                    });

                    toast.success(
                      "Request sent to Pharmacy"
                    );

                    setPharmacyFormOpen(false);
                    setCart([]);
                    navigate("");
                  } catch (err) {
                    const msg =
                      err instanceof Error
                        ? err.message
                        : String(err ?? "");

                    toast.error(
                      msg || "Failed to send to pharmacy"
                    );
                  }
                }}
              >
                {addToPharmacy.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send to Pharmacy
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
