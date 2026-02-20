import {
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

export default function SuperAdminSideBar() {
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
        color={active ? "#ffffff" : "#6B7280"}
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
    <section>
      {/* MAIN */}
      <List>
        <span className="block text-start text-xs text-gray-500 pl-4 mb-2">
          MAIN
        </span>

        {[
          { text: "Dashboard", path: "/mrs-admin", icon: LayoutPanelLeft },
          { text: "Doctors", path: "/mrs-admin/doctors", icon: FolderOpen },
          { text: "Nurses", path: "/mrs-admin/nurses", icon: Calendar },
          { text: "All Patients", path: "/mrs-admin/patients", icon: ContactRound },
          { text: "Service Users", path: "/mrs-admin/service-users", icon: ShieldUser },
        ].map((item) => {
          const active = isRouteActive(item.path)

          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                background: active ? "#56bbe3" : "transparent",
                color: active ? "#ffffff" : "#6B7280",
                borderTopRightRadius: "8px",
                borderBottomRightRadius: "8px",
                my: 0.5,
                ":hover": {
                  background: active ? "#56bbe3" : "#c9c9c91e",
                  color: active ? "#ffffff" : "#6B7280",
                }
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
              borderTopRightRadius: "8px",
              borderBottomRightRadius: "8px",
              background: isRouteActive("mrs-admin/drugs-list")
                ? "#56bbe3"
                : "transparent",
              color: isRouteActive("mrs-admin/drugs-list")
                ? "#ffffff"
                : "#6B7280",
              ":hover": {
                background: isRouteActive("mrs-admin/drugs-list")
                  ? "#56bbe3"
                  : "#c9c9c91e",
                color: isRouteActive("mrs-admin/drugs-list")
                  ? "#ffffff"
                  : "#6B7280",
              }
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
        {/* <UserProfile className="flex" textSize="text-xs" /> */}
      </List>
    </section>
  )
}
