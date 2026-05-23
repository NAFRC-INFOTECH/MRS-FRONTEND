import { useMemo, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClinicalDayListQuery } from "@/api-integration/queries/clinicalDayList";
import { useSearch } from "@/contexts/SearchContext";

export default function EarPatientsTable() {
  const {query} = useSearch()
  const { data: daylist = [], isLoading } = useClinicalDayListQuery("EarDoctor", "all", "GOPD");
  const navigate = useNavigate();
  const [searchIdService, setSearchIdService] = useState("");

  const rows = useMemo(() => {
    const list = (daylist as any[]).map((q) => {
      const id = String(q.patientId || "");
      const fullName = q.fullName || "";
      const phone = q.phone || "";
      const cardNumber = q.cardNumber || "";
      const rank = q.rank || "";
      return { id, fullName, phone, cardNumber, rank };
    });
    return list.filter((r) => {
      const q1 = (query || "").trim().toLowerCase();
      const name = (r.fullName || "").toLowerCase();
      const nmOk = (q1 ? name.includes(q1) : true);
      const idOk = searchIdService
        ? r.id.toLowerCase().includes(searchIdService.toLowerCase()) ||
          r.cardNumber.toLowerCase().includes(searchIdService.toLowerCase())
        : true;
      return nmOk && idOk;
    });
  }, [daylist, query, searchIdService]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Ear Checkups (Transferred from GOPD)</h2>
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
              <th className="px-4 py-2 text-left">UUID / Svc No</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading &&
              rows.map((r, idx) => (
                <tr key={r.id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                  <td className="px-4 py-2 whitespace-nowrap">{idx + 1}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.cardNumber || "-"}</td>
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
                        <DropdownMenuItem
                          onClick={() => navigate(`/clinical/ear/patient-history/${r.id}`)}
                          className="flex items-center gap-2"
                        >
                          <History className="w-4 h-4" />
                          <span>View Patient History</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No patients transferred.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
