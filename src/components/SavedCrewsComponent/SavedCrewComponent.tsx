import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  IconButton, 
  TextField, 
  InputAdornment,
  Chip,
  Checkbox
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  MdDelete, 
  MdEdit, 
  MdImage, 
  MdSearch, 
  MdClear 
} from 'react-icons/md';

interface CrewMember {
  seat: string;
  name: string;
}

interface SavedCrew {
  id: string;
  boatClub: string;
  raceName: string;
  boatName: string;
  crewMembers: CrewMember[];
  boatClass?: string;
}

interface SavedCrewsComponentProps {
  savedCrews: SavedCrew[];
  recentCrews: number[];
  onDeleteCrew: (index: number) => void;
  onEditCrew: (index: number) => void;
  onGenerateImage: (index: number) => void;
  onBulkGenerateImages?: (
    crewIds: string[], 
    template: string, 
    colors?: { primary: string; secondary: string },
    onProgress?: (current: number, total: number, crewName: string) => void,
    clubIcon?: any
  ) => void;
  onBulkModeChange?: (isBulkMode: boolean) => void;
  bulkMode?: boolean;
  selectedCrews?: Set<string>;
  onCrewSelection?: (crewId: string, checked: boolean) => void;
  onBulkDelete?: () => void;
  onBulkGenerate?: () => void;
}

const SavedCrewsComponent: React.FC<SavedCrewsComponentProps> = ({ 
  savedCrews, 
  onDeleteCrew, 
  onEditCrew, 
  onGenerateImage,
  bulkMode = false,
  selectedCrews = new Set(),
  onCrewSelection,
  onBulkDelete,
  onBulkGenerate
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const getBoatClass = (crew: SavedCrew) => {
    if (crew.boatClass) return crew.boatClass;
    
    if (crew.crewMembers.length === 9) return '8+';
    if (crew.crewMembers.length === 5 && crew.crewMembers[0].seat === 'Cox') return '4+';
    if (crew.crewMembers.length === 4) return '4-';
    if (crew.crewMembers.length === 2) return '2x';
    if (crew.crewMembers.length === 1) return '1x';
    return '';
  };

  // Filter crews based on search
  const filteredCrews = savedCrews.filter(crew => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      crew.boatClub?.toLowerCase().includes(searchLower) ||
      crew.raceName?.toLowerCase().includes(searchLower) ||
      crew.boatName?.toLowerCase().includes(searchLower) ||
      getBoatClass(crew).toLowerCase().includes(searchLower)
    );
  });

  const getBoatClassColor = (boatClass: string) => {
    const colors: Record<string, string> = {
      '8+': '#FF6B6B',
      '4+': '#4ECDC4', 
      '4-': '#45B7D1',
      '4x': '#96CEB4',
      '2-': '#E67E22',
      '2x': '#DDA0DD',
      '1x': '#FFB347',
    };
    return colors[boatClass] || '#9E9E9E';
  };


  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search crews by name, club, race, or boat type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MdSearch size={20} color={theme.palette.text.secondary} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                >
                  <MdClear size={16} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        
        {searchTerm && (
          <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
            {filteredCrews.length === 0 
              ? `No crews found matching "${searchTerm}"` 
              : `Found ${filteredCrews.length} crew${filteredCrews.length === 1 ? '' : 's'}`
            }
          </Typography>
        )}
      </Box>

      {/* Crews Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: 3 
      }}>
        {filteredCrews.map((crew, index) => {
          const originalIndex = savedCrews.findIndex(c => c === crew);
          const boatClass = getBoatClass(crew);
          
          const handleCardClick = () => {
            if (bulkMode && onCrewSelection) {
              onCrewSelection(crew.id, !selectedCrews.has(crew.id));
            }
          };

          return (
            <Card 
              key={crew.id} 
              onClick={handleCardClick}
              sx={{ 
                position: 'relative',
                transition: 'all 0.2s ease',
                height: 280,
                display: 'flex',
                flexDirection: 'column',
                cursor: bulkMode ? 'pointer' : 'default',
                border: bulkMode && selectedCrews.has(crew.id) 
                  ? `2px solid ${theme.palette.primary.main}` 
                  : `1px solid ${theme.palette.divider}`,
                backgroundColor: bulkMode && selectedCrews.has(crew.id)
                  ? `${theme.palette.primary.main}08`
                  : theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                  ...(bulkMode && {
                    backgroundColor: selectedCrews.has(crew.id)
                      ? `${theme.palette.primary.main}12`
                      : `${theme.palette.primary.main}04`
                  })
                }
              }}
            >
              {/* Delete button (single mode) */}
              {!bulkMode && (
                <IconButton
                  onClick={() => onDeleteCrew(originalIndex)}
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    zIndex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      color: theme.palette.error.main
                    }
                  }}
                  size="small"
                >
                  <MdDelete size={16} />
                </IconButton>
              )}

              <CardContent sx={{ 
                pb: 2, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Boat Type Badge with optional checkbox */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, minHeight: 32 }}>
                  <Chip
                    label={boatClass}
                    size="small"
                    sx={{
                      backgroundColor: getBoatClassColor(boatClass),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {bulkMode && onCrewSelection && (
                      <Checkbox
                        checked={selectedCrews.has(crew.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          onCrewSelection(crew.id, e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                          p: 0
                        }}
                        size="small"
                      />
                    )}
                  </Box>
                </Box>

                {/* Split Layout: Club Info + Crew Members */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flex: 1 }}>
                  {/* Left Half - Club Info */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {crew.boatClub}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body1" sx={{ color: theme.palette.primary.main }}>
                        {crew.raceName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        •
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {crew.boatName}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right Half - Crew Members */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 0.5,
                      maxHeight: 140,
                      overflow: 'auto',
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '2px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '2px',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        },
                      },
                    }}>
                      {crew.crewMembers.map((member, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {/* Seat Badge */}
                          <Box
                            sx={{
                              backgroundColor: member.seat === 'Cox' ? '#FFB347' : theme.palette.primary.main,
                              color: 'white',
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              minWidth: 24,
                              textAlign: 'center'
                            }}
                          >
                            {member.seat === 'Cox' ? 'Cox' : 
                             member.seat === 'Stroke Seat' ? 'S' :
                             member.seat === 'Bow' ? 'B' :
                             member.seat.match(/(\d+)/) ? member.seat.match(/(\d+)/)?.[1] : 
                             member.seat}
                          </Box>
                          
                          {/* Member Name */}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.875rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1
                            }}
                          >
                            {member.name}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Actions - Always at bottom */}
                {!bulkMode && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      startIcon={<MdEdit size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCrew(originalIndex);
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<MdImage size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerateImage(originalIndex);
                      }}
                      size="small"
                      sx={{ flex: 1 }}
                    >
                      Generate
                    </Button>
                  </Box>
                )}
                
                {bulkMode && (
                  <Box sx={{ mt: 'auto', textAlign: 'center', py: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: selectedCrews.has(crew.id) 
                          ? theme.palette.primary.main 
                          : theme.palette.text.secondary,
                        fontWeight: selectedCrews.has(crew.id) ? 600 : 400
                      }}
                    >
                      {selectedCrews.has(crew.id) ? 'Selected' : 'Click to select'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Empty State */}
      {filteredCrews.length === 0 && !searchTerm && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            No crews yet
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Create your first crew to get started
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SavedCrewsComponent;