import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Checkbox,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MdEdit, MdSearch, MdClear } from 'react-icons/md';

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
  onEditCrew,
  bulkMode = false,
  selectedCrews = new Set(),
  onCrewSelection,
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
  const filteredCrews = savedCrews.filter((crew) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      crew.boatClub?.toLowerCase().includes(searchLower) ||
      crew.raceName?.toLowerCase().includes(searchLower) ||
      crew.boatName?.toLowerCase().includes(searchLower) ||
      getBoatClass(crew).toLowerCase().includes(searchLower) ||
      crew.crewMembers?.some((member) => member.name?.toLowerCase().includes(searchLower))
    );
  });


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
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <MdClear size={16} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        {searchTerm && (
          <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
            {filteredCrews.length === 0
              ? `No crews found matching "${searchTerm}"`
              : `Found ${filteredCrews.length} crew${filteredCrews.length === 1 ? '' : 's'}`}
          </Typography>
        )}
      </Box>

      {/* Crews List - Full Width Cards */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {filteredCrews.map((crew) => {
          const originalIndex = savedCrews.findIndex((c) => c === crew);
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
                    : `${theme.palette.primary.main}04`,
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
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

              <CardContent sx={{ p: 3, pr: 8 }}>
                {' '}
                {/* Right padding for icon controls */}
                {/* Main Content - Split Layout */}
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                  {/* Left Side - Boat Info */}
                  <Box sx={{ flex: '0 0 300px' }}>
                    {/* Club Name Header */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {crew.boatClub}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <strong>Race name:</strong> {crew.raceName}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <strong>Boat name:</strong> {crew.boatName}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <strong>Boat type:</strong> {boatClass}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Divider */}
                  <Box
                    sx={{
                      width: '1px',
                      backgroundColor: theme.palette.divider,
                      alignSelf: 'stretch',
                      minHeight: '100px',
                    }}
                  />

                  {/* Right Side - Crew */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        mb: 1,
                        display: 'block',
                      }}
                    >
                      Crew:
                    </Typography>

                    {boatClass === '8+' ? (
                      /* 8+ Layout: Cox above, then two rows of 4 */
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {/* Cox - Center */}
                        {crew.crewMembers
                          .filter((member: any) => member.seat === 'Cox')
                          .map((member: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
                              <Box
                                sx={{
                                  backgroundColor: theme.palette.action.selected,
                                  px: 2,
                                  py: 0.75,
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.7rem',
                                    color: theme.palette.text.secondary,
                                    fontWeight: 600,
                                  }}
                                >
                                  Cox
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: theme.palette.text.primary,
                                    textAlign: 'center',
                                    flex: 1,
                                  }}
                                >
                                  {member.name}
                                </Typography>
                              </Box>
                            </Box>
                          ))}

                        {/* Rowers in two groups of 4 */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {/* First 4 (Stroke side) */}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {crew.crewMembers
                              .filter((member: any) => member.seat !== 'Cox')
                              .slice(0, 4)
                              .map((member: any, idx: number) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    backgroundColor: theme.palette.action.selected,
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flex: '1 1 calc(25% - 6px)',
                                    minWidth: 'fit-content',
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.7rem',
                                      color: theme.palette.text.secondary,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {member.seat === 'Stroke Seat'
                                      ? 'S'
                                      : member.seat.match(/(\d+)/)?.[1] || member.seat.charAt(0)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: '0.8rem',
                                      fontWeight: 500,
                                      color: theme.palette.text.primary,
                                      textAlign: 'center',
                                      flex: 1,
                                    }}
                                  >
                                    {member.name}
                                  </Typography>
                                </Box>
                              ))}
                          </Box>

                          {/* Second 4 (Bow side) */}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {crew.crewMembers
                              .filter((member: any) => member.seat !== 'Cox')
                              .slice(4, 8)
                              .map((member: any, idx: number) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    backgroundColor: theme.palette.action.selected,
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flex: '1 1 calc(25% - 6px)',
                                    minWidth: 'fit-content',
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.7rem',
                                      color: theme.palette.text.secondary,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {member.seat === 'Bow'
                                      ? 'B'
                                      : member.seat.match(/(\d+)/)?.[1] || member.seat.charAt(0)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: '0.8rem',
                                      fontWeight: 500,
                                      color: theme.palette.text.primary,
                                      textAlign: 'center',
                                      flex: 1,
                                    }}
                                  >
                                    {member.name}
                                  </Typography>
                                </Box>
                              ))}
                          </Box>
                        </Box>
                      </Box>
                    ) : boatClass === '4+' ? (
                      /* 4+ Layout: Cox above, then one row of 4 */
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {/* Cox - Center */}
                        {crew.crewMembers
                          .filter((member: any) => member.seat === 'Cox')
                          .map((member: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
                              <Box
                                sx={{
                                  backgroundColor: theme.palette.action.selected,
                                  px: 2,
                                  py: 0.75,
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.7rem',
                                    color: theme.palette.text.secondary,
                                    fontWeight: 600,
                                  }}
                                >
                                  Cox
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: theme.palette.text.primary,
                                    textAlign: 'center',
                                    flex: 1,
                                  }}
                                >
                                  {member.name}
                                </Typography>
                              </Box>
                            </Box>
                          ))}

                        {/* Rowers in one row of 4 */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {crew.crewMembers
                            .filter((member: any) => member.seat !== 'Cox')
                            .map((member: any, idx: number) => (
                              <Box
                                key={idx}
                                sx={{
                                  backgroundColor: theme.palette.action.selected,
                                  px: 2,
                                  py: 0.75,
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  flex: '1 1 calc(25% - 6px)',
                                  minWidth: 'fit-content',
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.7rem',
                                    color: theme.palette.text.secondary,
                                    fontWeight: 600,
                                  }}
                                >
                                  {member.seat === 'Stroke Seat'
                                    ? 'S'
                                    : member.seat === 'Bow'
                                      ? 'B'
                                      : member.seat.match(/(\d+)/)?.[1] || member.seat.charAt(0)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: theme.palette.text.primary,
                                    textAlign: 'center',
                                    flex: 1,
                                  }}
                                >
                                  {member.name}
                                </Typography>
                              </Box>
                            ))}
                        </Box>
                      </Box>
                    ) : (
                      /* Other boat types: spread across */
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1.5,
                          alignItems: 'center',
                        }}
                      >
                        {crew.crewMembers.map((member: any, idx: number) => (
                          <Box
                            key={idx}
                            sx={{
                              backgroundColor: theme.palette.action.selected,
                              px: 2,
                              py: 0.75,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              flex: '1 1 auto',
                              minWidth: 'fit-content',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.7rem',
                                color: theme.palette.text.secondary,
                                fontWeight: 600,
                              }}
                            >
                              {member.seat === 'Cox'
                                ? 'Cox'
                                : member.seat === 'Stroke Seat'
                                  ? 'S'
                                  : member.seat === 'Bow'
                                    ? 'B'
                                    : member.seat.match(/(\d+)/)?.[1] || member.seat}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: theme.palette.text.primary,
                                textAlign: 'center',
                                flex: 1,
                              }}
                            >
                              {member.name}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
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
