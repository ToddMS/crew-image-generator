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
  bulkMode?: boolean;
  selectedCrews?: Set<string>;
  onCrewSelection?: (crewId: string, checked: boolean) => void;
  onBulkDelete?: () => void;
}

const SavedCrewsComponent: React.FC<SavedCrewsComponentProps> = ({ 
  savedCrews, 
  onDeleteCrew, 
  onEditCrew, 
  bulkMode = false,
  selectedCrews = new Set(),
  onCrewSelection,
  onBulkDelete
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: 3,
        alignItems: 'start' // Align cards to top instead of stretching
      }}>
        {filteredCrews.map((crew, index) => {
          const originalIndex = savedCrews.findIndex(c => c === crew);
          const boatClass = getBoatClass(crew);
          
          const handleCardClick = () => {
            if (bulkMode && onCrewSelection) {
              onCrewSelection(crew.id, !selectedCrews.has(crew.id));
            }
          };

          // Option A: Improved "Sports Team" Style
          return (
            <Card 
              key={crew.id}
              onClick={handleCardClick}
              sx={{ 
                position: 'relative',
                transition: 'all 0.2s ease',
                height: 'auto',
                cursor: 'pointer',
                border: selectedCrews.has(crew.id) 
                  ? `2px solid ${theme.palette.primary.main}` 
                  : `1px solid ${theme.palette.divider}`,
                backgroundColor: selectedCrews.has(crew.id)
                  ? `${theme.palette.primary.main}08`
                  : theme.palette.background.paper,
                mb: 3, // Margin bottom for masonry spacing
                breakInside: 'avoid', // Prevent breaking across columns
                display: 'inline-block',
                width: '100%',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                  backgroundColor: selectedCrews.has(crew.id)
                    ? `${theme.palette.primary.main}12`
                    : `${theme.palette.primary.main}04`
                }
              }}
            >
              {/* Top Right Controls */}
              <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCrew(originalIndex);
                  }}
                  sx={{ p: 0.5 }}
                >
                  <MdEdit size={16} />
                </IconButton>
                <Checkbox
                  checked={selectedCrews.has(crew.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onCrewSelection && onCrewSelection(crew.id, e.target.checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  size="small"
                  sx={{ p: 0.5 }}
                />
              </Box>

              <CardContent sx={{ p: 3, pr: 8 }}> {/* Right padding for icon controls */}
                {/* Main Content */}
                <Box sx={{ mb: 3 }}>
                  {/* Header with Club Name */}
                  <Box sx={{ mb: 2 }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}
                        >
                          {crew.boatClub}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, minWidth: 35 }}>
                          Race:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.text.secondary, 
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}
                        >
                          {crew.raceName}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, minWidth: 35 }}>
                          Boat:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.text.secondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}
                        >
                          {crew.boatName}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, minWidth: 50 }}>
                          Boat type:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: theme.palette.text.secondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}
                        >
                          {boatClass}
                        </Typography>
                      </Box>
                      
                      {/* Crew Members - Grid Layout */}
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, minWidth: 35 }}>
                            Crew:
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            {boatClass === '8+' ? (
                              <Box>
                                {/* Cox centered */}
                                {crew.crewMembers.filter((m: any) => m.seat === 'Cox').map((member: any) => (
                                  <Box key="cox" sx={{ textAlign: 'center', mb: 1 }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Cox: {member.name}</Typography>
                                  </Box>
                                ))}
                                {/* 2x4 Grid */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5, fontSize: '0.7rem' }}>
                                  {crew.crewMembers.filter((m: any) => m.seat !== 'Cox').slice(0, 4).map((member: any) => (
                                    <Typography key={member.seat} variant="body2" sx={{ fontSize: '0.75rem' }}>
                                      {member.seat === 'Stroke Seat' ? 'Stroke' : member.seat === 'Bow' ? 'Bow' : member.seat.match(/(\d+)/)?.[1] || member.seat}: {member.name}
                                    </Typography>
                                  ))}
                                  {crew.crewMembers.filter((m: any) => m.seat !== 'Cox').slice(4, 8).map((member: any) => (
                                    <Typography key={member.seat} variant="body2" sx={{ fontSize: '0.75rem' }}>
                                      {member.seat === 'Stroke Seat' ? 'Stroke' : member.seat === 'Bow' ? 'Bow' : member.seat.match(/(\d+)/)?.[1] || member.seat}: {member.name}
                                    </Typography>
                                  ))}
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {crew.crewMembers.map((member: any) => (
                                  <Typography key={member.seat} variant="body2" sx={{ fontSize: '0.75rem' }}>
                                    {member.seat === 'Cox' ? 'Cox' : member.seat === 'Stroke Seat' ? 'Stroke' : member.seat === 'Bow' ? 'Bow' : member.seat.match(/(\d+)/)?.[1] || member.seat}: {member.name}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                </Box>

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