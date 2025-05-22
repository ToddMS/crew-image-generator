import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import styles from './SavedCrewsComponent.module.css';

interface CrewMember {
  seat: string;
  name: string;
}

interface SavedCrew {
  boatClub: string;
  raceName: string;
  boatName: string;
  crewMembers: CrewMember[];
}

interface SavedCrewsComponentProps {
  savedCrews: SavedCrew[];
}

const SavedCrewsComponent: React.FC<SavedCrewsComponentProps> = ({ savedCrews }) => {
  if (savedCrews.length === 0) {
    return null;
  }

  return (
    <Box className={styles.container}>
      <Typography variant="h5" gutterBottom>
        Saved Crews
      </Typography>
      <div className={styles.crewsGrid}>
        {savedCrews.map((crew, index) => (
          <Card key={index} className={styles.crewCard}>
            <CardContent>
              <Typography variant="h6" className={styles.boatClub}>
                {crew.boatClub}
              </Typography>
              <Typography variant="body2" className={styles.raceName}>
                {crew.raceName}
              </Typography>
              <Typography variant="body2" className={styles.boatName}>
                {crew.boatName}
              </Typography>
              <div className={styles.crewList}>
                {crew.crewMembers.map((member, idx) => (
                  <Typography key={idx} variant="body2">
                    {member.seat}: {member.name}
                  </Typography>
                ))}
              </div>
              <Button
                variant="contained"
                className={styles.generateButton}
                startIcon={<span role="img" aria-label="image">📷</span>}
              >
                Generate Image
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Box>
  );
};

export default SavedCrewsComponent;