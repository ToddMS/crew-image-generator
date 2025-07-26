import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RowGramIcon from '../../assets/RowGramIcon.png';
import { TbHelp } from "react-icons/tb";
import { IoHomeOutline, IoPeopleOutline  } from "react-icons/io5";
import { MdPhotoLibrary, MdInsights } from "react-icons/md";
import { PiSquaresFourLight } from "react-icons/pi";
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';
import UserProfileDropdown from '../Auth/UserProfileDropdown';

interface HeaderComponentProps {
  onGalleryClick?: () => void;
  onAnalyticsClick?: () => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({ onGalleryClick, onAnalyticsClick }) => {
  const { user, isAdmin } = useAuth();
  const theme = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={1}
        sx={{ 
          backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f9f9f9',
          borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0'}`,
          color: theme.palette.text.primary
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
              src={RowGramIcon} 
              alt="RowGram Logo" 
              style={{ width: 50, height: 50 }}
            />
            <Typography 
              variant="h5" 
              component="h2"
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 500,
                mt: 0.5
              }}
            >
              RowGram
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IoHomeOutline size={18} />
              <Button 
                onClick={() => scrollToSection('home')}
                sx={{ 
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontSize: 18,
                  '&:hover': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline'
                  }
                }}
              >
                Home
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PiSquaresFourLight size={25} />
              <Button 
                onClick={() => scrollToSection('crew-form')}
                sx={{ 
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontSize: 18,
                  '&:hover': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline'
                  }
                }}
              >
                Templates
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IoPeopleOutline size={21} />
              <Button 
                onClick={() => scrollToSection('saved-crews')}
                sx={{ 
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontSize: 18,
                  '&:hover': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline'
                  }
                }}
              >
                My Crews
              </Button>
            </Box>

            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MdPhotoLibrary size={19} />
                <Button 
                  onClick={onGalleryClick}
                  sx={{ 
                    color: theme.palette.text.primary,
                    textTransform: 'none',
                    fontSize: 18,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Gallery
                </Button>
              </Box>
            )}

            {user && isAdmin() && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MdInsights size={19} />
                <Button 
                  onClick={onAnalyticsClick}
                  sx={{ 
                    color: theme.palette.text.primary,
                    textTransform: 'none',
                    fontSize: 18,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Analytics
                </Button>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TbHelp size={17} />
              <Button 
                onClick={() => scrollToSection('help')}
                sx={{ 
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontSize: 18,
                  '&:hover': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline'
                  }
                }}
              >
                Help
              </Button>
            </Box>
            
            {/* Authentication Section */}
            {user ? (
              <UserProfileDropdown user={user} />
            ) : (
              <Button 
                onClick={() => setShowAuthModal(true)} 
                variant="contained"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark || '#4a7da3',
                  }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default HeaderComponent;