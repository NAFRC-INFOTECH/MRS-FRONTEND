import React from 'react';
import ReactDom from 'react-dom/client';
import './index.css'

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'

import { Provider } from "react-redux";
import { store } from "@/api-integration/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RequireAuth from "@/api-integration/authGuard/RequireAuth";
import RequireDoctorProfile from "@/api-integration/authGuard/RequireDoctorProfile";
import { Toaster } from "@/components/ui/sonner";
import GlobalErrorBoundary from "./shared/GlobalErrorBoundary";
import GlobalClientLogging from './shared/GlobalClientLogging';
import GlobalRealtimeSync from "./shared/GlobalRealtimeSync";
import AcceptInvite from "./Pages/auth/AcceptInvite";


import {
  MainLayout,
  Root,
  NotFoundPage,
  LandingPage,
  Dashboard,
  Login,
  MultiStepDoctorForm,
  SuperAdminDashboard,
  Nurses,
  Doctors,
  DoctorProfile,
  Patients,
  ServiceUsers,
  DoctorsDashboard,
  GopdDashboard,
  PatientsRegistry,
  UserSettings,
  Recordings,
  Radiology,
  Clinical,
  RecordingDashboard,
  RecordingProfile,
  PatientsInQueue,
  AllDepartments,
  PatientsBiodataPage,
  PatientsEditPage,
  LabDashboard,
  LabPatientTestsPage,
  XrayDashboard,
  XrayPatientsList,
  XrayPatientTestsPage,
  AddVitalsSigns,
  NurseGeneral,
  PatientMedicalHistory,
  TodaysPatientsList,
  TodayTransferredList,
  LabPatientsList,
  Admins,
  AdminDashboard,
  CreatePriceList,
  AuditLog,
  NHIADashboard,
  NHIAPatientsList,
  NHIAInvoicesList,
  PaypointDashboard,
  PaypointPatientsList,
  PharmacyDashboard,
  ReferredPatientsList,
  ViewPrescription,
  DoctorsReportTable,
  EarDoctorDashboard,
  EarPatientsTable,
  EyeDoctorDashboard,
  EyePatientsTable,
  DailyShifts,
  ChildrenWard,
  FemaleWard,
  MaleWard,
  MaleVIP,
  FemaleVIP,
  WardsRedirect,
  AntenatalPatients,
} from './App'
import { SearchProvider } from './contexts/SearchContext';
import ClinicalRedirect from './Pages/clinical/ClinicalRedirect';




