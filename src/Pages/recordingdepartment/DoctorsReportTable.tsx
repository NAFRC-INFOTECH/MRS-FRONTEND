import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRightLeft } from "lucide-react";
import { useDoctorReportsQuery } from "@/api-integration/queries/doctorReports";
import { usePatientByIdQuery } from "@/api-integration/queries/patients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DoctorsReportTable() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();

  const { data: reports = [], isLoading, isError } = useDoctorReportsQuery(patientId);
  const patientQuery = usePatientByIdQuery(patientId);

  const patientName = useMemo(() => {
    const p: any = patientQuery.data;
    if (!p) return "";
    return [p.surname, p.firstname, p.middlename].filter(Boolean).join(" ").trim();
  }, [patientQuery.data]);

  const sorted = useMemo(() => {
    return [...reports].sort((a, b) => {
      const bt = new Date(b.createdAt).getTime();
      const at = new Date(a.createdAt).getTime();
      return (Number.isNaN(bt) ? 0 : bt) - (Number.isNaN(at) ? 0 : at);
    });
  }, [reports]);

  const latest = useMemo(() => (sorted.length > 0 ? sorted[0] : null), [sorted]);

  const exportExcel = () => {
    const headers = ["S/N", "Patient Name", "Date", "Doctor", "Diagnosis", "Doctor Report"];
    const rows = sorted.map((r, idx) => [
      String(idx + 1),
      String(patientName || "-"),
      new Date(r.createdAt).toLocaleString(),
      String(r.doctorName || r.senderName || r.senderId || "-"),
      String(r.diagnosis || ""),
      String(r.clinicalNote || r.text || ""),
    ]);

    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = "\ufeff" + [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().slice(0, 10);
    const safePatient = (patientName || "patient")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]+/g, "");
    a.download = `doctor_reports_${safePatient || "patient"}_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Doctor Reports</h1>
          <p className="text-sm text-muted-foreground">
            Patient Name: {patientName || "-"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!patientId || sorted.length === 0}
            onClick={exportExcel}
          >
            Export Excel
          </Button>
          {patientId && (
            <Button variant="outline" onClick={() => navigate(`/recordings/edit/${patientId}`)}>
              View Biodata
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate("/recordings/patients-registry")}>
            <ArrowRightLeft className="h-4 w-4" />
            Back to Registry
          </Button>
        </div>
      </div>

      {latest && (
        <Card className="border-2 border-[#56bbe3] bg-sky-50/80 dark:bg-sky-900/20 shadow-none">
          <CardHeader>
            <CardTitle>Most Recent Report</CardTitle>
            <CardDescription>
              {new Date(latest.createdAt).toLocaleString()} • {latest.doctorName || latest.senderName || latest.senderId || "-"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {latest.diagnosis && (
                <div className="text-sm">
                  <span className="font-semibold">Diagnosis:</span> {latest.diagnosis}
                </div>
              )}
              {(latest.clinicalNote || latest.text) && (
                <div className="text-sm">
                  <span className="font-semibold">Doctor Report:</span> {latest.clinicalNote || latest.text}
                </div>
              )}
              {!latest.diagnosis && !latest.clinicalNote && !latest.text && (
                <div className="text-sm text-muted-foreground">-</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>Clinical notes and summaries entered by doctors.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-gray-200">
              <thead className="bg-[#56bbe3] text-white">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">S/N</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Doctor</th>
                  <th className="px-4 py-3 text-left">Summary</th>
                </tr>
              </thead>
              <tbody>
                {!patientId && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Missing patient ID.
                    </td>
                  </tr>
                )}

                {patientId && isLoading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading doctor reports...
                    </td>
                  </tr>
                )}

                {patientId && isError && !isLoading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-red-600">
                      Failed to load doctor reports.
                    </td>
                  </tr>
                )}

                {patientId && !isLoading && !isError && sorted.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center">
                      <div className="space-y-1">
                        <p className="font-medium">No reports found.</p>
                        <p className="text-sm text-muted-foreground">Doctor reports will appear here once created.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {patientId &&
                  !isLoading &&
                  !isError &&
                  sorted.map((r, idx) => (
                    <tr key={r.id} className="border-b border-gray-200 even:bg-[#f9f9f9] align-top">
                      <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.doctorName || r.senderName || r.senderId || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {r.diagnosis && (
                            <div className="text-sm">
                              <span className="font-semibold">Diagnosis:</span> {r.diagnosis}
                            </div>
                          )}
                          {(r.clinicalNote || r.text) && (
                            <div className="text-sm">
                              <span className="font-semibold">Doctor Report:</span> {r.clinicalNote || r.text}
                            </div>
                          )}
                          {!r.diagnosis && !r.clinicalNote && !r.text && (
                            <div className="text-sm text-muted-foreground">-</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
