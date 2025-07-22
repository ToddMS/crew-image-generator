import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, IconButton, Tooltip, TextField, InputAdornment } from '@mui/material';
import styles from './SavedCrewsComponent.module.css';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface CrewMember {
  seat: string;
  name: string;
}

interface SavedCrew {
  boatClub: string;
  raceName: string;
  boatName: string;
  crewMembers: CrewMember[];
  boatClass?: string; 
}

interface SavedCrewsComponentProps {
  savedCrews: SavedCrew[];
  onDeleteCrew: (index: number) => void;
  onEditCrew: (index: number) => void;
  onGenerateImage: (index: number) => void;
}

const formatSeatLabel = (seat: string) => {
  if (seat === 'Cox') return <span style={{ fontWeight: 700 }}>Cox:</span>;
  if (seat === 'Stroke Seat') return <span style={{ fontWeight: 700 }}>S:</span>;
  if (seat === 'Bow') return <span style={{ fontWeight: 700 }}>B:</span>;
  const match = seat.match(/(\d+)/);
  if (match) return <span style={{ fontWeight: 700 }}>{match[1]}:</span>;
  return <span style={{ fontWeight: 700 }}>{seat}:</span>;
};

const truncateName = (name: string) => {
  if (name.length > 12) {
    return name.slice(0, 12).trimEnd() + '...';
  }
  return name;
};

