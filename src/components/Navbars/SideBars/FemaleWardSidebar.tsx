import { List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { ContactRound, LayoutPanelLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function FemaleWardSidebar() {
  const location = useLocation();
  const isRouteActive = (path: string) => location.pathname === path;

  const IconWrapper = ({ Icon, active }: { Icon: React.ElementType; active: boolean }) => {
    return <Icon size={20} variant="Outline" color={active ? "#ffffff" : "#9e9e9edc"} />;
  };

  return (
    <section>
      <div className="h-[50vh] md:h-[60vh] overflow-y-scroll w-full">
        <List>
          <span className="block text-start text-xs text-gray-300 pl-4 mb-2">MAIN</span>
          {[
            { text: "Dashboard", path: "/wards", icon: LayoutPanelLeft },
            { text: "Patients", path: "/wards/female", icon: ContactRound },
          ].map((item) => {
            const active = isRouteActive(item.path);
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
      </div>
    </section>
  );
}
