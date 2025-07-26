import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MdImage } from 'react-icons/md';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateValue: string) => void;
}

const templates = [
  { value: '1', label: 'Template 1 - Colorful' },
  { value: '2', label: 'Template 2 - Professional' },
  { value: '3', label: 'Template 3 - Modern' },
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect
}) => {
  const theme = useTheme();

  return (
    <div>
      <Typography 
        sx={{ 
          mb: 2, 
          fontWeight: 500, 
          color: theme.palette.text.primary,
          fontSize: '16px'
        }}
      >
        Choose Template
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        {templates.map((template) => (
          <Box
            key={template.value}
            onClick={() => onTemplateSelect(template.value)}
            sx={{
              minWidth: 120,
              height: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: 2,
              border: `2px solid ${selectedTemplate === template.value 
                ? theme.palette.primary.main 
                : theme.palette.divider}`,
              backgroundColor: selectedTemplate === template.value 
                ? (theme.palette.mode === 'dark' ? 'rgba(125, 179, 211, 0.2)' : '#f0f7ff')
                : theme.palette.background.paper,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(125, 179, 211, 0.1)' : '#f0f7ff'
              }
            }}
          >
            <MdImage size={32} color={theme.palette.primary.main} />
            <Typography sx={{ 
              color: theme.palette.text.primary, 
              fontSize: 12, 
              fontWeight: 500,
              textAlign: 'center',
              mt: 0.5
            }}>
              {template.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default TemplateSelector;