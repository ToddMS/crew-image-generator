import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, IconButton, Tooltip, TextField, InputAdornment, Checkbox, FormControl, InputLabel, Select, MenuItem, Chip, Divider } from '@mui/material';
import BulkImageGenerator from '../BulkImageGenerator/BulkImageGenerator';
import { useTheme } from '@mui/material/styles';
import styles from './SavedCrewsComponent.module.css';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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

// Component to render mini crew thumbnail
const CrewThumbnail: React.FC<{ crew: SavedCrew; boatClass: string; getBoatClassColor: (bc: string) => string }> = ({ crew, boatClass, getBoatClassColor }) => {

  const rowers = crew.crewMembers.filter(m => m.seat !== 'Cox').slice(0, 4); // Show max 4 rowers
  const hasCox = crew.crewMembers.some(m => m.seat === 'Cox');

  return (
    <Box 
      sx={{ 
        width: 60, 
        height: 40, 
        backgroundColor: getBoatClassColor(boatClass),
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 1,
        opacity: 0.8
      }}
    >
      {/* Cox indicator */}
      {hasCox && (
        <Box
          sx={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(0,0,0,0.2)'
          }}
        />
      )}
      
      {/* Rower indicators */}
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        {rowers.map((_, idx) => (
          <Box
            key={idx}
            sx={{
              width: 8,
              height: 20,
              backgroundColor: 'rgba(255,255,255,0.7)',
              borderRadius: 0.5,
              border: '1px solid rgba(0,0,0,0.1)'
            }}
          />
        ))}
        {crew.crewMembers.length > 5 && (
          <Typography variant="caption" sx={{ color: 'white', fontSize: 8, ml: 0.5 }}>
            ...
          </Typography>
        )}
      </Box>
      
      {/* Boat class label */}
      <Typography 
        variant="caption" 
        sx={{ 
          position: 'absolute',
          bottom: 1,
          right: 2,
          fontSize: 8,
          fontWeight: 'bold',
          color: 'white',
          textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
        }}
      >
        {boatClass}
      </Typography>
    </Box>
  );
};

