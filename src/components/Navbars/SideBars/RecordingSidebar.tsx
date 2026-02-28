// import React from 'react'

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import {
  ContactRound,
  LayoutPanelLeft,
} from "lucide-react"
import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"

export default function RecordingSideBar() {
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
          { text: "Dashboard", path: "/recordings", icon: LayoutPanelLeft },
          { text: "Patients List", path: "/recordings/patients-registry", icon: ContactRound },
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
    </section>
  )
}

