import { getNextFileName } from "../utils/file.utils.js";
import { Crew } from "../types/crew.types.js";
import { TemplateGeneratorService } from "./template-generator/TemplateGeneratorService.js";
import { TemplateConfig } from "./template-generator/interfaces.js";
import { TEMPLATE_REGISTRY } from "./template-generator/templates/index.js";
import { createCanvas } from 'canvas';
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
    console.log('🎨 generateCrewImage called with:', { 
        crewName: crew.name, 
        templateId, 
        colors,
        availableTemplates: Object.keys(TEMPLATE_REGISTRY)
    });

    if (!crew || !crew.crewNames || !Array.isArray(crew.crewNames)) {
        throw new Error("Invalid crew data: 'crewNames' is missing or not an array");
    }

    const outputPath = getNextFileName(imageName, "png");
    
    // Check if we have a custom template class for this templateId
    const TemplateClass = TEMPLATE_REGISTRY[templateId as keyof typeof TEMPLATE_REGISTRY];
    
    if (TemplateClass) {
        console.log(`✅ Using custom template class for ${templateId}`);
        
        try {
            // Create canvas
            const canvas = createCanvas(1080, 1080);
            const ctx = canvas.getContext('2d');
            
            // Use our new template classes
            const template = new TemplateClass();
            const templateConfig = {
                dimensions: { width: 1080, height: 1080 },
                colors: {
                    primary: colors?.primary || '#2563eb',
                    secondary: colors?.secondary || '#1e40af'
                }
            };
            
            console.log(`🎯 Rendering ${templateId} with colors:`, templateConfig.colors);
            
            // Draw the template
            template.draw(ctx, crew, templateConfig);
            
            // Convert to buffer and save
            const imageBuffer = canvas.toBuffer('image/png');
            await fs.promises.writeFile(outputPath, imageBuffer);
            
            console.log(`✅ Successfully generated ${templateId} image at: ${outputPath}`);
            return { outputPath };
            
        } catch (error) {
            console.error(`❌ Error with custom template ${templateId}:`, error);
            throw new Error(`Failed to generate custom template ${templateId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    } else {
        console.log(`⚠️ No custom template found for ${templateId}, falling back to old system`);
        
        // Fallback to old template system
        const templateConfig = getTemplateConfig(templateId, colors);
        
        try {
            const imageBuffer = await templateGenerator.generateTemplate(crew, templateConfig, clubIcon);
            await fs.promises.writeFile(outputPath, imageBuffer);
            
            console.log(`✅ Generated fallback template image at: ${outputPath}`);
            return { outputPath };
        } catch (error) {
            console.error('❌ Error generating fallback template:', error);
            throw new Error(`Failed to generate crew image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};