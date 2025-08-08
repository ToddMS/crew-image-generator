import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdMenu, MdChevronRight, MdArrowBack } from 'react-icons/md';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  showBreadcrumbs?: boolean;
}

const getPageInfo = (pathname: string) => {
  const routes: Record<string, { title: string; subtitle?: string }> = {
    '/': {
      title: 'Dashboard',
      subtitle: 'Welcome to RowGram'
    },
    '/create': {
      title: 'Create New Crew',
      subtitle: 'Follow the steps below to create your crew lineup'
    },
    '/crews': {
      title: 'My Crews',
      subtitle: 'Manage your saved crew lineups'
    },
    '/generate': {
      title: 'Generate Images',
      subtitle: 'Create crew lineup images'
    },
    '/gallery': {
      title: 'Gallery',
      subtitle: 'Browse your generated images'
    },
    '/analytics': {
      title: 'Analytics',
      subtitle: 'Usage insights and statistics'
    },
    '/settings': {
      title: 'Settings',
      subtitle: 'Manage your preferences'
    }
  };

  return routes[pathname] || { title: 'RowGram', subtitle: '' };
};

const getBreadcrumbs = (pathname: string) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Dashboard', path: '/' }];

  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const pageInfo = getPageInfo(currentPath);
    breadcrumbs.push({
      label: pageInfo.title,
      path: currentPath
    });
  });

  return breadcrumbs;
};

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  onMenuClick,
  showMenuButton = false,
  showBreadcrumbs = true
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(0);

  // Listen for step changes on create page
  React.useEffect(() => {
    if (location.pathname === '/create') {
      const updateStep = () => {
        const step = parseInt(sessionStorage.getItem('create_crew_step') || '0');
        setCurrentStep(step);
      };

      updateStep(); // Initial load
      
      // Listen for custom events
      window.addEventListener('step-changed', updateStep);
      return () => window.removeEventListener('step-changed', updateStep);
    }
  }, [location.pathname]);

  const pageInfo = getPageInfo(location.pathname);
  const displayTitle = title || pageInfo.title;
  const displaySubtitle = subtitle || pageInfo.subtitle;
  const breadcrumbs = getBreadcrumbs(location.pathname);

  const handleBreadcrumbClick = (path: string) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        px: { xs: 2, sm: 3 },
        py: 2
      }}
    >
      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbs.length > 1 && (
        <Breadcrumbs
          separator={<MdChevronRight size={16} />}
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            if (isLast) {
              return (
                <Typography
                  key={crumb.path}
                  variant="body2"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 500
                  }}
                >
                  {crumb.label}
                </Typography>
              );
            }
            
            return (
              <Link
                key={crumb.path}
                component="button"
                variant="body2"
                onClick={() => handleBreadcrumbClick(crumb.path)}
                sx={{
                  color: theme.palette.text.secondary,
                  textDecoration: 'none',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline'
                  }
                }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
          {showMenuButton && (
            <IconButton
              onClick={onMenuClick}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
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
                whiteSpace: 'nowrap'
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
                  whiteSpace: 'nowrap'
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
            flexShrink: 0
          }}
        >
          {/* Auto-add Back button for Create page */}
          {location.pathname === '/create' && (
            <Button
              variant="outlined"
              startIcon={<MdArrowBack />}
              onClick={() => {
                if (currentStep === 0) {
                  navigate('/');
                } else {
                  // Trigger step navigation by dispatching custom event
                  window.dispatchEvent(new CustomEvent('navigate-back-step'));
                }
              }}
            >
              {currentStep === 0 ? 'Dashboard' : 'Back'}
            </Button>
          )}
          {actions}
        </Box>
      </Box>
    </Box>
  );
};

export default PageHeader;