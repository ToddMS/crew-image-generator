import { Box, Button, TextField } from '@mui/material';
import { useState } from 'react';
import { Crew, Template } from '../types/crew.types';

interface TemplatePickerSidebarProps {
  crew: Crew;
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  selectedTemplate: Template | null;
  onGenerate: (imageName: string) => void;
}

const TemplatePickerSidebar: React.FC<TemplatePickerSidebarProps> = ({ crew, templates, onSelectTemplate, selectedTemplate, onGenerate }) => {
  const [imageName, setImageName] = useState('');

  return (
    <Box sx={{ position: "fixed", right: 0, top: 0, width: "300px", height: "100%", backgroundColor: "#242424", padding: "20px", boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.1)" }}>
      <h2>Selected Crew: {crew.name}</h2>
      <div className="templates">
        {templates.map((template, index) => (
          <img
            key={index}
            src={template.image}
            alt={`Template ${index + 1}`}
            className={`template ${selectedTemplate === template ? 'selected' : ''}`}
            onClick={() => onSelectTemplate(template)}
            style={{ marginBottom: "10px", cursor: "pointer", border: selectedTemplate === template ? "2px solid #007bff" : "none" }}
          />
        ))}
      </div>
      <TextField
        label="Image Name"
        variant="outlined"
        fullWidth
        value={imageName}
        onChange={(e) => setImageName(e.target.value)}
        sx={{ marginTop: "20px" }}
      />
      <Button
        variant="contained"
        color="secondary"
        onClick={() => onGenerate(imageName)}
        disabled={!selectedTemplate || !imageName}
        sx={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px", backgroundColor: !selectedTemplate || !imageName ? "#ccc" : undefined, cursor: !selectedTemplate || !imageName ? "not-allowed" : "pointer" }}
      >
        Generate Crew Image
      </Button>
    </Box>
  );
};

export default TemplatePickerSidebar;