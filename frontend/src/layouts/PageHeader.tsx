import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { MdMenu } from 'react-icons/md';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const getPageInfo = (pathname: string) => {
  const routes: Record<string, { title: string; subtitle?: string }> = {
    '/': {
      title: 'Dashboard',
      subtitle: 'Welcome to RowGram',
    },
    '/create': {
      title: 'Create New Crew',
      subtitle: 'Follow the steps below to create your crew lineup',
    },
    '/crews': {
      title: 'My Crews',
      subtitle: 'Manage your saved crew lineups',
    },
    '/generate': {
      title: 'Choose Template & Customize',
      subtitle: 'Choose a template and customize settings for your selected crews',
    },
    '/gallery': {
      title: 'Gallery',
      subtitle: 'Browse your generated images',
    },
    '/analytics': {
      title: 'Analytics',
      subtitle: 'Usage insights and statistics',
    },
    '/settings': {
      title: 'Settings',
      subtitle: 'Manage your preferences',
    },
    '/template-builder': {
      title: 'Template Builder',
      subtitle: 'Mix and match different components to create your perfect template',
    },
  };

  return routes[pathname] || { title: 'RowGram', subtitle: '' };
};

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  onMenuClick,
  showMenuButton = false,
}) => {
  const theme = useTheme();
  const location = useLocation();

  const pageInfo = getPageInfo(location.pathname);
  const displayTitle = title || pageInfo.title;
  const displaySubtitle = subtitle || pageInfo.subtitle;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        px: { xs: 2, sm: 3 },
        py: 2,
      }}
    >
      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
          {showMenuButton && (
            <IconButton
              onClick={onMenuClick}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <MdMenu size={24} />
            </IconButton>
          )}

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayTitle}
            </Typography>

            {displaySubtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                  fontSize: '1rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displaySubtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Header Actions */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
          }}
        >
          {actions}
        </Box>
      </Box>
    </Box>
  );
};

export default PageHeader;
