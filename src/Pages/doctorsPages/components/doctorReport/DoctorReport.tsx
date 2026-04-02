import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDoctorReportsQuery } from "@/api-integration/queries/doctorReports";
import { useUser } from "@/api-integration/redux/selectors";

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text?: string;
  imageUrl?: string;
  time: string;
  replyToId?: string;
  createdAt: string;
};

type ReportType = "General" | "Lab" | "Imaging" | "Consultation" | "Surgery" | "Other";

type ReportAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

type DetailedReport = {
  id: string;
  title: string;
  doctorName: string;
  description: string;
  diagnosis?: string;
  reportType: ReportType;
  createdAt: string;
  attachments: ReportAttachment[];
  comments?: Array<{
    id: string;
    doctorName: string;
    text: string;
    createdAt: string;
  }>;
};

export default function DoctorReport({ patientId }: { patientId: string }) {
  const authed = useUser();
  const currentUserId = authed?.id || "doctor-1";
  const isDoctor =
    Array.isArray((authed as any)?.roles)
      ? (authed as any).roles.includes("doctor")
      : ((authed as any)?.role === "doctor");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const server = useDoctorReportsQuery(patientId);
  useEffect(() => {
    const list = (server.data || []).map((m) => {
      const date = new Date(m.createdAt);
      const t = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return {
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderId === currentUserId ? "You" : "Member",
        text: m.text,
        imageUrl: m.imageUrl,
        time: t,
        replyToId: m.replyToId,
        createdAt: m.createdAt,
      } as ChatMessage;
    });
    setMessages(list);
  }, [server.data, currentUserId]);

  const scrollRef = useRef<HTMLDivElement>(null);
  // removed long-press logic; using icon menu instead
  const storageKey = useMemo(() => `doctor_rich_reports:${patientId}`, [patientId]);
  const [reports, setReports] = useState<DetailedReport[]>([]);
  const [title, setTitle] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [description, setDescription] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [reportType, setReportType] = useState<ReportType>("General");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [editReportId, setEditReportId] = useState<string | null>(null);
  const reportsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = (JSON.parse(raw) as DetailedReport[]).map((r) => ({
          ...r,
          comments: r.comments || [],
        }));
        setReports(parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch {}
  }, [storageKey]);

  const saveReports = (next: DetailedReport[]) => {
    setReports(next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  const addPendingFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    setPendingFiles((prev) => [...prev, ...arr]);
  };

  const onDropFiles: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) addPendingFiles(e.dataTransfer.files);
  };

  const toDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onAddDetailedReport = async () => {
    if (!title.trim() || !doctorName.trim() || !description.trim()) return;
    const attachments: ReportAttachment[] = [];
    for (const f of pendingFiles) {
      const dataUrl = await toDataUrl(f);
      attachments.push({
        id: `${Date.now()}-${f.name}`,
        name: f.name,
        type: f.type,
        size: f.size,
        dataUrl,
      });
    }
    const rep: DetailedReport = {
      id: `rep-${Date.now()}`,
      title: title.trim(),
      doctorName: doctorName.trim(),
      description: description.trim(),
      diagnosis: diagnosis.trim() || undefined,
      reportType,
      createdAt: new Date().toISOString(),
      attachments,
      comments: [],
    };
    const next = [rep, ...reports];
    saveReports(next);
    setTitle("");
    setDoctorName("");
    setDescription("");
    setDiagnosis("");
    setReportType("General");
    setPendingFiles([]);
  };

  const onDeleteDetailedReport = (id: string) => {
    if (!window.confirm("Delete this report?")) return;
    const next = reports.filter((r) => r.id !== id);
    saveReports(next);
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startEditDetailedReport = (r: DetailedReport) => {
    setEditReportId(r.id);
    setTitle(r.title);
    setDoctorName(r.doctorName);
    setDescription(r.description);
    setDiagnosis(r.diagnosis || "");
    setReportType(r.reportType);
    if (reportsListRef.current) {
      reportsListRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const saveEditDetailedReport = () => {
    if (!editReportId) return;
    const next = reports.map((r) =>
      r.id === editReportId
        ? {
            ...r,
            title: title.trim() || r.title,
            doctorName: doctorName.trim() || r.doctorName,
            description: description.trim() || r.description,
            diagnosis: diagnosis.trim() || undefined,
            reportType,
          }
        : r
    );
    saveReports(next);
    setEditReportId(null);
    setTitle("");
    setDoctorName("");
    setDescription("");
    setDiagnosis("");
    setReportType("General");
  };

  const cancelEditDetailedReport = () => {
    setEditReportId(null);
    setTitle("");
    setDoctorName("");
    setDescription("");
    setDiagnosis("");
    setReportType("General");
  };

  const addCommentToReport = (id: string) => {
    if (!isDoctor) return;
    const textVal = (commentText[id] || "").trim();
    if (!textVal) return;
    const next = reports.map((r) =>
      r.id === id
        ? {
            ...r,
            comments: [...(r.comments || []), { id: `c-${Date.now()}`, doctorName: authed?.name || "Doctor", text: textVal, createdAt: new Date().toISOString() }],
          }
        : r
    );
    saveReports(next);
    setCommentText((prev) => ({ ...prev, [id]: "" }));
  };

  const scrollToAllReports = () => {
    const all: Record<string, boolean> = {};
    reports.forEach((r) => (all[r.id] = true));
    setExpanded(all);
    setTimeout(() => {
      reportsListRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };



 

  return (
    <div className="w-full lg:min-w-[20rem] lg:max-w-[25rem] h-full border-2 border-black/10 rounded-xl flex flex-col bg-white">
      <div className="flex items-center gap-2 p-4 h-10 border-b border-black/10">
        <div className="text-sm font-semibold"> Doctors Report</div>
        <div className="ml-auto text-xs text-gray-500">Patient-specific</div>
      </div>
          
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#56bbe3] to-cyan-500 px-4 py-2 text-white">
            <div className="text-lg font-semibold">Add Detailed Report</div>
          </div>
          <div className="p-4 bg-white space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="rounded-lg border border-black/10 p-2 text-sm outline-none focus:ring-1 focus:ring-[#00b2cb]"
                placeholder="Report Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="rounded-lg border border-black/10 p-2 text-sm outline-none focus:ring-1 focus:ring-[#00b2cb]"
                placeholder="Doctor Name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
            </div>
            <textarea
              className="w-full rounded-lg border border-black/10 p-2 text-sm outline-none focus:ring-1 focus:ring-[#00b2cb]"
              placeholder="Description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="rounded-lg border border-black/10 p-2 text-sm outline-none focus:ring-1 focus:ring-[#00b2cb]"
                placeholder="Diagnosis (optional)"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
              <select
                className="rounded-lg border border-black/10 p-2 text-sm outline-none focus:ring-1 focus:ring-[#00b2cb]"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
              >
                <option>General</option>
                <option>Lab</option>
                <option>Imaging</option>
                <option>Consultation</option>
                <option>Surgery</option>
                <option>X-Ray</option>
                <option>Other</option>
              </select>
            </div>
            <div
              className="rounded-lg border-2 border-dashed border-black/10 p-4 text-sm text-gray-600 bg-gray-50 flex flex-col items-center justify-center gap-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDropFiles}
            >
              <div>Drag and drop files here</div>
              <div>or</div>
              <input
                type="file"
                multiple
                onChange={(e) => e.target.files && addPendingFiles(e.target.files)}
              />
              {pendingFiles.length > 0 && (
                <div className="w-full mt-2 space-y-1">
                  {pendingFiles.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="flex items-center justify-between text-xs bg-white border border-black/10 rounded p-2">
                      <div className="truncate">{f.name}</div>
                      <button
                        type="button"
                        className="px-2 py-1 rounded bg-gray-100"
                        onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onAddDetailedReport}
                className="px-4 py-2 bg-[#56bbe3] text-white rounded-lg text-sm"
              >
                Add Report
              </button>
            </div>
          </div>
        </div>

        <div ref={reportsListRef} className="rounded-2xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#56bbe3] to-cyan-500 px-4 py-2 text-white flex items-center justify-between">
            <div className="text-lg font-semibold">Reports</div>
            <button
              type="button"
              className="px-3 py-1.5 bg-white/50 hover:bg-white/30 rounded text-xs"
              onClick={scrollToAllReports}
            >
              View All Reports
            </button>
          </div>
          <div className="p-4 bg-white space-y-3">
            {reports.length === 0 && (
              <div className="text-sm text-gray-500">No reports yet</div>
             )}
            {reports.map((r) => {
              return (
              <div key={r.id} className="border border-black/10 rounded-xl overflow-hidden">
                <div className="p-3 bg-white flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold">{r.title}</div>
                    <div className="text-xs text-gray-500">{r.doctorName} · {new Date(r.createdAt).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} · {r.reportType}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDoctor && (
                      <button
                        type="button"
                        className="px-2 py-1 rounded bg-blue-100 text-blue-600 text-xs"
                        onClick={() => startEditDetailedReport(r)}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className="px-2 py-1 rounded bg-gray-100 text-xs"
                      onClick={() => toggleExpanded(r.id)}
                    >
                      {expanded[r.id] ? "Hide" : "View"}
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded bg-red-100 text-red-600 text-xs"
                      onClick={() => onDeleteDetailedReport(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {expanded[r.id] && (
                  <div className="p-3 bg-gray-50 space-y-2">
                    {editReportId === r.id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input className="rounded-lg border border-black/10 p-2 text-sm outline-none" placeholder="Report Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                          <input className="rounded-lg border border-black/10 p-2 text-sm outline-none" placeholder="Doctor Name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
                        </div>
                        <textarea className="w-full rounded-lg border border-black/10 p-2 text-sm outline-none" rows={3} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input className="rounded-lg border border-black/10 p-2 text-sm outline-none" placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                          <select className="rounded-lg border border-black/10 p-2 text-sm outline-none" value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
                            <option>General</option>
                            <option>Lab</option>
                            <option>Imaging</option>
                            <option>Consultation</option>
                            <option>Surgery</option>
                            <option>X-Ray</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs" onClick={saveEditDetailedReport}>Save</button>
                          <button type="button" className="px-3 py-1.5 rounded bg-gray-200 text-xs" onClick={cancelEditDetailedReport}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-800 whitespace-pre-line">{r.description}</div>
                        {r.diagnosis && (
                          <div className="text-sm text-blue-600">Diagnosis: {r.diagnosis}</div>
                        )}
                      </>
                    )}
                    {r.attachments.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">Attachments</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {r.attachments.map((a) => (
                            <div key={a.id} className="flex items-center justify-between bg-white border border-black/10 rounded p-2 text-xs">
                              <div className="truncate">{a.name}</div>
                              <a
                                href={a.dataUrl}
                                download={a.name}
                                className="px-2 py-1 rounded bg-blue-600 text-white"
                              >
                                Download
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2 mt-2">
                      <div className="text-xs text-gray-600">Comments</div>
                      <div className="space-y-1">
                        {(r.comments || []).map((c) => (
                          <div key={c.id} className="bg-white border border-black/10 rounded p-2 text-xs flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{c.doctorName}</div>
                              <div className="text-gray-700 whitespace-pre-line">{c.text}</div>
                              <div className="text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {isDoctor && (
                        <div className="flex items-center gap-2">
                          <input
                            className="flex-1 rounded-lg border border-black/10 p-2 text-xs outline-none focus:ring-1 focus:ring-[#00b2cb]"
                            placeholder="Add a comment"
                            value={commentText[r.id] || ""}
                            onChange={(e) => setCommentText((prev) => ({ ...prev, [r.id]: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs"
                            onClick={() => addCommentToReport(r.id)}
                          >
                            Comment
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              )}
              </div>
              );
            })}
        </div>
        </div>        
      </div>
    </div>
  );
}

