export type PatientDataType = {
  patient_id: string | number;
  personal_data: {
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    gender?: string;
    image?: string;
    contact_information?: {
      phone_number?: string;
      email?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
      emergencyContact?: {
        relationship?: string;
        name?: string;
        phone?: string;
        email?: string;
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    };
  };
  medical_history: {
    allergies: Array<{ substance: string; reaction?: string; severity?: string }>;
    conditions: Array<{
      condition_name: string;
      diagnosis_date?: string;
      status?: string;
      treatments?: Array<{ medication: string; dosage?: string; frequency?: string }>;
    }>;
    surgeries: Array<{ surgery_name: string; date?: string; outcome?: string }>;
    immunizations: Array<{ vaccine: string; date_administered: string; booster_date?: string }>;
    family_history: Array<{ relation: string; condition: string; age_at_diagnosis?: number }>;
  };
  yearly_data: Array<{
    year: number;
    monthly_data: Array<{
      month: string;
      vital_signs: Array<{
        date: string;
        systolic_blood_pressure?: number;
        diastolic_blood_pressure?: number;
        temperature?: string;
        respiratory_rate?: string;
        heart_rate?: string;
      }>;
      lab_tests: Array<{
        test_name: string;
        test_date: string;
        results: Record<string, string>;
        interpretation?: string;
      }>;
      visits: Array<{
        visit_date: string;
        reason?: string;
        diagnosis?: string;
        prescriptions?: Array<any>;
        notes?: string;
      }>;
    }>;
  }>;
};

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function buildPatientData(patient: any, vitals: any[]): PatientDataType {
  const pd: PatientDataType = {
    patient_id: String(patient?._id || ""),
    personal_data: {
      first_name: patient?.firstname || "",
      last_name: patient?.surname || "",
      date_of_birth: patient?.dateOfBirth || "",
      gender: patient?.sex || "",
      contact_information: {
        phone_number: patient?.phone || "",
        email: "",
        address: {},
        emergencyContact: {}
      }
    },
    medical_history: {
      allergies: [],
      conditions: [],
      surgeries: [],
      immunizations: [],
      family_history: []
    },
    yearly_data: []
  };
  const byYearMonth: Record<string, Record<string, any[]>> = {};
  (vitals || []).forEach((v) => {
    const d = new Date(v.recordedAt || `${v.year}-${v.month}-${v.day}`);
    const y = d.getFullYear();
    const m = monthNames[d.getMonth()];
    byYearMonth[y] = byYearMonth[y] || {};
    byYearMonth[y][m] = byYearMonth[y][m] || [];
    const systolic = typeof v.bp === "string" && v.bp.includes("/") ? Number(v.bp.split("/")[0]) : undefined;
    const diastolic = typeof v.bp === "string" && v.bp.includes("/") ? Number(v.bp.split("/")[1]) : undefined;
    const item = {
      date: d.toISOString().slice(0,10),
      systolic_blood_pressure: systolic,
      diastolic_blood_pressure: diastolic,
      temperature: typeof v.temperature === "number" ? `${v.temperature}°C` : undefined,
      respiratory_rate: typeof v.respirationRate === "number" ? `${v.respirationRate} breaths/min` : undefined,
      heart_rate: typeof v.pulse === "number" ? `${v.pulse} bpm` : undefined,
    };
    byYearMonth[y][m].push(item);
  });
  pd.yearly_data = Object.keys(byYearMonth).sort().map((yStr) => {
    const y = Number(yStr);
    const months = byYearMonth[yStr];
    const monthly_data = monthNames.map((m) => ({
      month: m,
      vital_signs: months[m] || [],
      lab_tests: [],
      visits: []
    }));
    return { year: y, monthly_data };
  });
  return pd;
}
