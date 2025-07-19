import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import styles from './ImageGenerator.module.css';
import { MdImage } from 'react-icons/md';

interface ImageGeneratorProps {
  onGenerate: (imageName: string, template: string, colors?: { primary: string; secondary: string }) => Promise<void>;
  selectedCrew?: any;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  onGenerate,
  selectedCrew,
}) => {
  const [imageName, setImageName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#5E98C2');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');

  const templates = [
    { value: '1', label: 'Template 1 - Colorful' },
    { value: '2', label: 'Template 2 - Professional' },
    { value: '3', label: 'Template 3 - Modern' },
  ];

  const handleTemplateClick = (templateValue: string) => {
    setSelectedTemplate(templateValue);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (imageName && selectedTemplate) {
      setIsGenerating(true);
      setError(null);
      try {
        await onGenerate(imageName, selectedTemplate, { primary: primaryColor, secondary: secondaryColor });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate image');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Box component="form" className={styles.container} onSubmit={handleFormSubmit}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, textAlign: 'center', mb: 2, letterSpacing: 1 }}>
        Generate Image
      </Typography>
      
      <div>
        <Typography className={styles.label}>Image Name</Typography>
        <TextField
          name="imageName"
          placeholder="Enter image name"
          required
          fullWidth
          variant="outlined"
          className={styles.inputField}
          value={imageName}
          onChange={e => setImageName(e.target.value)}
        />
      </div>

      <div>
        <Typography className={styles.label}>Choose Template</Typography>
        <div className={styles.templateGrid}>
          {templates.map((template) => (
            <div
              key={template.value}
              className={`${styles.templateCard} ${
                selectedTemplate === template.value ? styles.selected : ''
              }`}
              onClick={() => handleTemplateClick(template.value)}
            >
              <div className={styles.templateImage}>
                <MdImage size={48} color="#5E98C2" />
              </div>
              <Typography className={styles.templateLabel}>
                {template.label}
              </Typography>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Typography className={styles.label}>Color Scheme</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontSize: 14, color: '#666' }}>
              Primary Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{
                  width: '50px',
                  height: '40px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              <TextField
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                placeholder="#5E98C2"
              />
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontSize: 14, color: '#666' }}>
              Secondary Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                style={{
                  width: '50px',
                  height: '40px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              <TextField
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                placeholder="#ffffff"
              />
            </Box>
          </Box>
        </Box>
      </div>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={isGenerating || !imageName || !selectedTemplate}
        sx={{
          backgroundColor: '#5E98C2',
          color: '#fff',
          padding: '10px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(94,152,194,0.15)',
          '&:hover': {
            backgroundColor: '#4177a6',
          },
          '&:disabled': {
            backgroundColor: '#ccc',
          },
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {isGenerating ? (
          <>
            <CircularProgress size={20} color="inherit" />
            Generating...
          </>
        ) : (
          <>
            Generate Image
            <MdImage size={24} />
          </>
        )}
      </Button>
    </Box>
  );
};

export default ImageGenerator;