export const getSeatLabel = (boatType: string, index: number, totalRowers: number): string => {
    const hasCox = boatType.includes('+');

    if (hasCox && index === 0) {
        return 'Cox';
    }

    const adjustedIndex = hasCox ? index - 1 : index;

    if (adjustedIndex === 0) {
        return 'Stroke';
    }

    if (adjustedIndex === totalRowers - 1) {
        return 'Bow';
    }

    return `Seat ${totalRowers - adjustedIndex}`;
};