const SavedCrewsComponent: React.FC<SavedCrewsComponentProps> = ({ savedCrews, recentCrews, onDeleteCrew, onEditCrew, onGenerateImage, onBulkGenerateImages, onBulkModeChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrews, setSelectedCrews] = useState<Set<string>>(new Set());
  const [showBulkOptions, setShowBulkOptions] = useState(false);
  const [raceFilter, setRaceFilter] = useState('');
  const theme = useTheme();

  // Get unique race names with counts for filtering
  const raceWithCounts = [...new Set(savedCrews.map(crew => crew.raceName))].map(race => ({
    name: race,
    count: savedCrews.filter(crew => crew.raceName === race).length
  }));

  // Handle crew selection for bulk operations
  const handleCrewSelection = (crewId: string, checked: boolean) => {
    const newSelected = new Set(selectedCrews);
    if (checked) {
      newSelected.add(crewId);
    } else {
      newSelected.delete(crewId);
    }
    setSelectedCrews(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCrews.size === filteredCrews.length) {
      setSelectedCrews(new Set());
    } else {
      setSelectedCrews(new Set(filteredCrews.map(crew => crew.id)));
    }
  };

  const handleBulkGenerate = async (
    crewIds: string[], 
    template: string, 
    colors?: { primary: string; secondary: string },
    onProgress?: (current: number, total: number, crewName: string) => void,
    clubIcon?: any
  ) => {
    console.log('SavedCrewsComponent handleBulkGenerate called with clubIcon:', clubIcon);
    if (onBulkGenerateImages) {
      await onBulkGenerateImages(crewIds, template, colors, onProgress, clubIcon);
      setSelectedCrews(new Set());
      setShowBulkOptions(false);
      onBulkModeChange?.(false);
    }
  };

  if (savedCrews.length === 0) {
    return null;
  }

  const getBoatClass = (crew: SavedCrew) => {
    if (crew.boatClass) return crew.boatClass;
    
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

  // Filter crews based on search term and race filter
  const filteredCrews = savedCrews.filter(crew => {
    const boatClass = crew.boatClass || getBoatClass(crew);
    const searchLower = searchTerm.toLowerCase();
    
    // Race filter
    const raceMatches = !raceFilter || crew.raceName === raceFilter;
    
    // Search filter
    const searchMatches = !searchTerm || (
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
    
    return raceMatches && searchMatches;
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

  // Export crew list to CSV
  const handleExportCSV = () => {
    const headers = ['Club Name', 'Race Name', 'Boat Name', 'Boat Class', 'Crew Members'];
    const csvContent = [
      headers.join(','),
      ...savedCrews.map(crew => {
        const boatClass = crew.boatClass || getBoatClass(crew);
        const crewMembersStr = crew.crewMembers.map(m => `${m.seat}: ${m.name}`).join('; ');
        return [
          `"${crew.boatClub}"`,
          `"${crew.raceName}"`, 
          `"${crew.boatName}"`,
          `"${boatClass}"`,
          `"${crewMembersStr}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rowgram_crews_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get recent crews that still exist
  const validRecentCrews = recentCrews.filter(idx => idx < savedCrews.length).slice(0, 3);

  // Shared function for boat class colors
  const getBoatClassColor = (bc: string) => {
    const colors: Record<string, string> = {
      '8+': '#FF6B6B', // Red
      '4+': '#4ECDC4', // Teal  
      '4-': '#45B7D1', // Blue
      '4x': '#96CEB4', // Green
      '2-': '#E67E22', // Burnt Orange
      '2x': '#DDA0DD', // Plum
      '1x': '#FFB347', // Orange
    };
    return colors[bc] || '#5E98C2';
  };

  return (
    <Box className={styles.container} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, textAlign: 'center', mb: 2, letterSpacing: 1 }}>
        Saved Crews
      </Typography>

      
      {/* Race Filter and Bulk Actions */}
      <Box sx={{ width: '100%', maxWidth: 800, mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Race Filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Race</InputLabel>
          <Select
            value={raceFilter}
            onChange={(e) => setRaceFilter(e.target.value)}
            label="Filter by Race"
            size="small"
          >
            <MenuItem value="">All Races ({savedCrews.length})</MenuItem>
            {raceWithCounts.map(({ name, count }) => (
              <MenuItem key={name} value={name}>{name} ({count})</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Bulk Selection Toggle */}
        <Button
          variant={showBulkOptions ? "contained" : "outlined"}
          onClick={() => {
            const newBulkMode = !showBulkOptions;
            setShowBulkOptions(newBulkMode);
            setSelectedCrews(new Set());
            onBulkModeChange?.(newBulkMode);
          }}
          sx={{ ml: 'auto' }}
        >
          {showBulkOptions ? 'Exit Bulk Mode' : 'Bulk Select Mode'}
        </Button>
      </Box>

      {/* Search Bar and Export Button */}
      <Box sx={{ width: '100%', maxWidth: 800, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Search crews by name, club, race, boat type, or crew members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.primary.main }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ color: theme.palette.text.secondary }}
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
                  borderColor: theme.palette.primary.main,
                },
              },
              '&.Mui-focused': {
                '& > fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            },
          }}
        />
        
        {/* Export Button */}
        <Tooltip title="Export crew list to CSV">
          <Button
            variant="outlined"
            onClick={handleExportCSV}
            startIcon={<FileDownloadIcon />}
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              whiteSpace: 'nowrap',
              '&:hover': {
                borderColor: theme.palette.primary.dark || '#4177a6',
                backgroundColor: `rgba(${theme.palette.mode === 'dark' ? '125, 179, 211' : '94, 152, 194'}, 0.1)`,
              },
            }}
            disabled={savedCrews.length === 0}
          >
            Export CSV
          </Button>
        </Tooltip>
      </Box>

      {/* Results Info */}
      {searchTerm && (
        <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary, fontStyle: 'italic' }}>
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
              
              {/* Bulk Selection Checkbox */}
              {showBulkOptions && (
                <Checkbox
                  checked={selectedCrews.has(crew.id)}
                  onChange={(e) => handleCrewSelection(crew.id, e.target.checked)}
                  sx={{ 
                    position: 'absolute', 
                    top: 6, 
                    left: 6, 
                    zIndex: 2,
                    color: theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              )}
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
                  
                  {/* Boat Type Badge */}
                  <Box sx={{ 
                    backgroundColor: getBoatClassColor(boatClass), 
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
                  
                  <Typography variant="subtitle1" className={styles.boatClub} sx={{ fontWeight: 500, textAlign: 'center', mb: 0.5, color: theme.palette.text.primary, fontSize: 18 }}>
                    {crew.boatClub}
                  </Typography>
                  <Typography variant="body2" className={styles.raceName} sx={{ textAlign: 'center', color: theme.palette.primary.main, mb: 0.5, fontSize: 15 }}>
                    {crew.raceName}
                  </Typography>
                  <Typography variant="body2" className={styles.boatName} sx={{ textAlign: 'center', color: theme.palette.text.secondary, mb: 0.5, fontSize: 14 }}>
                    {crew.boatName}
                  </Typography>

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
                                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f5f7fa',
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
                                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f5f7fa',
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
                    gap: 0
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
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f5f7fa',
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
                    }}
                  >
                    Edit Crew
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon style={{ color: '#fff' }} />}
                    onClick={() => onGenerateImage(originalIndex)}
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

      {/* Bulk Generation Section */}
      {showBulkOptions && selectedCrews.size > 0 && (
        <BulkImageGenerator
          selectedCrews={Array.from(selectedCrews)}
          onGenerate={handleBulkGenerate}
          onDeselectCrew={(crewId) => handleCrewSelection(crewId, false)}
          savedCrews={savedCrews}
        />
      )}
    </Box>
  );
};

export default SavedCrewsComponent;