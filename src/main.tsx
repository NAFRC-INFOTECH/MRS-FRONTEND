import React from 'react';
import ReactDom from 'react-dom/client';
import './index.css'

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'


import {
  MainLayout,
  Root,
  NotFoundPage,
  Dashboard,
  SuperAdminDashboard,
  Nurses,
  Doctors,
  Patients
} from './App'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />} errorElement={<NotFoundPage />}>

      <Route index path='/' element={<SuperAdminDashboard />} />

      <Route element={<Dashboard />}>
        <Route element={<MainLayout />}>
          {/* this is super admin dashboard routes */}
          <Route path='mrs-admin'>
            <Route index element={<SuperAdminDashboard/>}/>
            <Route path='nurses' element={<Nurses />} />
            <Route path='doctors' element={<Doctors />} />
            <Route path='patients' element={<Patients />} />
          </Route>

        </Route>
      </Route>
    </Route>
  )
);

ReactDom.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
)