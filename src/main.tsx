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
  RecordingDashboard,
  RecordingProfile,
  PatientsInQueue,
  AllDepartments,
  PatientsBiodataPage,
  PatientsEditPage,
  LabDashboard,
  NursesDailyShift,
  DoctorsDailyShift,
  AddVitalsSigns,
  NurseGeneral,
  PatientMedicalHistory,
  TodaysPatientsList,
  TodayTransferredList,
  LabPatientsList,
  Admins,
  AdminDashboard,
} from './App'
import { SearchProvider } from './contexts/SearchContext';




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
              <Route path='nurses' element={<Nurses />} />
              <Route path='doctors' element={<Doctors />} />
              <Route path='doctors/:id' element={<DoctorProfile />} />
              <Route path='patients' element={<Patients />} />
              <Route path='service-users' element={<ServiceUsers />} />
              <Route path='recordings' element={<Recordings />} />
              <Route path='all-departments' element={<AllDepartments />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<RequireAuth roles={["admin"]} />}>
            <Route path='admin-dashboard'>
              <Route index element={<AdminDashboard />} />
              <Route path='all-departments' element={<AllDepartments />} />
              <Route path='doctors' element={<Doctors />} />
              <Route path='doctors/:id' element={<DoctorProfile />} />
              <Route path='nurses' element={<Nurses />} />
              <Route path='patients' element={<Patients />} />
              <Route path='recordings' element={<Recordings />} />
              <Route path='service-users' element={<ServiceUsers />} />
              <Route path='nurses-duty' element={<NursesDailyShift />} />
              <Route path='doctors-duty' element={<DoctorsDailyShift />} />
              <Route path='recording-duty' element={<RecordingDashboard />} />
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

          {/* General Permit Routes */}
          <Route element={<RequireAuth roles={["nurse"]} departments={["general"]} />}>
            <Route path='general'>
              <Route index element={<NurseGeneral />} />
            </Route>
          </Route>

          {/* Nurses Dashboard */}
          <Route element={<RequireAuth roles={["nurse"]} departments={["GOPD", "general"]} />}>
            <Route path='gopd'>
              <Route index element={<GopdDashboard />} />
              <Route path="patients-in-queue" element={<PatientsInQueue />} />
              <Route path="add-vitals-signs/:patientId" element={<AddVitalsSigns />} />
            </Route>
          </Route>

          {/* Lab Dashboard */}
          <Route element={<RequireAuth roles={["nurse"]} departments={["lab", "general"]} />}>
            <Route path='lab'>
              <Route index element={<LabDashboard />} />
              <Route path="patient-list" element={<LabPatientsList />} />
            </Route>
          </Route>


          {/* Patients Registery */}
          <Route path='recordings'>
            <Route index element={<RecordingDashboard />} />
            <Route path="patients-registry" element={<PatientsRegistry />} />
            <Route path="patients/new" element={<PatientsBiodataPage />} />
            <Route path="edit/:id" element={<PatientsEditPage />} />
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
