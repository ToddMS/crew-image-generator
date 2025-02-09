import { ChangeEvent, FormEvent } from 'react';
import { BoatType } from '../types';
import { getSeatLabel } from '../services/BoatService';

interface RosterFormProps {
  selectedBoat: BoatType;
  names: string[];
  onNamesChange: (names: string[]) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const RosterForm = ({ selectedBoat, names, onNamesChange, onSubmit }: RosterFormProps) => {
  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    onNamesChange(newNames);
  };

  return (
    <form onSubmit={onSubmit}>
      {names.map((name, index) => (
        <div key={index}>
          <label>
            {getSeatLabel(selectedBoat.value, index, names.length)}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleNameChange(index, e.target.value)}
            placeholder="Enter name"
          />
        </div>
      ))}
      
      <button type="submit">
        Submit Roster
      </button>
    </form>
  );
};

export default RosterForm;
