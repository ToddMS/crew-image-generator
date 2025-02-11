import { TextField } from "@mui/material";

interface SingleScullFieldProps {
  name: string;
  onNameChange: (name: string) => void;
  hasSubmitted: boolean;
}

const SingleScullField = ({ name, onNameChange, hasSubmitted }: SingleScullFieldProps) => (
  <TextField
    label="Rower"
    variant="outlined"
    value={name}
    onChange={(e) => onNameChange(e.target.value)}
    error={hasSubmitted && !name.trim()}
    helperText={hasSubmitted && !name.trim() ? "Required" : ""}
    sx={{ width: "250px" }}
  />
);

export default SingleScullField;
