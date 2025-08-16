import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface OfflineNoticeProps {
  onRetry?: () => void;
}

const OfflineNotice: React.FC<OfflineNoticeProps> = ({ onRetry }) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Alert 
        severity="info" 
        sx={{ 
          backgroundColor: theme.palette.info.light + '20',
          border: `1px solid ${theme.palette.info.main}`,
        }}
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>Backend Service Unavailable</AlertTitle>
        The RowGram backend service is currently not available. This is likely because:
        <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
          <li>The backend server is not yet deployed</li>
          <li>You're viewing the demo version</li>
          <li>There's a temporary connectivity issue</li>
        </ul>
      </Alert>
    </Box>
  );
};

export default OfflineNotice;