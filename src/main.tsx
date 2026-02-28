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
  NursesDashboard,
  PatientsRegistry,
  UserSettings,
  Recordings,
  RecordingDashboard,
  RecordingProfile
} from './App'
import PatientsBiodataPage from "./components/patientsTable/PatientsBiodataPage";



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />} errorElement={<NotFoundPage />}>

      {/* <Route index path='/' element={<SuperAdminDashboard />} /> */}
      

      {/* All Protected Routes */}
      <Route element={<Dashboard />}>
        <Route element={<MainLayout />}>
          {/* this is super admin dashboard routes */}
          <Route element={<RequireAuth roles={["super_admin"]} />}>
            <Route path='mrs-admin'>
              <Route index element={<SuperAdminDashboard/>}/>
              <Route path='nurses' element={<Nurses />} />
              <Route path='doctors' element={<Doctors />} />
              <Route path='doctors/:id' element={<DoctorProfile />} />
              <Route path='patients' element={<Patients />} />
              <Route path='service-users' element={<ServiceUsers />} />
              <Route path='recordings' element={<Recordings />} />
            </Route>
          </Route>

          {/* Doctors Routes */}
          <Route element={<RequireAuth roles={["doctor"]} />}>
            <Route element={<RequireDoctorProfile />}>
              <Route path='doctors-dashboard'>
                <Route index element={<DoctorsDashboard />} />
              </Route>
            </Route>
          </Route>

          {/* Nurses Dashboard */}
          <Route element={<RequireAuth roles={["nurse"]} />}>
            <Route path='nurses-dashboard'>
              <Route index element={<NursesDashboard />} />
            </Route>
          </Route>


          {/* Patients Registery */}
          <Route path='recordings'>
            <Route index element={<RecordingDashboard />} />
            <Route path="patients-registry" element={<PatientsRegistry />} />
            <Route path="patients/new" element={<PatientsBiodataPage />} />
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
      {/* <Route path='signup' element={<SignUp />} /> */}
      <Route path='invite/accept' element={<AcceptInvite />} />
      <Route path='hiring-doctor-form' element={<MultiStepDoctorForm />} />
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
          <RouterProvider router={router}/>
        </GlobalErrorBoundary>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)
