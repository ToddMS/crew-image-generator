import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import { MdDownload, MdDelete, MdInsights, MdSchedule, MdImage } from 'react-icons/md';
import { useAnalytics } from '../../context/AnalyticsContext';

const AnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const { getStats, exportData, clearData } = useAnalytics();
  const [showDialog, setShowDialog] = useState(false);
  const stats = getStats();

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rowgram_analytics_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    clearData();
    setShowDialog(false);
  };

  const getTopTemplates = () => {
    return Object.entries(stats.popularTemplates)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  };

  const getPeakHours = () => {
    return Object.entries(stats.peakUsageHours)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
          <MdInsights style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<MdDownload />}
            onClick={handleExportData}
            sx={{ color: theme.palette.primary.main }}
          >
            Export Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<MdDelete />}
            onClick={() => setShowDialog(true)}
            sx={{ color: theme.palette.error.main }}
          >
            Clear Data
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {' '}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, mb: 1 }}>
                Total Events
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {stats.totalEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: theme.palette.success.main, mb: 1 }}>
                Crews Created
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {stats.crewsCreated}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: theme.palette.info.main, mb: 1 }}>
                Images Generated
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {stats.imagesGenerated}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ color: theme.palette.warning.main, mb: 1 }}>
                This Week
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {stats.lastWeekEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <MdImage style={{ marginRight: 8 }} />
                Popular Templates
              </Typography>
              {getTopTemplates().length > 0 ? (
                <List>
                  {getTopTemplates().map(([template, count], index) => (
                    <ListItem key={template} sx={{ px: 0 }}>
                      <ListItemText
                        primary={`Template ${template}`}
                        secondary={`${count} generations`}
                      />
                      <Chip
                        label={`#${index + 1}`}
                        size="small"
                        color={index === 0 ? 'primary' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No template data yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <MdSchedule style={{ marginRight: 8 }} />
                Peak Usage Hours
              </Typography>
              {getPeakHours().length > 0 ? (
                <List>
                  {getPeakHours().map(({ hour, count }, index) => (
                    <ListItem key={hour} sx={{ px: 0 }}>
                      <ListItemText primary={formatHour(hour)} secondary={`${count} events`} />
                      <Chip
                        label={`#${index + 1}`}
                        size="small"
                        color={index === 0 ? 'primary' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No usage data yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Activity Breakdown
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}
                    >
                      {stats.crewsCreated}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Crews Created
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      sx={{ color: theme.palette.info.main, fontWeight: 'bold' }}
                    >
                      {stats.imagesGenerated}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Images Generated
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}
                    >
                      {stats.bulkGenerations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bulk Generations
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}
                    >
                      {stats.galleryDownloads}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gallery Downloads
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Clear Analytics Data</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all analytics data? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={handleClearData} color="error" variant="contained">
            Clear Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalyticsDashboard;
