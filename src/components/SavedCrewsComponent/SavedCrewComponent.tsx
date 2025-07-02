import React from 'react';
import { Box, Card, CardContent, Typography, Button, IconButton, Tooltip } from '@mui/material';
import styles from './SavedCrewsComponent.module.css';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

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
}

const formatSeatLabel = (seat: string) => {
  if (seat === 'Cox') return <span style={{ fontWeight: 700 }}>Cox:</span>;
  if (seat === 'Stroke Seat') return <span style={{ fontWeight: 700 }}>Stroke:</span>;
  if (seat === 'Bow') return <span style={{ fontWeight: 700 }}>Bow:</span>;
  const match = seat.match(/(\d+)/);
  if (match) return <span style={{ fontWeight: 700 }}>{match[1]}:</span>;
  return <span style={{ fontWeight: 700 }}>{seat}:</span>;
};

const truncateName = (name: string) => {
  if (name.length > 17) {
    return name.slice(0, 17).trimEnd() + '...';
  }
  return name;
};

const SavedCrewsComponent: React.FC<SavedCrewsComponentProps> = ({ savedCrews, onDeleteCrew, onEditCrew }) => {
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
    name.length > 17 ? (
      <Tooltip title={name} arrow>
        <span>{children}</span>
      </Tooltip>
    ) : (
      <>{children}</>
    );

  return (
    <Box className={styles.container} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, textAlign: 'center', mb: 2, letterSpacing: 1 }}>
        Saved Crews
      </Typography>
      <Box className={styles.crewsGrid} sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
        {savedCrews.map((crew, index) => {
          const boatClass = crew.boatClass || getBoatClass(crew);
          return (
            <Card key={index} className={styles.crewCard} sx={{ minWidth: 240, maxWidth: 270, mx: 1, my: 1, boxShadow: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, position: 'relative' }}>
              <IconButton
                aria-label="delete"
                size="small"
                onClick={() => onDeleteCrew(index)}
                sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              <CardContent sx={{ 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                p: 0,
                '&:last-child': {
                  paddingBottom: 0
                }
              }}>
                <Typography variant="subtitle1" className={styles.boatClub} sx={{ fontWeight: 500, textAlign: 'center', mb: 0.5, color: '#2d5c88', fontSize: 18 }}>
                  {crew.boatClub}
                </Typography>
                <Typography variant="body2" className={styles.raceName} sx={{ textAlign: 'center', color: '#5E98C2', mb: 0.5, fontSize: 15 }}>
                  {crew.raceName}
                </Typography>
                <Typography variant="body2" className={styles.boatName} sx={{ textAlign: 'center', color: '#888', mb: 1, fontSize: 14 }}>
                  {crew.boatName}
                </Typography>
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
                  <Box className={styles.crewList} sx={{ width: '100%', mb: 1 }}>
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
                    onClick={() => onEditCrew(index)}
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