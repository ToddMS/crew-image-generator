import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdStar } from 'react-icons/md';
import { Box, FormControl, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAuth } from '../../context/AuthContext';
import { ClubPreset } from '../../types/club.types';

interface ClubPresetDropdownProps {
  value: number | null;
  onChange: (presetId: number, preset: ClubPreset) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  sx?: Record<string, unknown>;
  showSearch?: boolean;
  showCreateOption?: boolean;
}

const ClubPresetDropdown: React.FC<ClubPresetDropdownProps> = ({
  value,
  onChange,
  placeholder = 'Choose a club preset',
  className,
  sx,
  showSearch = true,
  showCreateOption = true,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();

  const [presets, setPresets] = useState<ClubPreset[]>([]);
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [recentPresets, setRecentPresets] = useState<number[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (user) {
      loadPresets();
      loadRecentPresets();
    }
  }, [user]);

  const loadPresets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPresets(data);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const loadRecentPresets = useCallback(() => {
    if (user) {
      const recentKey = `recent_presets_${user.id}`;
      const recent = localStorage.getItem(recentKey);
      if (recent) {
        try {
          setRecentPresets(JSON.parse(recent));
        } catch (error) {
          console.error('Error loading recent presets:', error);
        }
      }
    }
  }, [user]);

  const saveRecentPreset = (presetId: number) => {
    if (user) {
      const recentKey = `recent_presets_${user.id}`;
      const newRecent = [presetId, ...recentPresets.filter((id) => id !== presetId)].slice(0, 5);
      setRecentPresets(newRecent);
      localStorage.setItem(recentKey, JSON.stringify(newRecent));
    }
  };

  const handlePresetSelection = (event: SelectChangeEvent<number>) => {
    const presetId = event.target.value as number;
    const selectedPreset = presets.find((p) => p.id === presetId);

    if (selectedPreset) {
      saveRecentPreset(presetId);
      onChange(presetId, selectedPreset);
    }
  };

  const getFilteredPresets = () => {
    let filtered = presets;

    if (presetSearchQuery) {
      filtered = filtered.filter((preset) =>
        preset.club_name.toLowerCase().includes(presetSearchQuery.toLowerCase()),
      );
    }

    return filtered.sort((a, b) => {
      if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;

      const aRecent = recentPresets.indexOf(a.id);
      const bRecent = recentPresets.indexOf(b.id);

      if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
      if (aRecent !== -1) return -1;
      if (bRecent !== -1) return 1;

      return a.club_name.localeCompare(b.club_name);
    });
  };

  return (
    <FormControl fullWidth size="small" variant="outlined" className={className} sx={sx}>
      <Select
        value={value ?? ''}
        onChange={handlePresetSelection}
        displayEmpty
        onKeyDown={(e) => {
          if (searchFocused) {
            e.preventDefault();
          }
        }}
        renderValue={(selected) => {
          if (!selected) {
            return <span style={{ color: '#999' }}>{placeholder}</span>;
          }
          const selectedPreset = presets.find((p) => p.id === selected);
          if (!selectedPreset) return '';

          return (
            <Box display="flex" alignItems="center" gap={1.5} width="100%">
              <Box display="flex" gap={0.5}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    backgroundColor: selectedPreset.primary_color,
                    border: '1px solid #ddd',
                  }}
                />
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    backgroundColor: selectedPreset.secondary_color,
                    border: '1px solid #ddd',
                  }}
                />
              </Box>

              <Box flex={1}>
                <Typography variant="body2" sx={{ color: 'inherit' }}>
                  {selectedPreset.club_name}
                </Typography>
              </Box>
            </Box>
          );
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
              borderWidth: 2,
            },
          },
        }}
      >
        {showSearch && presets.length > 3 && (
          <Box
            sx={{ p: 1, pb: 1 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <TextField
              size="small"
              placeholder="Search presets..."
              value={presetSearchQuery}
              onChange={(e) => setPresetSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <MdSearch style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                ),
              }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.background.paper,
                },
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => {
                e.stopPropagation();
                setSearchFocused(true);
              }}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </Box>
        )}

        {getFilteredPresets().map((preset) => {
          const isRecent = recentPresets.includes(preset.id);
          return (
            <MenuItem
              key={preset.id}
              value={preset.id}
              sx={{
                p: 1,
                '& .MuiListItemText-root': { display: 'none' },
                '& .MuiTypography-root:not(.MuiBox-root .MuiTypography-root)': { display: 'none' },
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} width="100%">
                <Box display="flex" gap={0.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: 0.5,
                      backgroundColor: preset.primary_color,
                      border: '1px solid #ddd',
                    }}
                  />
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: 0.5,
                      backgroundColor: preset.secondary_color,
                      border: '1px solid #ddd',
                    }}
                  />
                </Box>

                <Box flex={1}>
                  <Typography variant="body2" fontWeight={isRecent ? 600 : 500}>
                    {preset.club_name}
                  </Typography>
                </Box>

                <Box display="flex" gap={0.5} alignItems="center">
                  {preset.is_default && (
                    <MdStar style={{ color: theme.palette.warning.main, fontSize: 18 }} />
                  )}
                </Box>
              </Box>
            </MenuItem>
          );
        })}

        {showCreateOption && (
          <MenuItem
            value=""
            onClick={(e) => {
              e.stopPropagation();
              navigate('/club-presets');
            }}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              mt: 1,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} width="100%">
              <MdAdd style={{ color: theme.palette.primary.main }} />
              <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                Create preset
              </Typography>
            </Box>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default ClubPresetDropdown;
