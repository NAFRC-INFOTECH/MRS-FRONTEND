import type { Patient } from "../../types/patientstypes";


const PatientData: Patient[] = [{
  patient_id: 1,
  personal_data: {
    first_name: "John",
    last_name: "Doe Onai",
    date_of_birth: "1985-04-12",
    gender: "Male",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NzIxNjl8MHwxfHNlYXJjaHwxfHxkb2N0b3J8ZW58MHx8fHwxNzM3NDQxMDUzfDA&ixlib=rb-4.0.3&q=80&w=1080",
    contact_information: {
      phone_number: "+1234567890",
      email: "johndoe@example.com",
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        postal_code: "90210",
        country: "USA"
      },
      emergencyContact: {
        relationship: "Mother",
        name: "Jane Doe",
        phone: "+1234567890",
        email: "janedoe@example.com",
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        postal_code: "90210",
        country: "USA"
      },
    }
  },
  medical_history: {
    allergies: [
      {
        substance: "Penicillin",
        reaction: "Rash",
        severity: "Moderate"
      },
      {
        substance: "Peanuts",
        reaction: "Anaphylaxis",
        severity: "Severe"
      }
    ],
    conditions: [
      {
        condition_name: "Hypertension",
        diagnosis_date: "2010-08-15",
        status: "Managed",
        treatments: [
          {
            medication: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily"
          }
        ]
      },
      {
        condition_name: "Type 2 Diabetes",
        diagnosis_date: "2015-03-22",
        status: "Managed",
        treatments: [
          {
            medication: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily"
          }
        ]
      }
    ],
    surgeries: [
      {
        surgery_name: "Appendectomy",
        date: "2005-07-10",
        outcome: "Successful"
      }
    ],
    immunizations: [
      {
        vaccine: "Influenza",
        date_administered: "2022-10-01"
      },
      {
        vaccine: "COVID-19",
        date_administered: "2021-03-15",
        booster_date: "2021-10-01"
      }
    ],
    family_history: [
      {
        relation: "Father",
        condition: "Heart Disease",
        age_at_diagnosis: 55
      },
      {
        relation: "Mother",
        condition: "Breast Cancer",
        age_at_diagnosis: 60
      }
    ]
  },
  yearly_data: [
  {
    year: 2023,
    monthly_data: [
      {
        month: "Jan",
        vital_signs: [
          {
            date: "2023-01-15",
            systolic_blood_pressure: 10,
            diastolic_blood_pressure: 8,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
          {
            date: "2023-01-28",
            systolic_blood_pressure: 22,
            diastolic_blood_pressure: 13,
            temperature: "98.7°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "73 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Feb",
        vital_signs: [
          {
            date: "2023-02-10",
            systolic_blood_pressure: 45,
            diastolic_blood_pressure: 52,
            temperature: "98.4°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "74 bpm",
          },
          {
            date: "2023-02-25",
            systolic_blood_pressure: 11,
            diastolic_blood_pressure: 80,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
          ],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Mar",
        vital_signs: [
          {
            date: "2023-03-12",
            systolic_blood_pressure: 118,
            diastolic_blood_pressure: 37,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "70 bpm",
          },
          {
            date: "2023-03-29",
            systolic_blood_pressure: 120,
            diastolic_blood_pressure: 51,
            temperature: "98.6°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Apr",
        vital_signs: [
          {
            date: "2023-04-18",
            systolic_blood_pressure: 122,
            diastolic_blood_pressure: 81,
            temperature: "98.7°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "73 bpm",
          },
          {
            date: "2023-04-27",
            systolic_blood_pressure: 30,
            diastolic_blood_pressure: 42,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "74 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: []
      },
      {
        month: "May",
        vital_signs: [
          {
            date: "2023-05-20",
            systolic_blood_pressure: 12,
            diastolic_blood_pressure: 183,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "75 bpm",
          },
          {
            date: "2023-05-30",
            systolic_blood_pressure: 19,
            diastolic_blood_pressure: 84,
            temperature: "98.7°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "76 bpm",
          },
        ],
        lab_tests: [],
        visits: [
          {
            visit_date: "2023-01-15",
            reason: "Routine Checkup",
            diagnosis: "Healthy",
            prescriptions: [],
            notes: "Patient is in good health, no issues reported."
          }
        ]
      },
      {
        month: "Jun",
        vital_signs: [
          {
            date: "2023-06-22",
            systolic_blood_pressure: 121,
            diastolic_blood_pressure: 80,
            temperature: "98.5°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "72 bpm",
          },
          {
            date: "2023-06-28",
            systolic_blood_pressure: 63,
            diastolic_blood_pressure: 31,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "73 bpm",
          },
        ],
        lab_tests: [],
          visits: []
      },
      {
        month: "Jul",
        vital_signs: [
          {
            date: "2023-07-14",
            systolic_blood_pressure: 23,
            diastolic_blood_pressure: 12,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "74 bpm",
          },
          {
            date: "2023-07-29",
            systolic_blood_pressure: 15,
            diastolic_blood_pressure: 73,
            temperature: "98.7°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "75 bpm",
          },
        ],
        lab_tests: [],
          visits: [
          ]
      },
      {
        month: "Aug",
        vital_signs: [
          {
            date: "2023-08-19",
            systolic_blood_pressure: 19,
            diastolic_blood_pressure: 28,
            temperature: "98.4°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "71 bpm",
          },
          {
            date: "2023-08-27",
            systolic_blood_pressure: 121,
            diastolic_blood_pressure: 80,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
          ],
          visits: [
            
          ]
      },
      {
        month: "Sep",
        vital_signs: [
          {
            date: "2023-09-21",
            systolic_blood_pressure: 10,
            diastolic_blood_pressure: 7,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "73 bpm",
          },
          {
            date: "2023-09-30",
            systolic_blood_pressure: 140,
            diastolic_blood_pressure: 20,
            temperature: "98.6°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "74 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: [
          ]
      },
      {
        month: "Oct",
        vital_signs: [
          {
            date: "2023-10-17",
            systolic_blood_pressure: 15,
            diastolic_blood_pressure: 4,
            temperature: "98.7°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "76 bpm",
          },
          {
            date: "2023-10-28",
            systolic_blood_pressure: 12,
            diastolic_blood_pressure: 5,
            temperature: "98.8°F",
            respiratory_rate: "18 breaths/min",
            heart_rate: "77 bpm",
          },
        ],
        lab_tests: [],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Nov",
        vital_signs: [
          {
            date: "2023-11-13",
            systolic_blood_pressure: 118,
            diastolic_blood_pressure: 77,
            temperature: "98.3°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "70 bpm",
          },
          {
            date: "2023-11-25",
            systolic_blood_pressure: 10,
            diastolic_blood_pressure: 9,
            temperature: "98.4°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
          ],
          visits: [
            
          ]
      },
      {
        month: "Dec",
        vital_signs: [
          {
            date: "2023-12-16",
            systolic_blood_pressure: 1,
            diastolic_blood_pressure: 2,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
          {
            date: "2023-12-30",
            systolic_blood_pressure: 14,
            diastolic_blood_pressure: 82,
            temperature: "98.7°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "74 bpm",
          }
        ],
        lab_tests: [
            
          ],
          visits: [
            
          ]
      }
    ]
    },
    {
    year: 2024,
    monthly_data: [
      {
        month: "Jan",
        vital_signs: [
          {
            date: "2024-01-15",
            systolic_blood_pressure: 20,
            diastolic_blood_pressure: 0,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
          {
            date: "2023-01-28",
            systolic_blood_pressure: 120,
            diastolic_blood_pressure: 18,
            temperature: "98.7°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "73 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Feb",
        vital_signs: [
          {
            date: "2023-02-10",
            systolic_blood_pressure: 15,
            diastolic_blood_pressure: 12,
            temperature: "98.4°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "74 bpm",
          },
          {
            date: "2023-02-25",
            systolic_blood_pressure: 11,
            diastolic_blood_pressure: 10,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
          ],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Mar",
        vital_signs: [
          {
            date: "2023-03-12",
            systolic_blood_pressure: 68,
            diastolic_blood_pressure: 29,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "70 bpm",
          },
          {
            date: "2023-03-29",
            systolic_blood_pressure: 20,
            diastolic_blood_pressure: 181,
            temperature: "98.6°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: [
            {
              visit_date: "2024-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Apr",
        vital_signs: [
          {
            date: "2023-04-18",
            systolic_blood_pressure: 22,
            diastolic_blood_pressure: 81,
            temperature: "98.7°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "73 bpm",
          },
          {
            date: "2023-04-27",
            systolic_blood_pressure: 14,
            diastolic_blood_pressure: 82,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "74 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: []
      },
      {
        month: "May",
        vital_signs: [
          {
            date: "2023-05-20",
            systolic_blood_pressure: 14,
            diastolic_blood_pressure: 8,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "75 bpm",
          },
          {
            date: "2023-05-30",
            systolic_blood_pressure: 26,
            diastolic_blood_pressure: 24,
            temperature: "98.7°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "76 bpm",
          },
        ],
        lab_tests: [],
        visits: [
          {
            visit_date: "2024-01-15",
            reason: "Routine Checkup",
            diagnosis: "Healthy",
            prescriptions: [],
            notes: "Patient is in good health, no issues reported."
          }
        ]
      },
      {
        month: "Jun",
        vital_signs: [
          {
            date: "2023-06-22",
            systolic_blood_pressure: 21,
            diastolic_blood_pressure: 10,
            temperature: "98.5°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "72 bpm",
          },
          {
            date: "2023-06-28",
            systolic_blood_pressure: 123,
            diastolic_blood_pressure: 21,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "73 bpm",
          },
        ],
        lab_tests: [],
          visits: []
      },
      {
        month: "Jul",
        vital_signs: [
          {
            date: "2023-07-14",
            systolic_blood_pressure: 123,
            diastolic_blood_pressure: 92,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "74 bpm",
          },
          {
            date: "2023-07-29",
            systolic_blood_pressure: 125,
            diastolic_blood_pressure: 43,
            temperature: "98.7°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "75 bpm",
          },
        ],
        lab_tests: [],
          visits: [
          ]
      },
      {
        month: "Aug",
        vital_signs: [
          {
            date: "2023-08-19",
            systolic_blood_pressure: 19,
            diastolic_blood_pressure: 78,
            temperature: "98.4°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "71 bpm",
          },
          {
            date: "2023-08-27",
            systolic_blood_pressure: 21,
            diastolic_blood_pressure: 80,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
          ],
          visits: [
            
          ]
      },
      {
        month: "Sep",
        vital_signs: [
          {
            date: "2023-09-21",
            systolic_blood_pressure: 10,
            diastolic_blood_pressure: 79,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "73 bpm",
          },
          {
            date: "2023-09-30",
            systolic_blood_pressure: 12,
            diastolic_blood_pressure: 1,
            temperature: "98.6°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "74 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Lipid Panel",
              test_date: "2024-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: [
          ]
      },
      {
        month: "Oct",
        vital_signs: [
          {
            date: "2023-10-17",
            systolic_blood_pressure: 15,
            diastolic_blood_pressure: 4,
            temperature: "98.7°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "76 bpm",
          },
          {
            date: "2023-10-28",
            systolic_blood_pressure: 26,
            diastolic_blood_pressure: 5,
            temperature: "98.8°F",
            respiratory_rate: "18 breaths/min",
            heart_rate: "77 bpm",
          },
        ],
        lab_tests: [],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Nov",
        vital_signs: [
          {
            date: "2023-11-13",
            systolic_blood_pressure: 198,
            diastolic_blood_pressure: 77,
            temperature: "98.3°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "70 bpm",
          },
          {
            date: "2023-11-25",
            systolic_blood_pressure: 0,
            diastolic_blood_pressure: 11,
            temperature: "98.4°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2024-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
          ],
          visits: [
            
          ]
      },
      {
        month: "Dec",
        vital_signs: [
          {
            date: "2023-12-16",
            systolic_blood_pressure: 12,
            diastolic_blood_pressure: 1,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
          {
            date: "2023-12-30",
            systolic_blood_pressure: 14,
            diastolic_blood_pressure: 2,
            temperature: "98.7°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "74 bpm",
          }
        ],
        lab_tests: [
            
          ],
          visits: [
            
          ]
      }
    ]
    },
    {
    year: 2025,
    monthly_data: [
      {
        month: "Jan",
        vital_signs: [
          {
            date: "2023-01-15",
            systolic_blood_pressure: 20,
            diastolic_blood_pressure: 0,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
          {
            date: "2023-01-28",
            systolic_blood_pressure: 12,
            diastolic_blood_pressure: 1,
            temperature: "98.7°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "73 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2025-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Feb",
        vital_signs: [
          {
            date: "2023-02-10",
            systolic_blood_pressure: 85,
            diastolic_blood_pressure: 2,
            temperature: "98.4°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "74 bpm",
          },
          {
            date: "2023-02-25",
            systolic_blood_pressure: 0,
            diastolic_blood_pressure: 8,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-11",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
          ],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Mar",
        vital_signs: [
          {
            date: "2023-03-12",
            systolic_blood_pressure: 18,
            diastolic_blood_pressure: 79,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "70 bpm",
          },
          {
            date: "2023-03-29",
            systolic_blood_pressure: 10,
            diastolic_blood_pressure: 8,
            temperature: "98.6°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Apr",
        vital_signs: [
          {
            date: "2023-04-18",
            systolic_blood_pressure: 162,
            diastolic_blood_pressure: 1,
            temperature: "98.7°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "73 bpm",
          },
          {
            date: "2023-04-27",
            systolic_blood_pressure: 14,
            diastolic_blood_pressure: 34,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "74 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: []
      },
      {
        month: "May",
        vital_signs: [
          {
            date: "2023-05-20",
            systolic_blood_pressure: 14,
            diastolic_blood_pressure: 83,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "75 bpm",
          },
          {
            date: "2023-05-30",
            systolic_blood_pressure: 16,
            diastolic_blood_pressure: 84,
            temperature: "98.7°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "76 bpm",
          },
        ],
        lab_tests: [],
        visits: [
          {
            visit_date: "2023-01-15",
            reason: "Routine Checkup",
            diagnosis: "Healthy",
            prescriptions: [],
            notes: "Patient is in good health, no issues reported."
          }
        ]
      },
      {
        month: "Jun",
        vital_signs: [
          {
            date: "2023-06-22",
            systolic_blood_pressure: 12,
            diastolic_blood_pressure: 8,
            temperature: "98.5°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "72 bpm",
          },
          {
            date: "2023-06-28",
            systolic_blood_pressure: 13,
            diastolic_blood_pressure: 8,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "73 bpm",
          },
        ],
        lab_tests: [],
          visits: []
      },
      {
        month: "Jul",
        vital_signs: [
          {
            date: "2023-07-14",
            systolic_blood_pressure: 183,
            diastolic_blood_pressure: 32,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "74 bpm",
          },
          {
            date: "2023-07-29",
            systolic_blood_pressure: 55,
            diastolic_blood_pressure: 13,
            temperature: "98.7°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "75 bpm",
          },
        ],
        lab_tests: [],
          visits: [
          ]
      },
      {
        month: "Aug",
        vital_signs: [
          {
            date: "2023-08-19",
            systolic_blood_pressure: 100,
            diastolic_blood_pressure: 78,
            temperature: "98.4°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "71 bpm",
          },
          {
            date: "2023-08-27",
            systolic_blood_pressure: 11,
            diastolic_blood_pressure: 80,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
          ],
          visits: [
            
          ]
      },
      {
        month: "Sep",
        vital_signs: [
          {
            date: "2023-09-21",
            systolic_blood_pressure: 20,
            diastolic_blood_pressure: 179,
            temperature: "98.5°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "73 bpm",
          },
          {
            date: "2023-09-30",
            systolic_blood_pressure: 12,
            diastolic_blood_pressure: 81,
            temperature: "98.6°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "74 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
            {
              test_name: "Lipid Panel",
              test_date: "2023-01-10",
              results: {
                total_cholesterol: "180 mg/dL",
                hdl_cholesterol: "50 mg/dL",
                ldl_cholesterol: "100 mg/dL",
                triglycerides: "150 mg/dL"
              },
              interpretation: "Borderline high LDL cholesterol"
            }
          ],
          visits: [
          ]
      },
      {
        month: "Oct",
        vital_signs: [
          {
            date: "2023-10-17",
            systolic_blood_pressure: 125,
            diastolic_blood_pressure: 4,
            temperature: "98.7°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "76 bpm",
          },
          {
            date: "2023-10-28",
            systolic_blood_pressure: 126,
            diastolic_blood_pressure: 5,
            temperature: "98.8°F",
            respiratory_rate: "18 breaths/min",
            heart_rate: "77 bpm",
          },
        ],
        lab_tests: [],
          visits: [
            {
              visit_date: "2023-01-15",
              reason: "Routine Checkup",
              diagnosis: "Healthy",
              prescriptions: [],
              notes: "Patient is in good health, no issues reported."
            }
          ]
      },
      {
        month: "Nov",
        vital_signs: [
          {
            date: "2023-11-13",
            systolic_blood_pressure: 18,
            diastolic_blood_pressure: 77,
            temperature: "98.3°F",
            respiratory_rate: "15 breaths/min",
            heart_rate: "70 bpm",
          },
          {
            date: "2023-11-25",
            systolic_blood_pressure: 20,
            diastolic_blood_pressure: 79,
            temperature: "98.4°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
        ],
        lab_tests: [
            {
              test_name: "Complete Blood Count (CBC)",
              test_date: "2023-01-10",
              results: {
                white_blood_cells: "7,000 cells/mcL",
                red_blood_cells: "5.2 million cells/mcL",
                hemoglobin: "14.5 g/dL",
                hematocrit: "42%",
                platelets: "250,000 cells/mcL"
              },
              interpretation: "Normal"
            },
          ],
          visits: [
            
          ]
      },
      {
        month: "Dec",
        vital_signs: [
          {
            date: "2023-12-16",
            systolic_blood_pressure: 122,
            diastolic_blood_pressure: 81,
            temperature: "98.6°F",
            respiratory_rate: "16 breaths/min",
            heart_rate: "72 bpm",
          },
          {
            date: "2023-12-30",
            systolic_blood_pressure: 124,
            diastolic_blood_pressure: 82,
            temperature: "98.7°F",
            respiratory_rate: "17 breaths/min",
            heart_rate: "74 bpm",
          }
        ],
        lab_tests: [
            
          ],
          visits: [
            
          ]
      }
    ]
  }
]
}];

export default PatientData;