const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />} errorElement={<NotFoundPage />}>

      {/* <Route index path='/' element={<SuperAdminDashboard />} /> */}
      <Route index path='/' element={<LandingPage />} />

      {/* All Protected Routes */}
      <Route element={<Dashboard />}>
        <Route element={<MainLayout />}>
          {/* this is super admin dashboard routes */}
          <Route element={<RequireAuth roles={["super_admin"]} />}>
            <Route path='mrs-admin'>
              <Route index element={<SuperAdminDashboard />} />
              <Route path='admins' element={<Admins />} />
              <Route path='staffs' element={<Nurses />} />
              <Route path='doctors' element={<Doctors />} />
              <Route path='doctors/:id' element={<DoctorProfile />} />
              <Route path='patients' element={<Patients />} />
              <Route path='service-users' element={<ServiceUsers />} />
              <Route path='recordings' element={<Recordings />} />
              <Route path='radiology' element={<Radiology />} />
              <Route path='clinical' element={<Clinical />} />
              <Route path='audit-log' element={<AuditLog />} />
              <Route path='all-departments' element={<AllDepartments />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<RequireAuth roles={["admin"]} />}>
            <Route path='admin-dashboard'>
              <Route index element={<AdminDashboard />} />
              <Route path='all-departments' element={<AllDepartments />} />
              <Route path='price-list' element={<CreatePriceList />} />
              <Route path='doctors' element={<Doctors />} />
              <Route path='doctors/:id' element={<DoctorProfile />} />
              <Route path='staffs' element={<Nurses />} />
              <Route path='patients' element={<Patients />} />
              <Route path='recordings' element={<Recordings />} />
              <Route path='radiology' element={<Radiology />} />
              <Route path='clinical' element={<Clinical />} />
              <Route path='service-users' element={<ServiceUsers />} />
              <Route path='daily-duty' element={<DailyShifts />} />
              {/* <Route path='audit-log' element={<AuditLog />} /> */}
            </Route>
          </Route>

          {/* Doctors Routes */}
          <Route element={<RequireAuth roles={["doctor"]} />}>
            <Route element={<RequireDoctorProfile />}>
              <Route path='doctors-dashboard'>
                <Route index element={<DoctorsDashboard />} />
                <Route path='hiring-doctor-form' element={<MultiStepDoctorForm />} />
                <Route path='patient-history/:patientId' element={<PatientMedicalHistory />} />
                <Route path='todays-patients-list' element={<TodaysPatientsList />} />
                <Route path='today-transferred-list' element={<TodayTransferredList />} />
              </Route>
            </Route>
          </Route>

          {/* Clinical Routes */}
          <Route element={<RequireAuth roles={["clinical"]} />}>
            <Route path='clinical'>
              <Route index element={<ClinicalRedirect />} />
              <Route element={<RequireAuth roles={["clinical"]} departments={["eardoctor"]} />}>
                <Route path='ear'>
                  <Route index element={<EarDoctorDashboard />} />
                  <Route path='patients' element={<EarPatientsTable />} />
                  <Route path='patient-history/:patientId' element={<PatientMedicalHistory />} />
                </Route>
              </Route>
              <Route element={<RequireAuth roles={["clinical"]} departments={["eyedoctor"]} />}>
                <Route path='eye'>
                  <Route index element={<EyeDoctorDashboard />} />
                  <Route path='patients' element={<EyePatientsTable />} />
                  <Route path='patient-history/:patientId' element={<PatientMedicalHistory />} />
                </Route>
              </Route>
            </Route>
          </Route>

          {/* General Permit Routes */}
          <Route element={<RequireAuth roles={["staff"]} departments={["general"]} />}>
            <Route path='general'>
              <Route index element={<NurseGeneral />} />
            </Route>
          </Route>

          {/* Nurses Dashboard */}
          <Route element={<RequireAuth roles={["staff"]} departments={["GOPD", "general"]} />}>
            <Route path='gopd'>
              <Route index element={<GopdDashboard />} />
              <Route path="patients-in-queue" element={<PatientsInQueue />} />
              <Route path="add-vitals-signs/:patientId" element={<AddVitalsSigns />} />
            </Route>
          </Route>

          {/* Lab Dashboard */}
          <Route element={<RequireAuth roles={["staff"]} departments={["lab", "general"]} />}>
            <Route path='lab'>
              <Route index element={<LabDashboard />} />
              <Route path="patient-list" element={<LabPatientsList />} />
              <Route path="patient-list/:patientId" element={<LabPatientTestsPage />} />
            </Route>
          </Route>

          {/* Radiology Dashboard */}
          <Route element={<RequireAuth roles={["radiology"]} />}>
            <Route path='radiology'>
              <Route index element={<XrayDashboard />} />
              <Route path="patient-list" element={<XrayPatientsList />} />
              <Route path="patient-list/:patientId" element={<XrayPatientTestsPage />} />
            </Route>
          </Route>

          {/* NHIA Dashboard */}
          <Route element={<RequireAuth roles={["staff"]} departments={["nhia", "general"]} />}>
            <Route path='nhia'>
              <Route index element={<NHIADashboard />} />
              <Route path="patients" element={<NHIAPatientsList />} />
              <Route path="invoices" element={<NHIAInvoicesList />} />
              <Route path="invoices/:patientId" element={<NHIAInvoicesList />} />
            </Route>
          </Route>

          {/* Antenatal */}
          <Route element={<RequireAuth roles={["staff"]} departments={["antenatal", "general"]} />}>
            <Route path='antenatal'>
              <Route index element={<AntenatalPatients />} />
              <Route path="patients" element={<AntenatalPatients />} />
            </Route>
          </Route>

          {/* Paypoint Dashboard */}
          <Route element={<RequireAuth roles={["staff"]} departments={["paypoint", "general"]} />}>
            <Route path='paypoint'>
              <Route index element={<PaypointDashboard />} />
              <Route path="patients" element={<PaypointPatientsList />} />
            </Route>
          </Route>

          {/* Pharmacy Dashboard */}
          <Route element={<RequireAuth roles={["staff"]} departments={["pharmacy", "general"]} />}>
            <Route path='pharmacy'>
              <Route index element={<PharmacyDashboard />} />
              <Route path="patientsList" element={<ReferredPatientsList />} />
              <Route path="prescription/:patientId" element={<ViewPrescription />} />
            </Route>
          </Route>

          {/* Wards */}
          <Route path='wards'>
            <Route element={<RequireAuth roles={["staff"]} departments={["childrenward", "femaleward", "maleward", "malevip", "femalevip", "general"]} />}>
              <Route index element={<WardsRedirect />} />
            </Route>
            <Route element={<RequireAuth roles={["staff"]} departments={["childrenward", "general"]} />}>
              <Route path="children" element={<ChildrenWard />} />
            </Route>
            <Route element={<RequireAuth roles={["staff"]} departments={["femaleward", "general"]} />}>
              <Route path="female" element={<FemaleWard />} />
            </Route>
            <Route element={<RequireAuth roles={["staff"]} departments={["maleward", "general"]} />}>
              <Route path="male" element={<MaleWard />} />
            </Route>
            <Route element={<RequireAuth roles={["staff"]} departments={["femalevip", "general"]} />}>
              <Route path="female-vip" element={<FemaleVIP />} />
            </Route>
            <Route element={<RequireAuth roles={["staff"]} departments={["malevip", "general"]} />}>
              <Route path="male-vip" element={<MaleVIP />} />
            </Route>
          </Route>


          {/* Patients Registery */}
          <Route path='recordings'>
            <Route index element={<RecordingDashboard />} />
            <Route path="patients-registry" element={<PatientsRegistry />} />
            <Route path="patients/new" element={<PatientsBiodataPage />} />
            <Route path="edit/:id" element={<PatientsEditPage />} />
            <Route path="doctor-reports/:patientId" element={<DoctorsReportTable />} />
            <Route path="staff/:id" element={<RecordingProfile />} />
          </Route>

          {/* Settings */}
          <Route element={<RequireAuth />}>
            <Route path='settings'>
              <Route index element={<UserSettings />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* All Unprotected Route */}
      <Route path='login' element={<Login />} />
      <Route path='invite/accept' element={<AcceptInvite />} />
    </Route>
  )
);

const queryClient = new QueryClient();

ReactDom.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GlobalErrorBoundary>
          <GlobalClientLogging />
          <GlobalRealtimeSync />
          <Toaster position="top-right" richColors />
          <SearchProvider>
            <RouterProvider router={router}/>
          </SearchProvider>
        </GlobalErrorBoundary>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)
