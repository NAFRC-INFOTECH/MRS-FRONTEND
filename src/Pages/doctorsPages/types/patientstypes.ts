export type Patient = {
  patient_id: number | string;
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
      vital_signs: Array<VitalSignEntry>;
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

export type VitalSignEntry = {
  date: string;
  systolic_blood_pressure?: number;
  diastolic_blood_pressure?: number;
  temperature?: string;
  respiratory_rate?: string;
  heart_rate?: string;
};

export type MonthlyData = {
  month: string;
  vital_signs: VitalSignEntry[];
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
};
