import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  IconButton,
  Switch,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ProfileModal from '../Profile/ProfileModal';

interface User {
  id: number;
  email: string;
  name: string;
  profile_picture?: string;
  club_name?: string;
}

interface UserProfileDropdownProps {
  user: User;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user }) => {
  const { logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar sx={{ width: 32, height: 32 }} src={user.profile_picture} alt={user.name}>
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 24,
              height: 24,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          {user.club_name && (
            <Typography variant="body2" color="text.secondary">
              {user.club_name}
            </Typography>
          )}
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            setShowProfileModal(true);
            handleClose();
          }}
        >
          <Avatar sx={{ bgcolor: '#5E98C2' }}>
            <SettingsIcon />
          </Avatar>
          Profile & Settings
        </MenuItem>

        <MenuItem
          onClick={(e) => e.stopPropagation()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isDarkMode ? <Brightness4 /> : <Brightness7 />}
            <Typography>Dark Mode</Typography>
          </Box>
          <Switch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#7DB3D3',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#7DB3D3',
              },
            }}
          />
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <Avatar sx={{ bgcolor: '#f44336' }}>
            <LogoutIcon />
          </Avatar>
          Logout
        </MenuItem>
      </Menu>

      {/* Profile Modal */}
      <ProfileModal open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
};

export default UserProfileDropdown;
