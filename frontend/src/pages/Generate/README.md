# Generate Images Page - Implementation Guide

## Overview

The `GenerateImagesPage` is a comprehensive 3-step wizard for creating professional crew images. It follows modern React patterns and integrates seamlessly with your existing API infrastructure.

## Features Implemented

### ✅ Core Functionality
- **3-Step Workflow**: Crew Selection → Template & Colors → Generate & Download
- **Live Preview**: Real-time updates as users make selections
- **API Integration**: Connects to your existing backend endpoints
- **Form Validation**: Step-by-step validation with error messaging
- **Progress Tracking**: Real-time generation status with polling
- **Responsive Design**: Mobile-first responsive layout

### ✅ State Management
- **React Hooks**: Uses useState and useEffect for local state
- **Form State**: Manages complex form state across multiple steps
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Proper loading indicators for async operations

### ✅ API Integration
- **Crews API**: Fetches user's saved crews (`GET /api/crews`)
- **Templates API**: Loads available templates (`GET /api/templates`)
- **Club Presets API**: Gets club color presets (`GET /api/club-presets`)
- **Generation API**: Submits generation requests (`POST /api/generate-images`)
- **Status Polling**: Real-time status updates (`GET /api/generate-images/{id}/status`)

## File Structure

```
src/pages/Generate/
├── GenerateImagesPage.tsx     # Main component
├── GenerateImages.css         # Comprehensive styling
└── README.md                  # This documentation
```

## API Endpoints Expected

The component expects these backend endpoints to be available:

### Crews
- `GET /api/crews` - Get user's crews
- `POST /api/crews` - Create new crew
- `PUT /api/crews/{id}` - Update crew
- `DELETE /api/crews/{id}` - Delete crew

### Templates
- `GET /api/templates` - Get available templates
- `POST /api/templates` - Create template
- `PUT /api/templates/{id}` - Update template
- `DELETE /api/templates/{id}` - Delete template

### Club Presets
- `GET /api/club-presets` - Get club color presets
- `POST /api/club-presets` - Create preset
- `PUT /api/club-presets/{id}` - Update preset
- `DELETE /api/club-presets/{id}` - Delete preset

### Image Generation
- `POST /api/generate-images` - Start generation
- `GET /api/generate-images/{id}/status` - Get status
- `POST /api/generate-images/{id}/cancel` - Cancel generation
- `GET /api/generate-images/{id}/download/{format}` - Download image

## Data Types

### Crew Interface
```typescript
interface Crew {
  id: string;
  name: string;
  clubName: string;
  raceName: string;
  boatType: {
    seats: number;
    name: string;
    value: string;
  };
  crewNames: string[];
  coachName?: string;
  coxName?: string;
}
```

### Template Interface
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
}
```

### Generation Request
```typescript
interface GenerationRequest {
  crewId: string;
  templateId: string;
  colors: {
    primary: string;
    secondary: string;
  };
  formats: string[];
}
```

## Usage Patterns

### 1. Step Navigation
```typescript
const nextStep = () => {
  if (validateCurrentStep()) {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  }
};

const previousStep = () => {
  setCurrentStep(prev => Math.max(prev - 1, 1));
};
```

### 2. Form Validation
```typescript
const validateCurrentStep = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  switch (currentStep) {
    case 1:
      if (!selectedCrew) {
        newErrors.crew = 'Please select a crew';
      }
      break;
    // ... other cases
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### 3. Real-time Generation Polling
```typescript
const pollGenerationStatus = async (generationId: string) => {
  try {
    const response = await ApiService.getGenerationStatus(generationId);
    
    if (response.data.status === 'completed') {
      // Handle completion
    } else if (response.data.status === 'processing') {
      // Continue polling
      setTimeout(() => pollGenerationStatus(generationId), 2000);
    }
  } catch (error) {
    // Handle error
  }
};
```

## Styling Architecture

### CSS Custom Properties
The component uses CSS custom properties for theming:
- `--primary`, `--primary-dark`, `--primary-light`
- `--gray-*` color scale
- `--success`, `--warning`, `--error`
- `--shadow-*` elevation scale
- `--radius`, `--transition` for consistency

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 480px
- Grid layouts that stack on mobile
- Touch-friendly interactive elements

### Animation & Transitions
- Smooth step transitions with CSS animations
- Hover effects for interactive elements
- Loading states with CSS animations
- Progress indicators

## Integration Steps

### 1. Backend API Setup
Ensure your backend provides the expected API endpoints with the correct data structures.

### 2. Environment Variables
Set up your API base URL in `.env`:
```
VITE_API_URL=http://localhost:8080
```

### 3. Authentication
The component integrates with your existing `AuthContext` and includes sign-in prompts for unauthenticated users.

### 4. Navigation
Integrates with your existing `Navigation` component and routing setup.

### 5. Notifications
Uses your existing `NotificationContext` for success/error messages.

## Recommended Backend Implementation

### Generation Process
1. **Immediate Response**: Return generation ID immediately
2. **Background Processing**: Process image generation asynchronously
3. **Status Updates**: Provide real-time status via polling endpoint
4. **File Storage**: Store generated images with proper URLs
5. **Cleanup**: Clean up temporary files after download

### Database Schema
```sql
-- Generation requests
CREATE TABLE generation_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  crew_id UUID REFERENCES crews(id),
  template_id UUID REFERENCES templates(id),
  colors JSONB,
  formats TEXT[],
  status VARCHAR(20) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Generated images
CREATE TABLE generated_images (
  id UUID PRIMARY KEY,
  generation_id UUID REFERENCES generation_requests(id),
  format VARCHAR(50),
  file_path TEXT,
  file_size BIGINT,
  dimensions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Performance Considerations

### 1. API Optimization
- Implement pagination for large datasets
- Use proper HTTP caching headers
- Compress API responses

### 2. Frontend Optimization
- Lazy load components if needed
- Debounce preview updates
- Implement proper error boundaries

### 3. Generation Process
- Queue system for high load
- Progress tracking with webhooks/SSE
- Proper timeout handling

## Error Handling

The component includes comprehensive error handling:

1. **Network Errors**: Graceful fallbacks for API failures
2. **Validation Errors**: Step-by-step validation feedback
3. **Generation Errors**: Clear error messages with retry options
4. **Authentication Errors**: Seamless sign-in flow integration

## Future Enhancements

### Planned Features
- [ ] WebSocket integration for real-time updates
- [ ] Batch generation for multiple crews
- [ ] Custom template creation
- [ ] Advanced color customization
- [ ] Image editing preview
- [ ] Social sharing integration
- [ ] Print-ready formats

### Technical Improvements
- [ ] Add unit tests with Jest/RTL
- [ ] Implement error boundaries
- [ ] Add performance monitoring
- [ ] Implement caching strategies
- [ ] Add accessibility improvements

## Troubleshooting

### Common Issues

1. **API Not Loading**: Check `VITE_API_URL` environment variable
2. **Authentication Issues**: Verify `AuthContext` integration
3. **Styling Issues**: Ensure CSS custom properties are defined
4. **Mobile Issues**: Test responsive breakpoints

### Debug Mode
Add this to enable debug logging:
```typescript
const DEBUG = import.meta.env.DEV;
if (DEBUG) console.log('Generation request:', request);
```

## Support

For implementation questions or issues:
1. Check the browser console for errors
2. Verify API endpoints are working
3. Test with different crew/template combinations
4. Check mobile responsiveness

This implementation provides a solid foundation for your crew image generation feature while maintaining consistency with your existing codebase architecture.