const SavedCrewsComponent: React.FC<SavedCrewsComponentProps> = ({ savedCrews, onDeleteCrew, onEditCrew, onGenerateImage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  if (savedCrews.length === 0) {
    return null;
  }

  const getBoatClass = (crew: SavedCrew) => {
    if (crew.crewMembers.length === 9) return '8+';
    if (crew.crewMembers.length === 5 && crew.crewMembers[0].seat === 'Cox') return '4+';
    if (crew.crewMembers.length === 4) return '4-';
    if (crew.crewMembers.length === 2) return '2x';
    if (crew.crewMembers.length === 1) return '1x';
    return '';
  };

  const NameWithTooltip = ({ name, children }: { name: string; children: React.ReactNode }) =>
    name.length > 12 ? (
      <Tooltip title={name} arrow>
        <span>{children}</span>
      </Tooltip>
    ) : (
      <>{children}</>
    );

  // Filter crews based on search term
  const filteredCrews = savedCrews.filter(crew => {
    const boatClass = crew.boatClass || getBoatClass(crew);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      // Search club name
      crew.boatClub?.toLowerCase().includes(searchLower) ||
      // Search race name
      crew.raceName?.toLowerCase().includes(searchLower) ||
      // Search boat name
      crew.boatName?.toLowerCase().includes(searchLower) ||
      // Search boat class
      boatClass.toLowerCase().includes(searchLower) ||
      // Search crew member names
      crew.crewMembers.some(member => 
        member.name.toLowerCase().includes(searchLower) ||
        member.seat.toLowerCase().includes(searchLower)
      )
    );
  });

  // Sort filtered crews by boat size (largest first)
  const sortedCrews = [...filteredCrews].sort((a, b) => {
    const boatClassA = a.boatClass || getBoatClass(a);
    const boatClassB = b.boatClass || getBoatClass(b);
    
    const sizeA = a.crewMembers.length;
    const sizeB = b.crewMembers.length;
    
    // Sort by size descending, then by boat class
    if (sizeA !== sizeB) {
      return sizeB - sizeA;
    }
    return boatClassA.localeCompare(boatClassB);
  });

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Box className={styles.container} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, textAlign: 'center', mb: 2, letterSpacing: 1 }}>
        Saved Crews
      </Typography>
      
      {/* Search Bar */}
      <Box sx={{ width: '100%', maxWidth: 500, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search crews by name, club, race, boat type, or crew members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#5E98C2' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ color: '#666' }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover': {
                '& > fieldset': {
                  borderColor: '#5E98C2',
                },
              },
              '&.Mui-focused': {
                '& > fieldset': {
                  borderColor: '#5E98C2',
                },
              },
            },
          }}
        />
      </Box>

      {/* Results Info */}
      {searchTerm && (
        <Typography variant="body2" sx={{ mb: 2, color: '#666', fontStyle: 'italic' }}>
          {sortedCrews.length === 0 
            ? `No crews found matching "${searchTerm}"` 
            : `Found ${sortedCrews.length} crew${sortedCrews.length === 1 ? '' : 's'} matching "${searchTerm}"`
          }
        </Typography>
      )}
      <Box className={styles.crewsGrid} sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
        {sortedCrews.map((crew) => {
          const originalIndex = savedCrews.findIndex(c => c === crew);
          const boatClass = crew.boatClass || getBoatClass(crew);
          return (
            <Card key={originalIndex} className={styles.crewCard} sx={{ 
              minWidth: crew.crewMembers.length <= 2 ? 200 : 240, 
              maxWidth: crew.crewMembers.length <= 2 ? 220 : 270, 
              height: crew.crewMembers.length <= 2 ? 320 : 420, // 8s and 4s same height, 2s and 1s same height
              mx: 1, 
              my: 1, 
              boxShadow: 3, 
              borderRadius: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              p: 2, 
              position: 'relative' 
            }}>
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => onDeleteCrew(originalIndex)}
                sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <CardContent sx={{ 
                width: '100%', 
                height: '100%',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'space-between', // Keep buttons at bottom
                p: 0,
                '&:last-child': {
                  paddingBottom: 0
                }
              }}>
                {/* Header info wrapper for consistent spacing */}
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Typography variant="subtitle1" className={styles.boatClub} sx={{ fontWeight: 500, textAlign: 'center', mb: 0.5, color: '#2d5c88', fontSize: 18 }}>
                    {crew.boatClub}
                  </Typography>
                  <Typography variant="body2" className={styles.raceName} sx={{ textAlign: 'center', color: '#5E98C2', mb: 0.5, fontSize: 15 }}>
                    {crew.raceName}
                  </Typography>
                  <Typography variant="body2" className={styles.boatName} sx={{ textAlign: 'center', color: '#888', mb: 0.5, fontSize: 14 }}>
                    {crew.boatName}
                  </Typography>
                  
                  {/* Boat Type Badge */}
                  <Box sx={{ 
                    backgroundColor: '#5E98C2', 
                    color: 'white', 
                    px: 2, 
                    py: 0.5, 
                    borderRadius: 2, 
                    mb: 1,
                    fontSize: 12,
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}>
                    {boatClass} {
                      boatClass === '8+' ? 'Eight' :
                      boatClass === '4+' ? 'Four' :
                      boatClass === '4-' ? 'Four' :
                      boatClass === '4x' ? 'Quad' :
                      boatClass === '2-' ? 'Pair' :
                      boatClass === '2x' ? 'Double' :
                      boatClass === '1x' ? 'Single' :
                      'Boat'
                    }
                  </Box>
                </Box>
                {boatClass === '8+' ? (
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <NameWithTooltip name={crew.crewMembers[0]?.name || ''}>
                      <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 500, mb: 1, fontSize: 15 }}>
                        {formatSeatLabel('Cox')} {truncateName(crew.crewMembers[0]?.name || '')}
                      </Typography>
                    </NameWithTooltip>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Box>
                        {[1, 3, 5, 7].map((i, idx) => (
                          <NameWithTooltip key={idx} name={crew.crewMembers[i]?.name || ''}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 13,
                                textAlign: 'left',
                                py: 0.5,
                                px: 1,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                borderRadius: 1,
                                transition: 'background 0.2s',
                                '&:hover': {
                                  backgroundColor: '#f5f7fa',
                                },
                              }}
                            >
                              {formatSeatLabel(crew.crewMembers[i]?.seat || '')} {truncateName(crew.crewMembers[i]?.name || '')}
                            </Typography>
                          </NameWithTooltip>
                        ))}
                      </Box>
                      <Box>
                        {[2, 4, 6, 8].map((i, idx) => (
                          <NameWithTooltip key={idx} name={crew.crewMembers[i]?.name || ''}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 13,
                                textAlign: 'left',
                                py: 0.5,
                                px: 1,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                borderRadius: 1,
                                transition: 'background 0.2s',
                                '&:hover': {
                                  backgroundColor: '#f5f7fa',
                                },
                              }}
                            >
                              {formatSeatLabel(crew.crewMembers[i]?.seat || '')} {truncateName(crew.crewMembers[i]?.name || '')}
                            </Typography>
                          </NameWithTooltip>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box className={styles.crewList} sx={{ 
                    width: '100%', 
                    mb: 1,
                    flex: 1, // Take up available space
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center', // Center content for smaller crews
                    gap: crew.crewMembers.length <= 2 ? 2 : 0 // No gap for 4s, spacing for 2s/1s
                  }}>
                    {crew.crewMembers.map((member, idx) => (
                      <NameWithTooltip key={idx} name={member.name}>
                        <Typography
                          variant="body2"
                          sx={{
                            textAlign: 'center',
                            fontSize: 13,
                            py: 0.5,
                            px: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            borderRadius: 1,
                            transition: 'background 0.2s',
                            '&:hover': {
                              backgroundColor: '#f5f7fa',
                            },
                          }}
                        >
                          {formatSeatLabel(member.seat)} {truncateName(member.name)}
                        </Typography>
                      </NameWithTooltip>
                    ))}
                  </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', mt: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon style={{ color: '#fff' }} />}
                    onClick={() => onEditCrew(originalIndex)}
                    sx={{
                      backgroundColor: '#5E98C2',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(94,152,194,0.15)',
                      '&:hover': {
                        backgroundColor: '#4177a6',
                      },
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    Edit Crew
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon style={{ color: '#fff' }} />}
                    onClick={() => onGenerateImage(originalIndex)}
                    sx={{
                      backgroundColor: '#5E98C2',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(94,152,194,0.15)',
                      '&:hover': {
                        backgroundColor: '#4177a6',
                      },
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    Generate Image
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default SavedCrewsComponent;