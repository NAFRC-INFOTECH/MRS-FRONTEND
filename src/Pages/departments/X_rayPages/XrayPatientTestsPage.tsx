import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateLabReferralResultsMutation } from "@/api-integration/mutations/labReferrals";
import {
  useLabReferralsQuery,
  type LabReferral,
} from "@/api-integration/queries/lab";

type ResultMap = Record<string, string>;
type ErrorMap = Record<string, string>;

export default function XrayPatientTestsPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { data: referrals = [], isLoading } = useLabReferralsQuery();
  const updateResults = useUpdateLabReferralResultsMutation();

  const [results, setResults] = useState<ResultMap>({});
  const [errors, setErrors] = useState<ErrorMap>({});

  const patientReferral = useMemo(() => {
    const matches = (referrals as LabReferral[]).filter(
      (ref) =>
        String(ref.patientId) === String(patientId) &&
        (ref.to || "").toLowerCase() === "x-ray"
    );
    return matches[0];
  }, [referrals, patientId]);

  const requiredTests = useMemo(() => {
    const raw = patientReferral?.examinationRequired || "";
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [patientReferral]);

  useEffect(() => {
    setResults(patientReferral?.testResults || {});
  }, [patientReferral?.id, patientReferral?.testResults]);

  const onChangeResult = (test: string, value: string) => {
    setResults((prev) => ({
      ...prev,
      [test]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [test]: "",
    }));
  };

  const validateForm = () => {
    const nextErrors: ErrorMap = {};

    requiredTests.forEach((test) => {
      if (!results[test]?.trim()) {
        nextErrors[test] = "This field is required";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSave = () => {
    if (!validateForm()) {
      toast.error("Please complete all required X-ray results");
      return;
    }

    if (!patientReferral?.id) {
      toast.error("Referral not found");
      return;
    }

    updateResults.mutate(
      { id: patientReferral.id, testResults: results },
      {
        onSuccess: () => toast.success("Patient X-ray results saved"),
        onError: () => toast.error("Failed to save patient X-ray results"),
      }
    );
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between gap-20">
        <div>
          <h2 className="text-xl font-semibold">Patient Required X-Ray Tests</h2>
          <p className="text-sm text-gray-500">
            Required X-ray tests and result input for the selected patient.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate("/xray/patient-list")}>
          Back
        </Button>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Loading patient referral...
        </div>
      )}

      {!isLoading && !patientReferral && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
          No X-ray referral found for this patient.
        </div>
      )}

      {!isLoading && patientReferral && (
        <>
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2">
            <div>
              <div className="text-xs text-gray-500">Patient</div>
              <div className="font-medium">
                {[patientReferral.surname, patientReferral.forenames]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Service No / UUID</div>
              <div className="font-medium">
                {patientReferral.serviceNoOrUUID || patientReferral.patientId}
              </div>
            </div>

            <div className="flex w-full items-center gap-20">
              <div>
                <div className="text-xs text-gray-500">Imaging Area</div>
                <div className="font-medium">{patientReferral.specimen || "-"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Diagnosis</div>
                <div className="font-medium">{patientReferral.diagnosis || "-"}</div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full">
              <thead className="bg-[#56bbe3] text-white">
                <tr>
                  <th className="px-4 py-2 text-left">S/N</th>
                  <th className="px-4 py-2 text-left">Required Test</th>
                  <th className="px-4 py-2 text-left">Result Input</th>
                </tr>
              </thead>

              <tbody>
                {requiredTests.map((test, index) => (
                  <tr
                    key={`${test}-${index}`}
                    className="border-b border-gray-200 even:bg-[#f9f9f9]"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                    <td className="px-4 py-3">{test}</td>
                    <td className="min-w-[18rem] px-4 py-3">
                      <div className="space-y-1">
                        <Input
                          required
                          value={results[test] || ""}
                          onChange={(e) => onChangeResult(test, e.target.value)}
                          placeholder={`Enter result for ${test}`}
                          className={
                            errors[test]
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }
                        />

                        {errors[test] && (
                          <p className="text-xs text-red-500">{errors[test]}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {requiredTests.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-4 text-center text-sm text-gray-500"
                    >
                      No required X-ray tests listed for this patient.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onSave}
              disabled={updateResults.isPending}
              className="bg-[#56bbe3] text-white disabled:opacity-60"
            >
              Save Results
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
