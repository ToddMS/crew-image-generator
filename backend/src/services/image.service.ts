import { getNextFileName } from "../utils/file.utils.js";
import { Crew } from "../types/crew.types.js";
import { TemplateGeneratorService, TemplateConfig } from "./template-generator/TemplateGeneratorService.js";
import fs from 'fs';

export interface ClubIconData {
    type: 'preset' | 'upload';
    filename?: string;
    filePath?: string;
}

const templateGenerator = new TemplateGeneratorService();

// Define template configurations for different template IDs
const getTemplateConfig = (templateId: string, colors?: { primary: string; secondary: string }): TemplateConfig => {
    const defaultColors = {
        primary: colors?.primary || '#2563eb',
        secondary: colors?.secondary || '#1e40af'
    };

    const baseConfig = {
        dimensions: { width: 1080, height: 1080 },
        colors: defaultColors
    };

    switch (templateId) {
        case 'classic-lineup':
            return {
                ...baseConfig,
                background: 'geometric' as const,
                nameDisplay: 'labeled' as const,
                boatStyle: 'centered' as const,
                textLayout: 'header-center' as const,
                logo: 'bottom-right' as const
            };
        case 'modern-grid':
            return {
                ...baseConfig,
                background: 'diagonal' as const,
                nameDisplay: 'basic' as const,
                boatStyle: 'showcase' as const,
                textLayout: 'header-left' as const,
                logo: 'top-right' as const
            };
        case 'race-day':
            return {
                ...baseConfig,
                background: 'radial-burst' as const,
                nameDisplay: 'labeled' as const,
                boatStyle: 'centered' as const,
                textLayout: 'header-center' as const,
                logo: 'bottom-right' as const
            };
        case 'minimal':
            return {
                ...baseConfig,
                background: 'geometric' as const,
                nameDisplay: 'basic' as const,
                boatStyle: 'centered' as const,
                textLayout: 'minimal' as const,
                logo: 'none' as const
            };
        case 'championship':
            return {
                ...baseConfig,
                background: 'radial-burst' as const,
                nameDisplay: 'labeled' as const,
                boatStyle: 'showcase' as const,
                textLayout: 'header-center' as const,
                logo: 'bottom-right' as const
            };
        default:
            return {
                ...baseConfig,
                background: 'geometric' as const,
                nameDisplay: 'basic' as const,
                boatStyle: 'centered' as const,
                textLayout: 'header-center' as const,
                logo: 'bottom-right' as const
            };
    }
};

export const generateCrewImage = async (crew: Crew, imageName: string, templateId: string, colors?: { primary: string; secondary: string }, clubIcon?: ClubIconData) => {
    if (!crew || !crew.crewNames || !Array.isArray(crew.crewNames)) {
        throw new Error("Invalid crew data: 'crewNames' is missing or not an array");
    }

    const outputPath = getNextFileName(imageName, "png");
    const templateConfig = getTemplateConfig(templateId, colors);

    try {
        // Generate the image using the template generator service
        const imageBuffer = await templateGenerator.generateTemplate(crew, templateConfig, clubIcon);
        
        // Write the buffer to the output path
        await fs.promises.writeFile(outputPath, imageBuffer);
        
        return { outputPath };
    } catch (error) {
        console.error('Error generating crew image:', error);
        throw new Error(`Failed to generate crew image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};