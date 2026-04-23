import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ContactRound,
  LayoutPanelLeft,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function XraySidebar() {
  const location = useLocation();

  // ✅ Define routes
  const routes = [
    {
      text: "Dashboard",
      path: "/xray",
      icon: LayoutPanelLeft,
    },
    {
      text: "Patient List",
      path: "/xray/patient-list",
      icon: ContactRound,
    },
  ];

  // ✅ Get most specific (longest) matching path
  const getActivePath = (paths: string[]) => {
    return paths
      .filter(
        (path) =>
          location.pathname === path ||
          location.pathname.startsWith(path + "/")
      )
      .sort((a, b) => b.length - a.length)[0];
  };

  const activePath = getActivePath(routes.map((r) => r.path));

  // ✅ Icon wrapper
  const IconWrapper = ({
    Icon,
    active,
  }: {
    Icon: React.ElementType;
    active: boolean;
  }) => {
    return (
      <Icon
        size={20}
        color={active ? "#ffffff" : "#6B7280"}
      />
    );
  };

  // ✅ Midnight auto refresh
  const getMillisecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, getMillisecondsUntilMidnight());

    return () => clearTimeout(timer);
  }, []);

  return (
    <section>
      <List>
        <span className="block text-start text-xs text-gray-500 pl-4 mb-2">
          X-RAY
        </span>

        {routes.map((item) => {
          const active = item.path === activePath;

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
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <IconWrapper Icon={item.icon} active={active} />
              </ListItemIcon>

              <ListItemText primary={item.text} />
            </ListItemButton>
          );
        })}
      </List>
    </section>
  );
}