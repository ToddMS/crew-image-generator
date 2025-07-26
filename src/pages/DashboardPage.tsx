import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  MdPersonAdd,
  MdImage,
  MdGroup,
  MdPhotoLibrary,
  MdTrendingUp,
  MdHistory,
  MdChevronRight
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { ApiService } from '../services/api.service';
import OnboardingFlow from '../components/Onboarding/OnboardingFlow';
import { useOnboarding } from '../context/OnboardingContext';

interface DashboardStats {
  totalCrews: number;
  totalImages: number;
  recentActivity: Array<{
    id: string;
    type: 'crew_created' | 'image_generated' | 'crew_updated';
    title: string;
    subtitle: string;
    timestamp: Date;
    icon: React.ReactNode;
  }>;
}

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEventsByType } = useAnalytics();
  const { shouldShowOnboarding, completeOnboarding } = useOnboarding();
  const [stats, setStats] = useState<DashboardStats>({
    totalCrews: 0,
    totalImages: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Load crews
      const crewsResponse = await ApiService.getCrews();
      const crews = crewsResponse.data || [];

      // Load images count
      let totalImages = 0;
      for (const crew of crews) {
        try {
          const imagesResponse = await ApiService.getSavedImages(crew.id);
          if (imagesResponse.data) {
            totalImages += imagesResponse.data.length;
          }
        } catch (imageError) {
          console.error(`Error loading images for crew ${crew.id}:`, imageError);
        }
      }

      // Get recent activity from analytics
      const recentCrews = getEventsByType('crew_created').slice(0, 3);
      const recentImages = getEventsByType('image_generated').slice(0, 3);
      
      const recentActivity = [
        ...recentCrews.map(event => ({
          id: `crew_${event.timestamp}`,
          type: 'crew_created' as const,
          title: `New crew created`,
          subtitle: `${event.metadata?.clubName || 'Unknown Club'} - ${event.metadata?.boatClass || 'Unknown Class'}`,
          timestamp: new Date(event.timestamp),
          icon: <MdGroup size={20} />
        })),
        ...recentImages.map(event => ({
          id: `image_${event.timestamp}`,
          type: 'image_generated' as const,
          title: `Image generated`,
          subtitle: `${event.metadata?.crewName || 'Unknown Crew'} - Template ${event.metadata?.template || '1'}`,
          timestamp: new Date(event.timestamp),
          icon: <MdImage size={20} />
        }))
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

      setStats({
        totalCrews: crews.length,
        totalImages,
        recentActivity
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    completeOnboarding();
    // Navigate to create crew page after onboarding
    setTimeout(() => {
      navigate('/create');
    }, 500);
  };

  const quickActions = [
    {
      title: 'Create New Crew',
      description: 'Start building a new crew lineup',
      icon: <MdPersonAdd size={24} />,
      color: theme.palette.primary.main,
      action: () => navigate('/create')
    },
    {
      title: 'Generate Images',
      description: 'Create lineup images for your crews',
      icon: <MdImage size={24} />,
      color: theme.palette.success.main,
      action: () => navigate('/generate')
    },
    {
      title: 'Browse Gallery',
      description: 'View your generated images',
      icon: <MdPhotoLibrary size={24} />,
      color: theme.palette.info.main,
      action: () => navigate('/gallery')
    },
    {
      title: 'Manage Crews',
      description: 'Edit and organize your crews',
      icon: <MdGroup size={24} />,
      color: theme.palette.warning.main,
      action: () => navigate('/crews')
    }
  ];

  const statCards = [
    {
      title: 'Total Crews',
      value: stats.totalCrews,
      icon: <MdGroup size={32} />,
      color: theme.palette.primary.main,
      action: () => navigate('/crews')
    },
    {
      title: 'Generated Images',
      value: stats.totalImages,
      icon: <MdPhotoLibrary size={32} />,
      color: theme.palette.success.main,
      action: () => navigate('/gallery')
    }
  ];

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          px: 3
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          Welcome to RowGram
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
          Sign in to start creating crew lineups and generating images
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user.profile_picture}
            alt={user.name}
            sx={{ width: 56, height: 56 }}
          >
            {user.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Welcome back, {user.name?.split(' ')[0]}!
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Ready to create some amazing crew lineups?
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statCards.map((stat, index) => (
              <Grid item xs={6} key={index}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                  onClick={stat.action}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                        p: 1.5,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {stat.title}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          backgroundColor: `${action.color}08`,
                          borderColor: action.color,
                          transform: 'translateY(-1px)'
                        }
                      }}
                      onClick={action.action}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            backgroundColor: `${action.color}20`,
                            color: action.color,
                            p: 1,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {action.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {action.description}
                          </Typography>
                        </Box>
                        <MdChevronRight size={20} color={theme.palette.text.secondary} />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                <MdHistory size={20} color={theme.palette.text.secondary} />
              </Box>
              
              {stats.recentActivity.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    No recent activity yet
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Start creating crews to see activity here
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {stats.recentActivity.map((activity, index) => (
                    <ListItem key={activity.id} sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            backgroundColor: theme.palette.primary.main + '20',
                            color: theme.palette.primary.main,
                            p: 0.5,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {activity.icon}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.subtitle}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          color: theme.palette.text.secondary
                        }}
                      />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {activity.timestamp.toLocaleDateString()}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Onboarding Flow */}
      <OnboardingFlow
        open={shouldShowOnboarding}
        onClose={() => completeOnboarding()}
        onComplete={handleOnboardingComplete}
      />
    </Box>
  );
};

export default DashboardPage;