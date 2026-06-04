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
import Radiology from './Pages/superAdminPages/Radiology'
import Clinical from './Pages/superAdminPages/Clinical'
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
import AddVitalsSigns from "./Pages/departments/gopdPages/AddVitalsSigns";
import NurseGeneral from "./Pages/generalPermitPages/NurseGeneral";
import PatientMedicalHistory from "./Pages/doctorsPages/PatientMedicalHistory";
import TodaysPatientsList from './Pages/doctorsPages/TodaysPatientsList';
import LabPatientsList from "./Pages/departments/labPages/LabPatientsList";
import TodayTransferredList from "./Pages/doctorsPages/todayTransferredPatientsList/TodayTransferredList";
import Admins from './Pages/superAdminPages/Admins'
import AdminDashboard from './Pages/adminPages/AdminDashboard'
import CreatePriceList from './Pages/adminPages/createPriceListsPage/CreatePriceList'
import LandingPage from './Pages/LandingPage/LandingPage'
import AuditLog from './Pages/superAdminPages/AuditLog'
import NHIADashboard from './Pages/departments/nhiaPages/NHIADashboard'
import NHIAPatientsList from './Pages/departments/nhiaPages/NHIAPatientsList'
import NHIAInvoicesList from './Pages/departments/nhiaPages/NHIAInvoicesList'
import PaypointDashboard from './Pages/departments/paypointPages/PaypointDashboard'
import PaypointPatientsList from './Pages/departments/paypointPages/PaypointPatientsList'
import PharmacyDashboard from './Pages/departments/pharmacyPages/PharmacyDashboard'
import ReferredPatientsList from './Pages/departments/pharmacyPages/ReferredPatientsList'
import ViewPrescription from './Pages/departments/pharmacyPages/ViewPrescription'
import DoctorsReportTable from './Pages/recordingdepartment/DoctorsReportTable'
import EarDoctorDashboard from './Pages/clinical/EarDoctorPage/EarDoctorDashboard'
import EarPatientsTable from './Pages/clinical/EarDoctorPage/EarPatientsTable'
import EyeDoctorDashboard from './Pages/clinical/EyeDoctorPage/EyeDoctorDashboard'
import EyePatientsTable from './Pages/clinical/EyeDoctorPage/EyePatientsTable'
import DailyShifts from './Pages/adminPages/DailyShifts'
import ChildrenWard from './Pages/departments/wards/ChildrenWard'
import FemaleWard from './Pages/departments/wards/FemaleWard'
import MaleWard from './Pages/departments/wards/MaleWard'
import MaleVIP from './Pages/departments/wards/MaleVIP'
import FemaleVIP from './Pages/departments/wards/FemaleVIP'
import WardsRedirect from './Pages/departments/wards/WardsRedirect'
import AntenatalPatients from './Pages/departments/Antenatal/AntenatalPatients'
import WardPatients from './Pages/adminPages/wardPatients/WardPatients'




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
  LabPatientsList,
  TodayTransferredList,
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
  WardPatients,
}
