import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/api-integration/redux/selectors";
import { useDoctorReportsQuery } from "@/api-integration/queries/doctorReports";
import {
  useAddDoctorReportMutation,
  useDeleteDoctorReportMutation,
  useUpdateDoctorReportMutation,
} from "@/api-integration/mutations/doctorReports";
import { useProfileQuery } from "@/api-integration/queries/profile";

type NoteDraft = {
  diagnosis: string;
  clinicalNote: string;
};

const emptyDraft: NoteDraft = {
  diagnosis: "",
  clinicalNote: "",
};

export default function DoctorReport({ patientId }: { patientId: string }) {
  const authed = useUser();
  const roles = authed?.roles || [];
  const { data } = useProfileQuery();

  console.log(authed)
  const canManage = roles.includes("doctor") || roles.includes("super_admin") || roles.includes("admin");

  const { data: notes = [], isLoading, isError } = useDoctorReportsQuery(patientId);
  const addNote = useAddDoctorReportMutation();
  const updateNote = useUpdateDoctorReportMutation();
  const deleteNote = useDeleteDoctorReportMutation();

  const [draft, setDraft] = useState<NoteDraft>(emptyDraft);
  const [editId, setEditId] = useState<string | null>(null);

  const doctorName = data?.name || authed?.name || "Doctor";


  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notes]
  );

  const resetForm = () => {
    setDraft(emptyDraft);
    setEditId(null);
  };

  const onSubmit = () => {
    if (!draft.diagnosis.trim() || !draft.clinicalNote.trim()) {
      toast.error("Diagnosis and clinical note are required");
      return;
    }

    if (editId) {
      updateNote.mutate(
        {
          id: editId,
          patientId,
          diagnosis: draft.diagnosis.trim(),
          clinicalNote: draft.clinicalNote.trim(),
        },
        {
          onSuccess: () => {
            toast.success("Clinical note updated");
            resetForm();
          },
          onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err ?? "");
            toast.error(msg || "Failed to update clinical note");
          },
        }
      );
      return;
    }

    addNote.mutate(
      {
        patientId,
        diagnosis: draft.diagnosis.trim(),
        clinicalNote: draft.clinicalNote.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Clinical note added");
          resetForm();
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Failed to add clinical note");
        },
      }
    );
  };

  const startEdit = (note: { id: string; diagnosis?: string; clinicalNote?: string; text?: string }) => {
    setEditId(note.id);
    setDraft({
      diagnosis: note.diagnosis || "",
      clinicalNote: note.clinicalNote || note.text || "",
    });
  };

  const onDelete = (id: string) => {
    if (!window.confirm("Delete this clinical note?")) return;
    deleteNote.mutate(
      { id, patientId },
      {
        onSuccess: () => {
          toast.success("Clinical note deleted");
          if (editId === id) resetForm();
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Failed to delete clinical note");
        },
      }
    );
  };

  return (
    <div className="flex h-full w-full flex-col rounded-xl bg-white">
      <div className="flex h-10 items-center gap-2 border-b border-black/10 p-4">
        <div className="text-sm font-semibold">Clinical Notes</div>
        <div className="ml-auto text-xs text-gray-500">Diagnosis and doctor attribution</div>
      </div>

      <div className="space-y-4 p-3">
        <div className="overflow-hidden rounded-2xl shadow-md">
          <div className="bg-gradient-to-r from-[#56bbe3] to-cyan-500 px-4 py-2 text-white">
            <div className="text-lg font-semibold">
              {editId ? "Edit Clinical Note" : "Add Clinical Note"}
            </div>
          </div>
          <div className="space-y-3 bg-white p-4">
            <input
              className="w-full rounded-lg border border-black/10 bg-gray-50 p-2 text-sm text-gray-600 outline-none"
              value={`Doc: ${doctorName}`}
              readOnly
            />
            <textarea
              className="w-full rounded-lg border border-black/10 p-2 text-sm outline-none focus:ring-1 focus:ring-[#00b2cb]"
              placeholder="Patient diagnosis"
              value={draft.diagnosis}
              onChange={(e) => setDraft((prev) => ({ ...prev, diagnosis: e.target.value }))}
            />
            <textarea
              className="w-full rounded-lg border border-black/10 p-3 text-sm outline-none focus:ring-1 focus:ring-[#00b2cb]"
              placeholder="Write the clinical note for this patient"
              rows={5}
              value={draft.clinicalNote}
              onChange={(e) => setDraft((prev) => ({ ...prev, clinicalNote: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canManage || addNote.isPending || updateNote.isPending}
                className="rounded-lg bg-[#56bbe3] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editId ? "Save Note" : "Add Note"}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl shadow-md">
          <div className="bg-gradient-to-r from-[#56bbe3] to-cyan-500 px-4 py-2 text-white">
            <div className="text-lg font-semibold">Saved Clinical Notes</div>
          </div>
          <div className="space-y-3 bg-white p-4">
            {isLoading && <div className="text-sm text-gray-500">Loading clinical notes...</div>}
            {isError && !isLoading && (
              <div className="text-sm text-red-600">Failed to load clinical notes.</div>
            )}
            {!isLoading && !isError && sortedNotes.length === 0 && (
              <div className="text-sm text-gray-500">No clinical notes yet.</div>
            )}

            {!isLoading &&
              !isError &&
              sortedNotes.map((note) => (
                <div key={note.id} className="rounded-xl border border-black/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Diagnosis: {note.diagnosis || "Not specified"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Added by {doctorName || note.senderName || "Doctor"} on{" "}
                        {new Date(note.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                          onClick={() => startEdit(note)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded bg-red-100 px-2 py-1 text-xs text-red-700"
                          onClick={() => onDelete(note.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 whitespace-pre-line rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                    {note.clinicalNote || note.text || "No clinical note provided."}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

