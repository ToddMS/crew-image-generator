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
  onGenerate: (imageName: string, template: string) => Promise<void>;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  onGenerate,
}) => {
  const [imageName, setImageName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        await onGenerate(imageName, selectedTemplate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate image');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Box component="form" className={styles.container} onSubmit={handleFormSubmit}>
      <Typography variant="h4" className={styles.title}>
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