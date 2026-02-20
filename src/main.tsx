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

import {
  MainLayout,
  Root,
  NotFoundPage,
  Dashboard,
  Login,
  SignUp,
  MultiStepDoctorForm,
  SuperAdminDashboard,
  Nurses,
  Doctors,
  DoctorProfile,
  Patients,
  ServiceUsers,
  DoctorsDashboard,
  NursesDashboard,
  PatientMain,
  PatientsRegistry,
  UserSettings
} from './App'


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
            </Route>
          </Route>

          {/* Doctors Routes */}
          <Route element={<RequireAuth roles={["doctor"]} />}>
            <Route path='doctors-dashboard'>
              <Route index element={<DoctorsDashboard />} />
            </Route>
          </Route>

          {/* Nurses Dashboard */}
          <Route element={<RequireAuth roles={["nurse"]} />}>
            <Route path='nurses-dashboard'>
              <Route index element={<NursesDashboard />} />
            </Route>
          </Route>

          {/* Patients dashboard */}
          <Route element={<RequireAuth roles={["patient"]} />}>
            <Route path='patient-main-profile'>
              <Route index element={<PatientMain />} />
            </Route>
          </Route>

          {/* Patients Registery */}
          <Route path='patients-registry'>
            <Route index element={<PatientsRegistry />} />
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
      <Route path='signup' element={<SignUp />} />
      <Route path='hiring-doctor-form' element={<MultiStepDoctorForm />} />
    </Route>
  )
);

const queryClient = new QueryClient();

ReactDom.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
)
