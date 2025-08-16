import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Profile
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" py={2}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '2rem',
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>

          <Typography variant="h5" gutterBottom align="center">
            {user.name || 'User'}
          </Typography>

          <Typography variant="body1" color="text.secondary" gutterBottom align="center">
            {user.email}
          </Typography>

          {user.club_name && (
            <Typography variant="body2" color="text.secondary" align="center">
              {user.club_name}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Manage your club presets, colors, and logos in the dedicated{' '}
            <Typography component="span" color="primary" fontWeight="bold">
              Club Presets
            </Typography>{' '}
            section.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileModal;
