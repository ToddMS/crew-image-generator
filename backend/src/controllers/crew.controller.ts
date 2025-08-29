import { Request, Response } from 'express';
import { Crew } from '../types/crew.types.js';

// Extended request type to include userId from auth middleware
interface AuthenticatedRequest extends Request {
  userId: number;
}

// Crew with userId as returned by the service
type CrewWithUserId = Crew & { userId?: number };
import CrewService from '../services/crew.service.js';
import { generateCrewImage, ClubIconData } from '../services/image.service.js';
import { TemplateGeneratorService, TemplateConfig } from '../services/template-generator/index.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

export const generateCrewImageHandler = async (req: Request, res: Response) => {
  try {
    const { crewId, templateId, imageName, colors, clubIcon, clubIconType } = req.body;

    console.log('🎭 Controller received request:', {
      crewId,
      templateId,
      imageName,
      colors,
      clubIconType: clubIconType || 'none',
    });

    const clubIconFile = req.file;
    if (!crewId) {
      return res.status(400).json({ error: 'Crew ID is required' });
    }
    const crew = await CrewService.getCrewById(crewId);
    if (!crew) {
      return res.status(404).json({ error: 'Crew not found' });
    }

    let clubIconData: ClubIconData | undefined = undefined;
    if (clubIconType === 'upload' && clubIconFile) {
      clubIconData = {
        type: 'upload',
        filePath: clubIconFile.path,
      };
    } else if (clubIcon && clubIcon.type === 'preset' && clubIcon.filename) {
      clubIconData = {
        type: 'preset',
        filename: clubIcon.filename,
      };
    }

    const { outputPath } = await generateCrewImage(
      crew,
      imageName,
      templateId,
      colors,
      clubIconData,
    );
    const buffer = await fs.promises.readFile(outputPath);

    // Also save the image to the database for gallery display
    try {
      const savedImageName = imageName || `crew-${crewId}-${Date.now()}`;
      const fileName = outputPath.split('/').pop() || `${savedImageName}.png`;
      const stats = await fs.promises.stat(outputPath);

      const imageData = {
        crewId: parseInt(crewId),
        userId: (crew as CrewWithUserId).userId || 0,
        imageName: savedImageName,
        templateId: templateId || 'classic-lineup',
        primaryColor: colors?.primary || null,
        secondaryColor: colors?.secondary || null,
        imageFilename: fileName,
        imageUrl: `${process.env.NODE_ENV === 'production' ? process.env.BACKEND_URL || 'https://rowgram-backend.onrender.com' : 'http://localhost:8080'}/api/saved-images/${fileName}`,
        fileSize: stats.size,
        mimeType: 'image/png',
        width: 1080,
        height: 1080,
        format: 'png',
      };

      await CrewService.saveCrewImage(imageData);
    } catch (saveError) {
      console.error('Error saving image to database:', saveError);
      // Don't fail the request if saving to database fails
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating crew image:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const generateCustomCrewImageHandler = async (req: Request, res: Response) => {
  try {
    const { crewId, crew: crewData, templateConfig, clubIcon, clubIconType } = req.body;
    const clubIconFile = req.file;

    if (!templateConfig) {
      return res.status(400).json({ error: 'Template configuration is required' });
    }

    let crew;
    if (crewId) {
      crew = await CrewService.getCrewById(crewId);
      if (!crew) {
        return res.status(404).json({ error: 'Crew not found' });
      }
    } else if (crewData) {
      crew = crewData;
    } else {
      return res.status(400).json({ error: 'Either crew ID or crew data is required' });
    }

    let clubIconData: ClubIconData | undefined = undefined;

    if (clubIconType === 'upload' && clubIconFile) {
      clubIconData = {
        type: 'upload',
        filePath: clubIconFile.path,
      };
    } else if (clubIcon && clubIcon.type === 'preset' && clubIcon.filename) {
      clubIconData = {
        type: 'preset',
        filename: clubIcon.filename,
      };
    } else if (clubIcon && clubIcon.type === 'upload' && clubIcon.base64) {
      clubIconData = {
        type: 'upload',
        // @ts-expect-error: base64 is used for preview uploads, not persisted
        base64: clubIcon.base64, // todo this needs fixing
      };
    }

    const templateGenerator = new TemplateGeneratorService();
    const imageBuffer = await templateGenerator.generateTemplate(
      crew,
      templateConfig as TemplateConfig,
      clubIconData,
    );

    // Return the image as a blob
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', imageBuffer.length);
    return res.send(imageBuffer);
  } catch (error) {
    console.error('Error generating custom crew image:', error);
    res.status(500).json({ error: 'Server error' });
    return;
  }
};

export const getTemplateComponents = async (req: Request, res: Response) => {
  try {
    const components = {
      backgrounds: [
        {
          id: 'geometric',
          name: 'Geometric Pattern',
          description: 'Hexagonal pattern with gradient overlay',
        },
        {
          id: 'diagonal',
          name: 'Diagonal Sections',
          description: 'Bold diagonal cuts with thick white lines',
        },
        {
          id: 'radial-burst',
          name: 'Radial Burst',
          description: 'Sunburst pattern with radial gradient',
        },
      ],
      nameDisplays: [
        { id: 'basic', name: 'Basic Names', description: 'Simple white text with dark background' },
        {
          id: 'labeled',
          name: 'Labeled Names',
          description: 'Names with seat labels (B, S, 2, 3, etc.)',
        },
      ],
      boatStyles: [
        { id: 'centered', name: 'Centered', description: 'Boat centered in the middle' },
        { id: 'offset', name: 'Offset', description: 'Boat positioned for diagonal backgrounds' },
        { id: 'showcase', name: 'Showcase', description: 'Smaller boat for showcasing components' },
      ],
      textLayouts: [
        {
          id: 'header-left',
          name: 'Header Left',
          description: 'Race name and boat name on the left',
        },
        { id: 'header-center', name: 'Header Center', description: 'Centered text layout' },
        { id: 'minimal', name: 'Minimal', description: 'Minimal text styling' },
      ],
      logoPositions: [
        { id: 'bottom-right', name: 'Bottom Right', description: 'Logo in bottom right corner' },
        { id: 'top-right', name: 'Top Right', description: 'Logo in top right corner' },
        { id: 'bottom-left', name: 'Bottom Left', description: 'Logo in bottom left corner' },
        { id: 'none', name: 'No Logo', description: 'No logo displayed' },
      ],
    };

    res.json(components);
  } catch (error) {
    console.error('Error fetching template components:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSavedTemplates = async (req: Request, res: Response) => {
  try {
    const defaultTemplates = [
      {
        id: 'template1',
        name: 'Classic Layout',
        description: 'Geometric pattern with centered boat',
        config: {
          background: 'geometric',
          nameDisplay: 'basic',
          boatStyle: 'centered',
          textLayout: 'header-left',
          logo: 'bottom-right',
          dimensions: { width: 1080, height: 1350 },
          colors: { primary: '#DAA520', secondary: '#2C3E50' },
        },
        isDefault: true,
      },
      {
        id: 'template2',
        name: 'Modern Style',
        description: 'Diagonal sections with offset boat',
        config: {
          background: 'diagonal',
          nameDisplay: 'labeled',
          boatStyle: 'offset',
          textLayout: 'header-left',
          logo: 'bottom-right',
          dimensions: { width: 1080, height: 1350 },
          colors: { primary: '#DAA520', secondary: '#2C3E50' },
        },
        isDefault: true,
      },
      {
        id: 'template3',
        name: 'Minimal Design',
        description: 'Radial burst with showcase boat',
        config: {
          background: 'radial-burst',
          nameDisplay: 'basic',
          boatStyle: 'showcase',
          textLayout: 'header-center',
          logo: 'bottom-right',
          dimensions: { width: 1080, height: 1350 },
          colors: { primary: '#DAA520', secondary: '#2C3E50' },
        },
        isDefault: true,
      },
    ];

    res.json({ templates: defaultTemplates });
  } catch (error) {
    console.error('Error fetching saved templates:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllCrews = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const crews = await CrewService.getCrewsByUserId(userId);
    res.json(crews);
  } catch (error) {
    console.error('Error fetching crews:', error);
    res.status(500).json({ error: 'Failed to fetch crews' });
  }
};

export const createCrew = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, crewNames, boatType, clubName, raceName } = req.body;
    const userId = (req as AuthenticatedRequest).userId;

    if (!name || !crewNames || !boatType || !clubName || !raceName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const crewData = {
      name,
      club_name: clubName,
      race_name: raceName,
      boat_type_id: boatType.id,
      coach_name: req.body.coachName || null,
      userId,
      crewNames,
    };
    const crewId = await CrewService.addCrew(crewData);
    res.status(201).json({ id: crewId, ...crewData });
  } catch (error) {
    console.error('Server error creating crew:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCrewHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const crewId = req.params.id;
    const userId = (req as AuthenticatedRequest).userId;

    if (!crewId) {
      res.status(400).json({ message: 'Invalid crew ID' });
      return;
    }

    const updatedCrew = await CrewService.updateCrew(parseInt(crewId), userId, req.body);
    if (!updatedCrew) {
      res.status(404).json({ message: 'Crew not found or not authorized' });
      return;
    }

    res.status(200).json(updatedCrew);
  } catch {
    res.status(500).json({ error: 'Error updating crew' });
  }
};

export const removeCrew = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const userId = (req as AuthenticatedRequest).userId;

    if (!id) {
      res.status(400).json({ message: 'No ID provided' });
      return;
    }

    const crewId = parseInt(id);

    if (isNaN(crewId)) {
      res.status(400).json({ message: 'Invalid crew ID' });
      return;
    }

    const deleted = await CrewService.deleteCrew(crewId, userId);
    if (!deleted) {
      res.status(404).json({ message: 'Crew not found or not authorized' });
      return;
    }

    res.status(200).json({ message: 'Crew deleted successfully' });
  } catch (error) {
    console.error('Error deleting crew:', error);
    res.status(500).json({ error: 'Error deleting crew' });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'src', 'assets', 'saved-images');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const crewId = req.body.crewId;
    const imageName = req.body.imageName || 'image';
    const sanitizedName = imageName.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `crew_${crewId}_${sanitizedName}_${timestamp}.png`);
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

const clubIconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), 'temp', 'club-icons');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `club_icon_${timestamp}${ext}`);
  },
});

