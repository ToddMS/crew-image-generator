import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RowGramIcon from '../../assets/RowGramIcon.png';

interface FooterComponentProps {
  scrollToSection: (sectionId: string) => void;
}

const FooterComponent: React.FC<FooterComponentProps> = ({ scrollToSection }) => {
  const theme = useTheme();
  
  return (
    <Box 
      component="footer" 
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
        borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0'}`,
        marginTop: '60px',
        padding: '40px 20px 20px',
      }}
    >
      <Box sx={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' },
        gap: { xs: 3, md: 5 },
      }}>
        {/* RowGram Brand */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <img 
              src={RowGramIcon} 
              alt="RowGram Logo" 
              style={{ width: 40, height: 40, marginRight: 12 }}
            />
            <Typography 
              variant="h5" 
              component="h3" 
              sx={{ 
                margin: 0, 
                color: theme.palette.text.primary, 
                fontWeight: 600 
              }}
            >
              RowGram
            </Typography>
          </Box>
          <Typography 
            sx={{ 
              color: theme.palette.text.secondary, 
              fontSize: 16, 
              lineHeight: 1.5, 
              margin: 0, 
              maxWidth: 280 
            }}
          >
            Create stunning Instagram posts for your rowing achievements
          </Typography>
        </Box>

        {/* Quick Links */}
        <Box>
          <Typography 
            variant="h6" 
            component="h4" 
            sx={{ 
              color: theme.palette.text.primary, 
              fontWeight: 600, 
              mb: 2, 
              mt: 0 
            }}
          >
            Quick Links
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { label: 'Home', section: 'home' },
              { label: 'Templates', section: 'crew-form' },
              { label: 'My Crews', section: 'saved-crews' },
              { label: 'Help Center', section: 'help' },
            ].map((link) => (
              <Box key={link.section} component="li" sx={{ mb: 1 }}>
                <Button 
                  onClick={() => scrollToSection(link.section)}
                  sx={{
                    background: 'none',
                    border: 'none',
                    color: theme.palette.text.secondary,
                    fontSize: 16,
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    textTransform: 'none',
                    minWidth: 'auto',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  {link.label}
                </Button>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Legal */}
        <Box>
          <Typography 
            variant="h6" 
            component="h4" 
            sx={{ 
              color: theme.palette.text.primary, 
              fontWeight: 600, 
              mb: 2, 
              mt: 0 
            }}
          >
            Legal
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((item) => (
              <Box key={item} component="li" sx={{ mb: 1 }}>
                <Typography 
                  sx={{ 
                    color: theme.palette.text.secondary, 
                    fontSize: 16, 
                    cursor: 'not-allowed' 
                  }}
                >
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Contact */}
        <Box>
          <Typography 
            variant="h6" 
            component="h4" 
            sx={{ 
              color: theme.palette.text.primary, 
              fontWeight: 600, 
              mb: 2, 
              mt: 0 
            }}
          >
            Contact
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography 
                component="a" 
                href="mailto:support@rowgram.com" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  fontSize: 16, 
                  textDecoration: 'none', 
                  '&:hover': { 
                    color: theme.palette.primary.main 
                  } 
                }}
              >
                support@rowgram.com
              </Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography 
                component="a" 
                href="tel:+15551234567" 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  fontSize: 16, 
                  textDecoration: 'none', 
                  '&:hover': { 
                    color: theme.palette.primary.main 
                  } 
                }}
              >
                +1 (555) 123-4567
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Copyright */}
      <Box sx={{
        borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#333333' : '#e0e0e0'}`,
        marginTop: '40px',
        paddingTop: '20px',
        textAlign: 'center',
      }}>
        <Typography 
          sx={{ 
            color: theme.palette.text.secondary, 
            fontSize: 14, 
            margin: 0 
          }}
        >
          © 2024 RowGram. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default FooterComponent;