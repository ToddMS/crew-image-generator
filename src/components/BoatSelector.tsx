import { ChangeEvent } from 'react';
import { BoatType } from '../types/index';

interface BoatSelectorProps {
  boatClass: BoatType[];
  onBoatSelect: (boat: BoatType) => void;
}

const BoatSelector = ({ boatClass, onBoatSelect }: BoatSelectorProps) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = boatClass[parseInt(e.target.value)];
    onBoatSelect(selected);
  };

  return (
    <div>
      <label>Choose a boat class</label>
      <select
        onChange={handleChange}
        defaultValue=""
      >
        <option value="" disabled>Select a boat class</option>
        {boatClass.map((boat, key) => (
          <option key={key} value={key}>
            {boat.value}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BoatSelector;