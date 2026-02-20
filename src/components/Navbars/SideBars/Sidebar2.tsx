// import React from "react";
// import { Drawer, Box } from "@mui/material";
// import type { SidebarProps } from "../../../types/types";

// import SuperAdminSideBar from "./SuperAdminSideBar";
// import DoctorsSidebar from "./DoctorsSidebar";
// import NursesSidebar from "./NursesSidebar";
// import PatientsSidebar from "./PatientsSidebar";

// /**
//  * Strict role definition
//  */
// export type UserRole = "super_admin" | "doctor" | "nurse" | "patient";

// /**
//  * Runtime validation guard
//  */
// const allowedRoles: UserRole[] = ["super_admin", "doctor", "nurse", "patient"];

// const validateRole = (role: string): UserRole => {
//   if (allowedRoles.includes(role as UserRole)) {
//     return role as UserRole;
//   }
//   console.warn("Invalid role supplied to Sidebar:", role);
//   return "patient"; // safe fallback
// };

// /**
//  * Sidebar renderer
//  * Ensures only one sidebar mounts at a time
//  */
// const renderSidebarByRole = (
//   role: UserRole,
//   handleDrawerToggle: () => void
// ) => {
//   switch (role) {
//     case "super_admin":
//       return <SuperAdminSideBar handleDrawerToggle={handleDrawerToggle} />;

//     case "doctor":
//       return <DoctorsSidebar />;

//     case "nurse":
//       return <NursesSidebar />;

//     case "patient":
//       return <PatientsSidebar />;

//     default:
//       return null;
//   }
// };

// const Sidebar2: React.FC<SidebarProps> = ({
//   mobileOpen,
//   handleDrawerToggle,
//   isMobile,
//   isTablet,
//   role,
// }) => {
//   const drawerWidth = 272;

//   /**
//    * Validate role before render
//    */
//   const safeRole = validateRole(role);

//   /**
//    * Render correct sidebar
//    */
//   const drawerContent = renderSidebarByRole(safeRole, handleDrawerToggle);

//   return (
//     <Box component="nav" className="nav">
//       {/* Mobile / Tablet Drawer */}
//       <Drawer
//         variant={isMobile || isTablet ? "temporary" : "permanent"}
//         open={isMobile || isTablet ? mobileOpen : true}
//         onClose={handleDrawerToggle}
//         sx={{
//           display: { xs: "block", sm: "block", md: "block", lg: "block" },
//           "& .MuiDrawer-paper": {
//             boxSizing: "border-box",
//             width: drawerWidth,
//             backgroundColor: "white",
//             borderRight: "1px solid #d1d5db",
//           },
//         }}
//       >
//         {drawerContent}
//       </Drawer>

//       {/* Desktop Permanent Drawer */}
//       {!isMobile && !isTablet && (
//         <Drawer
//           variant="permanent"
//           open
//           sx={{
//             display: { xs: "none", sm: "none", md: "block", lg: "block" },
//             "& .MuiDrawer-paper": {
//               boxSizing: "border-box",
//               width: drawerWidth,
//               backgroundColor: "#fff",
//               borderRight: "1px solid #d1d5db",
//             },
//           }}
//         >
//           {drawerContent}
//         </Drawer>
//       )}
//     </Box>
//   );
// };

// export default Sidebar2;
