import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Chip,
  useMediaQuery,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdPersonAdd,
  MdGroup,
  MdImage,
  MdPhotoLibrary,
  MdSettings,
  MdAnalytics,
  MdMenu,
  MdChevronLeft,
  MdLightMode,
  MdDarkMode,
  MdLogout,
  MdAccountCircle,
  MdPalette,
  MdBrush
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import AuthModal from '../components/Auth/AuthModal';
import RowGramIcon from '../assets/RowGramIcon.png';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 64;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
  badge?: string | number;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <MdDashboard size={24} />,
    path: '/'
  },
  {
    id: 'create',
    label: 'Create Crew',
    icon: <MdPersonAdd size={24} />,
    path: '/create'
  },
  {
    id: 'crews',
    label: 'My Crews',
    icon: <MdGroup size={24} />,
    path: '/crews'
  },
  {
    id: 'template-customizer',
    label: 'Template Builder',
    icon: <MdBrush size={24} />,
    path: '/template-builder'
  },
  {
    id: 'generate',
    label: 'Generate Images',
    icon: <MdImage size={24} />,
    path: '/generate'
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: <MdPhotoLibrary size={24} />,
    path: '/gallery'
  },
  {
    id: 'club-presets',
    label: 'Club Presets',
    icon: <MdPalette size={24} />,
    path: '/club-presets'
  }
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const theme = useTheme();
  const { isDarkMode, toggleDarkMode } = useAppTheme();
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onToggle();
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  const handleProfileSettings = () => {
    navigate('/settings');
    handleUserMenuClose();
    if (isMobile) {
      onToggle();
    }
  };

  const handleAnalytics = () => {
    navigate('/analytics');
    handleUserMenuClose();
    if (isMobile) {
      onToggle();
    }
  };

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        {open ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img 
              src={RowGramIcon} 
              alt="RowGram Logo" 
              style={{ width: 32, height: 32 }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                letterSpacing: '0.5px'
              }}
            >
              RowGram
            </Typography>
          </Box>
        ) : (
          <img 
            src={RowGramIcon} 
            alt="RowGram Logo" 
            style={{ width: 32, height: 32 }}
          />
        )}
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          {open ? <MdChevronLeft size={20} /> : <MdMenu size={20} />}
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 1, py: 2 }}>
          {navigationItems.map((item) => {
            // Hide admin-only items for non-admin users
            if (item.adminOnly && !isAdmin()) {
              return null;
            }

            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    px: open ? 2 : 1.5,
                    py: 1.5,
                    backgroundColor: isActive
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(125, 179, 211, 0.2)'
                        : '#f0f7ff'
                      : 'transparent',
                    borderLeft: isActive
                      ? `3px solid ${theme.palette.primary.main}`
                      : '3px solid transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(125, 179, 211, 0.1)'
                        : '#f0f7ff'
                    },
                    transition: 'all 0.2s ease',
                    justifyContent: open ? 'flex-start' : 'center'
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                      minWidth: open ? 40 : 'auto',
                      mr: open ? 0 : 0
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.95rem',
                          fontWeight: isActive ? 600 : 500,
                          color: isActive
                            ? theme.palette.primary.main
                            : theme.palette.text.primary
                        }
                      }}
                    />
                  )}
                  {open && item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        backgroundColor: theme.palette.primary.main,
                        color: 'white'
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* Theme Toggle */}
      <Box sx={{ p: 1 }}>
        <ListItemButton
          onClick={toggleDarkMode}
          sx={{
            borderRadius: 2,
            mx: 1,
            px: open ? 2 : 1.5,
            py: 1.5,
            justifyContent: open ? 'flex-start' : 'center'
          }}
        >
          <ListItemIcon
            sx={{
              color: theme.palette.text.secondary,
              minWidth: open ? 40 : 'auto',
              mr: open ? 0 : 0
            }}
          >
            {isDarkMode ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
          </ListItemIcon>
          {open && (
            <ListItemText
              primary={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: theme.palette.text.primary
                }
              }}
            />
          )}
        </ListItemButton>
      </Box>

      {/* User Profile or Login */}
      <Divider />
      {user ? (
        <>
          <Box
            component="button"
            onClick={handleUserMenuOpen}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: open ? 2 : 0,
              justifyContent: open ? 'flex-start' : 'center',
              width: '100%',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <Avatar
              src={user.profile_picture}
              alt={user.name}
              sx={{
                width: 36,
                height: 36,
                border: `2px solid ${theme.palette.divider}`
              }}
            >
              {user.name?.charAt(0)}
            </Avatar>
            {open && (
              <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* User Menu */}
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: theme.shadows[8],
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }
            }}
          >
            <MenuItem onClick={handleProfileSettings}>
              <ListItemIcon>
                <MdAccountCircle size={20} />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            {isAdmin() && (
              <MenuItem onClick={handleAnalytics}>
                <ListItemIcon>
                  <MdAnalytics size={20} />
                </ListItemIcon>
                <ListItemText primary="Analytics" />
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
              <ListItemIcon>
                <MdLogout size={20} color={theme.palette.error.main} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Box sx={{ p: 1 }}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              px: open ? 2 : 1,
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: open ? '0.9rem' : '0.8rem',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
            onClick={() => setShowAuthModal(true)}
          >
            {open ? 'Sign In' : 'Sign In'}
          </Button>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <Drawer
          variant="temporary"
          open={open}
          onClose={onToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box'
            }
          }}
        >
          {sidebarContent}
        </Drawer>
        
        <AuthModal 
          open={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            }),
            overflowX: 'hidden'
          }
        }}
      >
        {sidebarContent}
      </Drawer>
      
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Sidebar;