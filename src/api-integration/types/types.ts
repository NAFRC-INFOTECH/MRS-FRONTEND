export interface SidebarProps {
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
    isMobile: boolean;
    isTablet: boolean;
    onWidthChange?: (newWidth: number) => void;
    navWidth?: number;
    // role: UserRole;
}

export type Role = "super_admin" | "doctor" | "nurse" | "recording";

export type UserRole = {
  roles?: Role[];
};

