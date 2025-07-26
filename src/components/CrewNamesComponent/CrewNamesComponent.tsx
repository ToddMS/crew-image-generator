import React, { useEffect } from 'react';
import { Box, Button, TextField, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './CrewNamesComponent.module.css';
import { MdSave, MdDragIndicator } from 'react-icons/md';

interface CrewNamesComponentProps {
  boatClass: string;
  crewNames: string[];
  coxName: string;
  onNameChange: (idx: number, value: string) => void;
  onCoxNameChange: (value: string) => void;
  onSaveCrew?: (boatClub: string, raceName: string, boatName: string) => void;
  onCrewReorder?: (oldIndex: number, newIndex: number) => void;
  clubName: string;
  raceName: string;
  boatName: string;
}

const getSeatLabels = (boatClass: string): string[] => {
  switch (boatClass) {
    case '8+':
      return [
        'Cox',
        'Stroke Seat',
        '7 Seat',
        '6 Seat',
        '5 Seat',
        '4 Seat',
        '3 Seat',
        '2 Seat',
        'Bow',
      ];
    case '4+':
      return ['Cox', 'Stroke Seat', '3 Seat', '2 Seat', 'Bow'];
    case '4-':
      return ['Stroke Seat', '3 Seat', '2 Seat', 'Bow'];
    case '4x':
      return ['Stroke Seat', '3 Seat', '2 Seat', 'Bow'];
    case '2-':
      return ['Stroke Seat', 'Bow'];
    case '2x':
      return ['Stroke Seat', 'Bow'];
    case '1x':
      return ['Single'];
    default:
      return [];
  }
};

// Sortable crew member item component
interface SortableCrewMemberProps {
  id: string;
  index: number;
  name: string;
  label: string;
  onNameChange: (idx: number, value: string) => void;
  theme: any;
  disabled?: boolean;
}

const SortableCrewMember: React.FC<SortableCrewMemberProps> = ({
  id,
  index,
  name,
  label,
  onNameChange,
  theme,
  disabled = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton
          {...attributes}
          {...listeners}
          sx={{
            cursor: disabled ? 'not-allowed' : 'grab',
            color: theme.palette.text.secondary,
            mr: 1,
            opacity: disabled ? 0.3 : 1,
            '&:active': {
              cursor: disabled ? 'not-allowed' : 'grabbing',
            }
          }}
          disabled={disabled}
        >
          <MdDragIndicator />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography className={styles.label}>{label}</Typography>
          <TextField
            name={`crewName-${index}`}
            placeholder={`Enter ${label.toLowerCase()} name`}
            value={name}
            onChange={e => onNameChange(index, e.target.value)}
            required
            fullWidth
            className={styles.inputField}
          />
        </Box>
      </Box>
    </div>
  );
};

const CrewNamesComponent: React.FC<CrewNamesComponentProps> = ({
  boatClass,
  crewNames,
  coxName,
  onNameChange,
  onCoxNameChange,
  onSaveCrew,
  onCrewReorder,
  clubName,
  raceName,
  boatName,
}) => {
  const theme = useTheme();
  const seatLabels = getSeatLabels(boatClass);
  const hasCox = boatClass === '8+' || boatClass === '4+';

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && onCrewReorder) {
      const oldIndex = crewNames.findIndex((_, idx) => `crew-${idx}` === active.id);
      const newIndex = crewNames.findIndex((_, idx) => `crew-${idx}` === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onCrewReorder(oldIndex, newIndex);
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        const allNamesFilled = hasCox ? 
          coxName.trim() && crewNames.every(name => name.trim()) :
          crewNames.every(name => name.trim());
        
        if (allNamesFilled && onSaveCrew) {
          onSaveCrew(clubName, raceName, boatName);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [coxName, crewNames, hasCox, onSaveCrew, clubName, raceName, boatName]);

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSaveCrew(clubName, raceName, boatName);
  };

  const getBoatInfo = () => {
    const boatNames = {
      '8+': 'Eight',
      '4+': 'Coxed Four', 
      '4-': 'Coxless Four',
      '4x': 'Quad Sculls',
      '2-': 'Pair',
      '2x': 'Double Sculls',
      '1x': 'Single Sculls'
    };
    return boatNames[boatClass as keyof typeof boatNames] || boatClass;
  };

  return (
    <Box 
      component="form" 
      className={styles.container} 
      sx={{ 
        marginTop: 4,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary
      }} 
      onSubmit={handleFormSubmit}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, textAlign: 'center', mb: 1, letterSpacing: 1 }}>
        Enter Crew Names
      </Typography>
      
      <Box sx={{ 
        textAlign: 'center', 
        mb: 3, 
        p: 2, 
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(125, 179, 211, 0.1)' : '#f5f7fa', 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 1 }}>
          {clubName} - {raceName}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
          {boatName}
        </Typography>
        <Box sx={{ 
          display: 'inline-block',
          backgroundColor: theme.palette.primary.main, 
          color: 'white', 
          px: 2, 
          py: 0.5, 
          borderRadius: 2, 
          fontSize: 14,
          fontWeight: 'bold'
        }}>
          {boatClass} - {getBoatInfo()}
        </Box>
      </Box>
      {hasCox && (
        <div>
          <Typography className={styles.label}>Cox</Typography>
          <TextField
            name="coxName"
            placeholder="Enter Cox"
            value={coxName}
            onChange={e => onCoxNameChange(e.target.value)}
            required
            fullWidth
            className={styles.inputField}
          />
        </div>
      )}
      {onCrewReorder ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={crewNames.map((_, idx) => `crew-${idx}`)}
            strategy={verticalListSortingStrategy}
          >
            {crewNames.map((name, idx) => {
              const label = seatLabels[hasCox ? idx + 1 : idx] || `Seat ${idx + 1}`;
              return (
                <SortableCrewMember
                  key={`crew-${idx}`}
                  id={`crew-${idx}`}
                  index={idx}
                  name={name}
                  label={label}
                  onNameChange={onNameChange}
                  theme={theme}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      ) : (
        // Fallback for when drag and drop is not enabled
        crewNames.map((name, idx) => {
          const label = seatLabels[hasCox ? idx + 1 : idx] || `Seat ${idx + 1}`;
          return (
            <div key={idx}>
              <Typography className={styles.label}>{label}</Typography>
              <TextField
                name={`crewName-${idx}`}
                placeholder={`Enter ${label.toLowerCase()} name`}
                value={name}
                onChange={e => onNameChange(idx, e.target.value)}
                required
                fullWidth
                className={styles.inputField}
              />
            </div>
          );
        })
      )}
      {onSaveCrew && (
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            padding: '10px',
            borderRadius: '6px',
            boxShadow: `0 2px 8px rgba(${theme.palette.mode === 'dark' ? '125, 179, 211' : '94, 152, 194'}, 0.15)`,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark || '#4177a6',
            },
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            justifyContent: 'center',
          }}
          endIcon={<MdSave size={22} />}
        >
          Save Crew
        </Button>
      )}
    </Box>
  );
};

export default CrewNamesComponent;