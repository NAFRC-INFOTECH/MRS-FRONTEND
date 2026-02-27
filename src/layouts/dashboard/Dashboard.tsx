import { Outlet } from "react-router-dom";
import { useState } from "react";
import { CssBaseline, AppBar, Toolbar, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import TopRightNavbar from "@/components/Navbars/TopBars/TopRightNavBar";
import Sidebar from "@/components/Navbars/SideBars/Sidebar";

function Dashboard() {
    const [navWidth, setNavWidth] = useState(272); // Default sidebar width
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)');
    const isTablet = useMediaQuery('(max-width:960px)');

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavWidthChange = (newWidth: number) => {
        setNavWidth(newWidth);
    };

    // const user = "doctor" as UserRole;

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <CssBaseline />
            
            {/* AppBar */}
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1, 
                    backgroundColor: 'white !important',
                    color: 'black',
                    backdropFilter: 'blur(30px)', // Adding blur effect to the background
                    boxShadow: 'none',
                    width: `calc(100% - ${!(isMobile || isTablet) ? navWidth : 0}px)`,
                    ml: `${!(isMobile || isTablet) ? navWidth : 0}px`,
                    transition: (theme) => theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
                className="shadow-lg lg:shadow-none lg:border-b lg:border-b-[#d1d5db]"
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {(isMobile || isTablet) && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 1 }}
                            >
                                {mobileOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                            </IconButton>
                        )}
                        {/* <Typography variant="h6" noWrap component="div">
                            Hello World
                        </Typography> */}
                    </Box>
                    <TopRightNavbar />
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Sidebar 
                mobileOpen={mobileOpen} 
                handleDrawerToggle={handleDrawerToggle} 
                isMobile={isMobile} 
                isTablet={isTablet}
                onWidthChange={handleNavWidthChange}
                navWidth={navWidth}
                // role={user?.role ?? "patient"}
            />

            {/* Main Content Area */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    width: `calc(100vw - ${!(isMobile || isTablet) ? navWidth : 0}px)`,
                    ml: `${!(isMobile || isTablet) ? navWidth : 0}px`,
                    transition: (theme) => theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflow: 'auto'
                }}
                className="pt-[64px] md:pt-[85px] px-3 md:pl-6 md:pr-9 w-full no-scrollbar" // AppBar height
            >
                <Outlet />
            </Box>
        </Box>
    );
}

export default Dashboard;