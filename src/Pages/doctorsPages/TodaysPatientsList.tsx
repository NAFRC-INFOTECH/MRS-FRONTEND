
import { useMemo, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, History, ArrowRightCircle, FlaskConical, Scan, Pill, CreditCard, ShieldCheck, Trash2, Plus } from "lucide-react";
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


export default function TodaysPatientsList() {
  const { query } = useSearch();
  const { data: daylist = [] } = useDoctorDayListQuery("GOPD", "all");
  const { data: priceItems = [] } = usePriceItemsQuery({
    category: "drug",
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
  const [cart, setCart] = useState<{ drugId: string; prescription: string }[]>([]);
  const [drugSearch, setDrugSearch] = useState("");

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

  const filteredDrugs = useMemo(() => {
    return priceItems.filter(item => 
      item.name.toLowerCase().includes(drugSearch.toLowerCase()) &&
      !cart.find(c => c.drugId === item._id)
    );
  }, [priceItems, drugSearch, cart]);

  const cartDrugs = useMemo(() => {
    return cart.map(item => {
      const drug = priceItems.find(d => d._id === item.drugId);
      return { ...item, drug };
    });
  }, [cart, priceItems]);

  const allPrescriptionsFilled = useMemo(() => {
    return cart.every(item => item.prescription.trim().length > 0);
  }, [cart]);

  const addToCart = (drug: PriceItem) => {
    setCart([...cart, { drugId: drug._id, prescription: "" }]);
    setDrugSearch("");
  };

  const removeFromCart = (drugId: string) => {
    setCart(cart.filter(item => item.drugId !== drugId));
  };

  const updateDrugPrescription = (drugId: string, prescription: string) => {
    setCart(cart.map(item => 
      item.drugId === drugId ? { ...item, prescription } : item
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
          if (dest === "lab") navigate("/lab");
          else if (dest === "xray") navigate("/xray");
          else if (dest === "nhia") navigate("/nhia");
          else if (dest === "paypoint") navigate("/departments");
        }}
      />

      <Dialog open={pharmacyFormOpen} onOpenChange={setPharmacyFormOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pharmacy Transfer</DialogTitle>
            <DialogDescription>Search and add drugs to cart, then write prescriptions for each.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="drug-search">Search Drugs</Label>
              <Input
                id="drug-search"
                placeholder="Search by drug name"
                value={drugSearch}
                onChange={(e) => setDrugSearch(e.target.value)}
              />
            </div>

            {drugSearch && filteredDrugs.length > 0 && (
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {filteredDrugs.map((drug) => (
                  <div key={drug._id} className="flex items-center gap-2 justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{drug.name}</div>
                      <div className="text-sm text-muted-foreground">{drug.unit}</div>
                    </div>
                    <Button size="sm" onClick={() => addToCart(drug)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {cartDrugs.length > 0 && (
              <div className="space-y-4">
                <Label>Cart ({cartDrugs.length})</Label>
                <div className="space-y-3">
                  {cartDrugs.map((item) => (
                    <div key={item.drugId} className="p-4 border rounded-md space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{item.drug?.name || "Unknown Drug"}</div>
                          <div className="text-sm text-muted-foreground">{item.drug?.unit || ""}</div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.drugId)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Prescription</Label>
                        <Textarea
                          placeholder="Write prescription for this drug..."
                          value={item.prescription}
                          onChange={(e) => updateDrugPrescription(item.drugId, e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setPharmacyFormOpen(false)}>Cancel</Button>
            <Button 
              disabled={cartDrugs.length === 0 || !allPrescriptionsFilled || addToPharmacy.isPending}
              onClick={async () => {
                if (!selectedPatientId) return;
                try {
                  const drugs = cartDrugs.map(item => ({
                    name: item.drug?.name || "Unknown Drug",
                    dosage: "As prescribed",
                    quantity: 1,
                    instructions: item.prescription,
                  }));
                  const prescription = cartDrugs.map(item => `${item.drug?.name || "Unknown Drug"}: ${item.prescription}`).join("\n");
                  await addToPharmacy.mutateAsync({ patientId: selectedPatientId, prescription, drugs });
                  toast.success("Request sent to Pharmacy");
                  setPharmacyFormOpen(false);
                  setCart([]);
                  navigate("/pharmacy");
                } catch (err) {
                  const msg = err instanceof Error ? err.message : String(err ?? "");
                  toast.error(msg || "Failed to send to pharmacy");
                }
              }}
            >
              Send to Pharmacy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
