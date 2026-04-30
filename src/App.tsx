import Root from './layouts/Root'
import MainLayout from './layouts/MainLayout'
import NotFoundPage from './layouts/NotFoundPage'
import Dashboard from './layouts/dashboard/Dashboard'
import SuperAdminDashboard from './Pages/superAdminPages/SuperAdminDashboard'
import Nurses from './Pages/superAdminPages/Nurses'
import Doctors from './Pages/superAdminPages/Doctors'
import Patients from './Pages/superAdminPages/Patients'
import Login from './Pages/auth/Login'
import MultiStepDoctorForm from './components/hiring-form/MultiStepDoctorForm'
import DoctorProfile from './Pages/superAdminPages/DoctorProfile'
import ServiceUsers from './Pages/superAdminPages/ServiceUsers'
import DoctorsDashboard from './Pages/doctorsPages/DoctorsDashboard'
import GopdDashboard from './Pages/departments/gopdPages/GopdDashboard'
import PatientsRegistry from './Pages/recordingdepartment/PatientsRegistry'
import UserSettings from './Pages/settings/UserSettings'
import Recordings from './Pages/superAdminPages/Recordings'
import RecordingDashboard from './Pages/recordingdepartment/RecordingDashboard'
import RecordingProfile from './Pages/superAdminPages/RecordingProfile'
import PatientsInQueue from './Pages/departments/gopdPages/PatientsInQueue'
import AllDepartments from './Pages/superAdminPages/AllDepartments'
import PatientsBiodataPage from "./Pages/recordingdepartment/PatientsBiodataPage";
import PatientsEditPage from "./Pages/recordingdepartment/PatientsEditPage";
import LabDashboard from "./Pages/departments/labPages/LabDashboard";
import LabPatientTestsPage from "./Pages/departments/labPages/LabPatientTestsPage";
import XrayDashboard from "./Pages/departments/X_rayPages/XrayDashboard";
import XrayPatientsList from "./Pages/departments/X_rayPages/XrayPatientsList";
import XrayPatientTestsPage from "./Pages/departments/X_rayPages/XrayPatientTestsPage";
import NursesDailyShift from "./Pages/adminPages/NursesDailyShift";
import DoctorsDailyShift from "./Pages/adminPages/DoctorsDailyShift";
import AddVitalsSigns from "./Pages/departments/gopdPages/AddVitalsSigns";
import NurseGeneral from "./Pages/generalPermitPages/NurseGeneral";
import PatientMedicalHistory from "./Pages/doctorsPages/PatientMedicalHistory";
import TodaysPatientsList from './Pages/doctorsPages/TodaysPatientsList';
import LabPatientsList from "./Pages/departments/labPages/LabPatientsList";
import TodayTransferredList from "./Pages/doctorsPages/todayTransferredPatientsList/TodayTransferredList";
import Admins from './Pages/superAdminPages/Admins'
import AdminDashboard from './Pages/adminPages/AdminDashboard'
import LandingPage from './Pages/LandingPage/LandingPage'
import RecordingDailyShift from './Pages/adminPages/RecordingDailyShift'




export {
  Root,
  MainLayout,
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
  LabPatientTestsPage,
  XrayDashboard,
  XrayPatientsList,
  XrayPatientTestsPage,
  NursesDailyShift,
  DoctorsDailyShift,
  AddVitalsSigns,
  NurseGeneral,
  PatientMedicalHistory,
  TodaysPatientsList,
  LabPatientsList,
  TodayTransferredList,
  Admins,
  AdminDashboard,
  RecordingDailyShift,
}
