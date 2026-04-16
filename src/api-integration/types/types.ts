export interface SidebarProps {
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
    isMobile: boolean;
    isTablet: boolean;
    onWidthChange?: (newWidth: number) => void;
    navWidth?: number;
    // role: UserRole;
}

export type Role = "super_admin" | "admin" | "doctor" | "nurse" | "recording";
export type Department = {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserRole = {
  roles?: Role[];
  department?: Department;
};

