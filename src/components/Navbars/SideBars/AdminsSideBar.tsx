import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import {
  Calendar,
  BedDouble,
  ContactRound,
  FolderOpen,
  LayoutPanelLeft,
  LibraryBig,
  Network,
  ShieldUser,
  ClipboardList,
  ReceiptText,
  Stethoscope,
  ScanLine,
} from "lucide-react"
import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"

export default function AdminsSideBar() {
  const location = useLocation()

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
        color={active ? "#ffffff" : "#9e9e9edc"}
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
      <div className="h-[68vh] md:h-[70vh] lg:h-[75vh] overflow-y-scroll w-full">
        <List>
          <span className="block text-start text-xs text-gray-500 pl-4 mb-2">
            MAIN
          </span>

          {[
            { text: "Admin Dashboard", path: "/admin-dashboard", icon: LayoutPanelLeft },
            { text: "All Departments", path: "/admin-dashboard/all-departments", icon: Network },
            { text: "All Patients", path: "/admin-dashboard/patients", icon: ContactRound },
            { text: "Clinical", path: "/admin-dashboard/clinical", icon: Stethoscope },
            { text: "Daily Duties", path: "/admin-dashboard/daily-duty", icon: ClipboardList },
            { text: "Doctors", path: "/admin-dashboard/doctors", icon: FolderOpen },
            { text: "Price List", path: "/admin-dashboard/price-list", icon: ReceiptText },
            { text: "Ward Patients", path: "/admin-dashboard/ward-patients", icon: BedDouble },
            { text: "Radiology", path: "/admin-dashboard/radiology", icon: ScanLine },
            { text: "Recordings", path: "/admin-dashboard/recordings", icon: LibraryBig },
            { text: "Service Users", path: "/admin-dashboard/service-users", icon: ShieldUser },
            { text: "Staffs", path: "/admin-dashboard/staffs", icon: Calendar },
            // { text: "Audit Log", path: "/admin-dashboard/audit-log", icon: BookOpenCheck },
          ].map((item) => {
            const active = isRouteActive(item.path)

            return (
              <ListItemButton
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  background: active ? "#56bbe3" : "transparent",
                  color: active ? "#ffffff" : "#9e9e9edc",
                  borderTopRightRadius: "8px",
                  borderBottomRightRadius: "8px",
                  my: 0.5,
                  ":hover": {
                    background: active ? "#56bbe3" : "#c9c9c91e",
                    color: active ? "#ffffff" : "#9e9e9edc",
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
      </div>
    </section>
  )
}
