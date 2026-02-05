import UserProfile from "@/components/settings/UserProfile"
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import {
  Calendar,
  ContactRound,
  FolderOpen,
  LayoutPanelLeft,
  Pill,
  ShieldUser,
} from "lucide-react"
import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"

export default function SuperAdminSideBar({
  handleDrawerToggle,
}: {
  handleDrawerToggle: () => void
}) {
  const location = useLocation()

  /** Reusable route active checker */
  const isRouteActive = (path: string) => location.pathname === path

  const IconWrapper = ({
    Icon,
    active,
  }: {
    Icon: React.ElementType
    active: boolean
  }) => {
    return (
      <Icon
        size={20}
        variant="Outline"
        color={active ? "#56bbe3" : "#6B7280"}
      />
    )
  }

  const getMillisecondsUntilMidnight = () => {
    const now = new Date()
    const midnight = new Date()
    midnight.setHours(24, 0, 0, 0)
    return midnight.getTime() - now.getTime()
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload()
    }, getMillisecondsUntilMidnight())

    return () => clearTimeout(timer)
  }, [])

  return (
    <Box
      onClick={handleDrawerToggle}
      sx={{ textAlign: "center", backgroundColor: "transparent" }}
      className="drawer-container px-4 pt-[4rem] md:pt-[5.5rem] lg:py-3 flex flex-col gap-2 bg-[rgba(10,10,73,0.2)] overflow-auto scrollbar-hide h-full"
    >
      {/* Header */}
      <List>
        <div className="flex items-center gap-3">
          <div className="w-[44px] h-[44px] bg-blue-500 rounded-full flex items-center justify-center">
            <img src="Svgs/Shazam.svg" alt="Logo" />
          </div>
          <div className="flex flex-col text-start">
            <span className="text-xs text-gray-500">ADMIN PORTAL</span>
            <h2 className="text-sm font-semibold">DHML-MRS</h2>
          </div>
        </div>
      </List>

      <div className="w-full h-[1px] bg-gray-300 my-1 lg:my-2" />

      {/* MAIN */}
      <List>
        <span className="block text-start text-xs text-gray-500 pl-4 mb-2">
          MAIN
        </span>

        {[
          { text: "Dashboard", path: "/mrs-admin", icon: LayoutPanelLeft },
          { text: "Doctors", path: "/mrs-admin/doctors", icon: FolderOpen },
          { text: "Nurses", path: "/mrs-admin/nurses", icon: Calendar },
          { text: "Patients", path: "/mrs-admin/patients", icon: ContactRound },
          { text: "Service Users", path: "/mrs-admin/service-users", icon: ShieldUser },
        ].map((item) => {
          const active = isRouteActive(item.path)

          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                background: active ? "#f9f9f9" : "transparent",
                color: active ? "#56bbe3" : "#6B7280",
                borderRadius: "8px",
                my: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <IconWrapper Icon={item.icon} active={active} />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          )
        })}
      </List>

      <div className="w-full h-[1px] bg-gray-300 my-2" />

      {/* OTHER */}
      <List className="flex flex-1 flex-col justify-between h-full">
        <div className="w-full">
          <span className="block text-start text-xs text-gray-500 pl-4 mb-2 uppercase">
            Other
          </span>

          <ListItemButton
            component={Link}
            to="mrs-admin/drugs-list"
            sx={{
              borderRadius: "8px",
              background: isRouteActive("mrs-admin/drugs-list")
                ? "#f9f9f9"
                : "transparent",
              color: isRouteActive("mrs-admin/drugs-list")
                ? "#56bbe3"
                : "#6B7280",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Pill
                size={20}
                color={
                  isRouteActive("mrs-admin/settings") ? "#56bbe3" : "#6B7280"
                }
              />
            </ListItemIcon>
            <ListItemText primary="Drugs List" />
          </ListItemButton>
        </div>

        {/* Profile */}
        <UserProfile className="flex" textSize="text-xs" />
      </List>
    </Box>
  )
}
