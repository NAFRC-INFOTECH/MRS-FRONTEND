
import { useMemo, useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, History, ArrowRightCircle, FlaskConical, Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDoctorDayListQuery } from "@/api-integration/queries/doctorDayList";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import PatientsList2 from "./PatientsList2";


export default function TodaysPatientsList() {
  const { data: daylist = [] } = useDoctorDayListQuery("GOPD", "all");
  console.log(daylist);
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState("");
  const [searchIdService, setSearchIdService] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
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
      const nmOk = searchName ? r.fullName.toLowerCase().includes(searchName.toLowerCase()) : true;
      const idOk = searchIdService
        ? r.id.toLowerCase().includes(searchIdService.toLowerCase()) ||
          r.cardNumber.toLowerCase().includes(searchIdService.toLowerCase())
        : true;
      return nmOk && idOk;
    });
  }, [daylist, searchName, searchIdService]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Today's Patients (Transferred)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 max-w-[60rem]">
        <input
          type="text"
          placeholder="Search by Name"
          className="border p-2 rounded"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
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
              <th className="px-4 py-2 text-left">UUID / Svc No</th>
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
                        onClick={() => { setTransferOpen(true); }}
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
                setTransferOpen(false);
                navigate("/lab");
              }}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Lab</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                setTransferOpen(false);
                navigate("/xray");
              }}
            >
              <Scan className="w-4 h-4" />
              <span>X-ray</span>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* <PatientsList2/> */}
    </div>
  );
}