export const uploadClubIcon = multer({
  storage: clubIconStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export const saveCrewImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { crewId, imageName, templateId, colors } = req.body;
    const userId = (req as AuthenticatedRequest).userId;
    const file = req.file;

    if (!crewId || !imageName || !templateId || !file) {
      res.status(400).json({ error: 'Missing required fields or image file' });
      return;
    }

    const crew = await CrewService.getCrewById(crewId);
    if (!crew || (crew as CrewWithUserId).userId !== userId) {
      res.status(404).json({ error: 'Crew not found or not authorized' });
      return;
    }

    let parsedColors = null;
    if (colors) {
      try {
        parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      } catch (error) {
        console.error('Error parsing colors:', error);
      }
    }

    const imageData = {
      crewId: parseInt(crewId),
      userId,
      imageName,
      templateId,
      primaryColor: parsedColors?.primary || null,
      secondaryColor: parsedColors?.secondary || null,
      imageFilename: file.filename,
      imageUrl: `/api/saved-images/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    const savedImageId = await CrewService.saveCrewImage(imageData);

    res.status(201).json({
      id: savedImageId,
      ...imageData,
    });
  } catch (error) {
    console.error('Error saving crew image:', error);
    res.status(500).json({ error: 'Failed to save image' });
  }
};

export const getSavedImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const crewId = req.params.crewId;
    const userId = (req as AuthenticatedRequest).userId;

    if (!crewId) {
      res.status(400).json({ error: 'Crew ID is required' });
      return;
    }

    const crew = await CrewService.getCrewById(parseInt(crewId));
    if (!crew || (crew as CrewWithUserId).userId !== userId) {
      res.status(404).json({ error: 'Crew not found or not authorized' });
      return;
    }

    const savedImages = await CrewService.getSavedImagesByCrewId(parseInt(crewId));
    res.json(savedImages);
  } catch (error) {
    console.error('Error fetching saved images:', error);
    res.status(500).json({ error: 'Failed to fetch saved images' });
  }
};

export const getAllSavedImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    // Get all crews for this user first
    const crews = await CrewService.getCrewsByUserId(userId);

    // Get saved images for all crews
    const allSavedImages = [];
    for (const crew of crews) {
      const crewImages = await CrewService.getSavedImagesByCrewId(
        parseInt((crew as CrewWithUserId).id),
      );
      // Transform database rows to frontend format
      const transformedImages = crewImages.map((image) => {
        // Map template IDs to friendly names
        const templateNameMap: { [key: string]: string } = {
          'classic-lineup': 'Classic Lineup',
          'modern-grid': 'Modern Grid',
          'race-day': 'Race Day',
          minimal: 'Minimal',
          championship: 'Championship',
        };

        return {
          id: image.id?.toString() || image.id,
          crewName: (crew as CrewWithUserId).name,
          templateName: templateNameMap[image.template_id] || image.template_id,
          imageUrl: image.image_url?.startsWith('http')
            ? image.image_url
            : `${process.env.NODE_ENV === 'production' ? process.env.BACKEND_URL || 'https://rowgram-backend.onrender.com' : 'http://localhost:8080'}${image.image_url}`,
          thumbnailUrl: image.thumbnail_url,
          createdAt: image.created_at,
          dimensions: {
            width: image.width || 1080,
            height: image.height || 1080,
          },
          fileSize: image.file_size || 0,
          format: image.format || 'png',
          crewId: image.crew_id?.toString(),
          templateId: image.template_id,
        };
      });
      allSavedImages.push(...transformedImages);
    }

    res.json(allSavedImages);
  } catch (error) {
    console.error('Error fetching all saved images:', error);
    res.status(500).json({ error: 'Failed to fetch saved images' });
  }
};

export const deleteSavedImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageId = req.params.imageId;
    const userId = (req as AuthenticatedRequest).userId;

    if (!imageId) {
      res.status(400).json({ error: 'Image ID is required' });
      return;
    }

    const deleted = await CrewService.deleteSavedImage(parseInt(imageId), userId);
    if (!deleted) {
      res.status(404).json({ error: 'Image not found or not authorized' });
      return;
    }

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting saved image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};
