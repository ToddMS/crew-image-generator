import { useCrewContext } from "../context/CrewContext";
import SavedCrewItem from "./SavedCrewItem";
import { Typography, Box, Stack } from "@mui/material";

const SavedCrewsList = () => {
  const { crews } = useCrewContext();

  console.log("Rendering SavedCrewsList with crews:", crews); // ✅ Debugging log

  return (
    <Box className="saved-crews-container">
      <Typography variant="h4">Saved Crews</Typography>
      {crews.length === 0 ? (
        <Typography>No saved crews</Typography>
      ) : (
        <Stack spacing={2}>
          {crews.map((crew) => (
            <SavedCrewItem key={crew.id} crew={crew} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default SavedCrewsList;
