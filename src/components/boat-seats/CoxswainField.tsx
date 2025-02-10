import { TextField } from "@mui/material";

interface CoxswainFieldProps {
  name: string;
  onNameChange: (name: string) => void;
  hasSubmitted: boolean;
}

const CoxswainField = ({ name, onNameChange, hasSubmitted }: CoxswainFieldProps) => (
  <TextField
    label="Cox"
    variant="outlined"
    value={name}
    onChange={(e) => onNameChange(e.target.value)}
    error={hasSubmitted && !name.trim()}
    helperText={hasSubmitted && !name.trim() ? "Required" : ""}
    sx={{ width: "250px" }}
  />
);

export default CoxswainField;
