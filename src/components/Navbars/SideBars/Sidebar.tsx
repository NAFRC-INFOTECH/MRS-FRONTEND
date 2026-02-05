import { Drawer, Box } from '@mui/material';
import type { SidebarProps } from '../../../types/types';

import SuperAdminSideBar from './SuperAdminSideBar';

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, handleDrawerToggle, isMobile, isTablet }) => {
  const drawerWidth = 272;

  const drawer = (
      <SuperAdminSideBar handleDrawerToggle={handleDrawerToggle} />
  );

  return (
    <Box component="nav" className='nav'>
      <Drawer
        variant={(isMobile || isTablet) ? "temporary" : "permanent"}
        open={isMobile || isTablet ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'block', md: 'block', lg: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            backgroundColor: 'white', 
            borderRight: '1px solid #d1d5db' 
          },
        }}
      >
        {drawer}
      </Drawer>
      {!isMobile && !isTablet && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'none', md: 'block', lg: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              backgroundColor: '#fff', 
              borderRight: '1px solid #d1d5db' 
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;