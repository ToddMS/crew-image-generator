import { TEMPLATE_REGISTRY, TEMPLATE_METADATA } from '../services/template-generator/templates/index.js';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

// Sample crew data for testing
const sampleCrew = {
    id: '1',
    name: 'First VIII',
    clubName: 'Thames Rowing Club',
    raceName: 'Head of the River Race',
    boatType: {
        id: 1,
        seats: 8,
        name: 'Eight',
        value: '8+'
    },
    crewNames: [
        'Alice Johnson',
        'Bob Smith', 
        'Charlie Brown',
        'David Wilson',
        'Emma Davis',
        'Frank Miller',
        'Grace Lee',
        'Henry Taylor'
    ],
    coachName: 'Coach Roberts',
    coxName: 'Sarah Cox',
    created_at: new Date(),
    updated_at: new Date()
};

const generateTemplatePreview = async (templateId: string, templateName: string) => {
    console.log(`🎨 Generating preview for ${templateName} (${templateId})...`);
    
    try {
        const TemplateClass = TEMPLATE_REGISTRY[templateId as keyof typeof TEMPLATE_REGISTRY];
        
        if (!TemplateClass) {
            console.log(`❌ No template class found for ${templateId}`);
            return;
        }

        // Create canvas
        const canvas = createCanvas(1080, 1080);
        const ctx = canvas.getContext('2d');
        
        // Create template instance
        const template = new TemplateClass();
        
        // Template configuration with different colors for each template
        const colorSchemes = [
            { primary: '#1e40af', secondary: '#3b82f6' }, // Blue
            { primary: '#dc2626', secondary: '#ef4444' }, // Red
            { primary: '#059669', secondary: '#10b981' }, // Green
            { primary: '#7c3aed', secondary: '#a855f7' }, // Purple
            { primary: '#ea580c', secondary: '#f97316' }, // Orange
            { primary: '#0891b2', secondary: '#06b6d4' }, // Cyan
            { primary: '#be123c', secondary: '#e11d48' }, // Pink
            { primary: '#a16207', secondary: '#ca8a04' }, // Yellow
            { primary: '#4338ca', secondary: '#6366f1' }, // Indigo
            { primary: '#15803d', secondary: '#16a34a' }  // Emerald
        ];
        
        const templateIndex = Object.keys(TEMPLATE_REGISTRY).indexOf(templateId);
        const colors = colorSchemes[templateIndex % colorSchemes.length];
        
        const templateConfig = {
            dimensions: { width: 1080, height: 1080 },
            colors: colors
        };
        
        console.log(`🎯 Rendering ${templateId} with colors:`, colors);
        
        // Draw the template
        template.draw(ctx, sampleCrew, templateConfig);
        
        // Save the image
        const outputDir = path.join(process.cwd(), 'generated-images');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const filename = `preview_${Date.now()}.png`;
        const outputPath = path.join(outputDir, filename);
        
        const imageBuffer = canvas.toBuffer('image/png');
        await fs.promises.writeFile(outputPath, imageBuffer);
        
        console.log(`✅ Successfully generated ${templateName} preview: ${outputPath}`);
        
    } catch (error) {
        console.error(`❌ Error generating preview for ${templateId}:`, error);
    }
};

const generateAllPreviews = async () => {
    console.log('🚀 Starting template preview generation...');
    console.log(`📋 Found ${Object.keys(TEMPLATE_REGISTRY).length} templates to generate`);
    
    for (const [templateId, TemplateClass] of Object.entries(TEMPLATE_REGISTRY)) {
        const metadata = TEMPLATE_METADATA.find(t => t.id === templateId);
        const templateName = metadata?.name || templateId;
        
        await generateTemplatePreview(templateId, templateName);
        
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🎉 All template previews generated successfully!');
    console.log('📁 Check the generated-images folder for the preview images');
};

// Run the preview generation
generateAllPreviews().catch(console.error);