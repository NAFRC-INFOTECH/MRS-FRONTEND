import { useMemo, useState } from "react";
import { useLabReferralsByDateQuery, type LabReferral } from "@/api-integration/queries/lab";
import { useUsersQuery, type UserLite } from "@/api-integration/queries/users";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);

export default function TodayTransferredList() {
  const [date, setDate] = useState<string>(formatDateInput(new Date()));
  const [status, setStatus] = useState<string>("");
  const { data: referrals = [], isLoading } = useLabReferralsByDateQuery(date, status || undefined);
  const { data: users = [] } = useUsersQuery();

  const userMap = useMemo(() => {
    const map = new Map<string, UserLite>();
    (users as UserLite[]).forEach((u) => map.set(String(u._id), u));
    return map;
  }, [users]);

  const rows = useMemo(() => {
    return (referrals as LabReferral[]).map((r) => {
      const sender = userMap.get(String(r.senderId));
      return {
        id: r.id,
        date: r.date ? new Date(r.date).toLocaleDateString() : "-",
        serviceNoOrUUID: r.serviceNoOrUUID || r.patientId,
        rank: r.rank || "-",
        name: [r.surname, r.forenames].filter(Boolean).join(", "),
        sender: sender?.name || String(r.senderId),
        to: r.to || "-",
        status: r.status,
      };
    });
  }, [referrals, userMap]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Transferred Patients (Today)</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Date</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status</span>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="RECEIVED">Received</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-t-[8px] overflow-hidden">
          <thead className="bg-[#56bbe3] text-white">
            <tr>
              <th className="px-4 py-2 text-left">S/N</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Service No / UUID</th>
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Transferred By</th>
              <th className="px-4 py-2 text-left">Transferred To</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">Loading…</td>
              </tr>
            )}
            {!isLoading && rows.map((r, idx) => (
              <tr key={r.id} className="even:bg-[#f9f9f9] border-b border-gray-200">
                <td className="px-4 py-2 whitespace-nowrap">{idx + 1}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.serviceNoOrUUID}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.rank}</td>
                <td className="px-4 py-2 font-medium whitespace-nowrap">{r.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.sender}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.to}</td>
                <td className="px-4 py-2 whitespace-nowrap">{r.status}</td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4">No transfers for selected date.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
