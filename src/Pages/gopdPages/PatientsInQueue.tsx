
import { useMemo, useState } from "react";
import { useGopdQueueQuery } from "@/api-integration/queries/gopd";

export default function PatientsInQueue() {
  const { data: queue = [] } = useGopdQueueQuery();
  const [searchName, setSearchName] = useState("");
  const [searchIdService, setSearchIdService] = useState("");

  const rows = useMemo(() => {
    const list = (queue as any[]).map((q) => {
      const id = String(q.patientId || "");
      const fullName = q.fullName || "";
      const phone = q.phone || "";
      // const veteran = q.category === "personnel";
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
  }, [queue, searchName, searchIdService]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Patients in Queue (GOPD Vitals)</h2>
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
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No patients in queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
