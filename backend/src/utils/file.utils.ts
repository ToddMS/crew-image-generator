import fs from 'fs';
import path from 'path';
import os from 'os';

export const getNextFileName = (baseName: string, extension: string) => {
    // Save to the assets/saved-images directory that the static server serves from
    const savedImagesFolder = path.join(process.cwd(), 'src', 'assets', 'saved-images');
    
    // Ensure the directory exists
    if (!fs.existsSync(savedImagesFolder)) {
        fs.mkdirSync(savedImagesFolder, { recursive: true });
    }
    
    let fileName = `${baseName}.${extension}`;
    let filePath = path.join(savedImagesFolder, fileName);
    let counter = 1;

    while (fs.existsSync(filePath)) {
        fileName = `${baseName}_${counter}.${extension}`;
        filePath = path.join(savedImagesFolder, fileName);
        counter++;
    }

    return filePath;
};