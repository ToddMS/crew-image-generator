import React, { useState } from 'react';
import { Box, Typography, Dialog, DialogContent, IconButton, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MdImage, MdClose, MdVisibility } from 'react-icons/md';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateValue: string) => void;
}

const templates = [
  { value: '1', label: 'Colorful' },
  { value: '2', label: 'Professional' },
  { value: '3', label: 'Modern' },
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect
}) => {
  const theme = useTheme();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string>('');

  const handlePreviewClick = (templateValue: string) => {
    setPreviewTemplate(templateValue);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewTemplate('');
  };

  const getPreviewImage = (templateValue: string) => {
    // Placeholder images - these will be replaced with actual template previews
    const placeholders = {
      '1': '/api/placeholder/600/400',
      '2': '/api/placeholder/600/400', 
      '3': '/api/placeholder/600/400'
    };
    return placeholders[templateValue as keyof typeof placeholders] || '/api/placeholder/600/400';
  };

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
      
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
        {templates.map((template) => (
          <Box
            key={template.value}
            onClick={() => onTemplateSelect(template.value)}
            sx={{
              width: 220,
              height: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: 3,
              border: `3px solid ${selectedTemplate === template.value 
                ? theme.palette.primary.main 
                : theme.palette.divider}`,
              backgroundColor: selectedTemplate === template.value 
                ? (theme.palette.mode === 'dark' ? 'rgba(125, 179, 211, 0.2)' : '#f0f7ff')
                : theme.palette.background.paper,
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(125, 179, 211, 0.1)' : '#f0f7ff',
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
                '& .preview-button': {
                  opacity: 1
                }
              }
            }}
          >
            {/* Template Preview Image */}
            <Box sx={{ 
              width: '100%', 
              height: '75%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}40)`,
              mb: 1,
              position: 'relative'
            }}>
              <MdImage size={64} color={theme.palette.primary.main} />
              
              {/* Preview Button */}
              <IconButton
                className="preview-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewClick(template.value);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  },
                  width: 32,
                  height: 32
                }}
                size="small"
              >
                <MdVisibility size={16} />
              </IconButton>
            </Box>
            
            {/* Template Name */}
            <Typography sx={{ 
              color: theme.palette.text.primary, 
              fontSize: 13, 
              fontWeight: 600,
              textAlign: 'center',
              px: 1
            }}>
              {template.label.replace(' - ', '\n')}
            </Typography>
            
            {/* Selected Indicator */}
            {selectedTemplate === template.value && (
              <Box sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography sx={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      
      {/* Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={closePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={closePreview}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              }
            }}
          >
            <MdClose />
          </IconButton>
          
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {templates.find(t => t.value === previewTemplate)?.label} Preview
            </Typography>
            
            {/* Placeholder for template preview */}
            <Box sx={{
              width: '100%',
              height: 400,
              backgroundColor: theme.palette.grey[100],
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}40)`
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <MdImage size={80} color={theme.palette.primary.main} />
                <Typography variant="body1" sx={{ mt: 2, color: theme.palette.text.secondary }}>
                  Template {previewTemplate} Preview
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Full template preview coming soon
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              onClick={() => {
                onTemplateSelect(previewTemplate);
                closePreview();
              }}
              sx={{ mr: 2 }}
            >
              Select This Template
            </Button>
            
            <Button
              variant="outlined"
              onClick={closePreview}
            >
              Close Preview
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateSelector;