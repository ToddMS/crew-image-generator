// Template imports
import { ClassicLineupTemplate } from './ClassicLineupTemplate.js';
import { ModernCardTemplate } from './ModernCardTemplate.js';
import { RaceDayTemplate } from './RaceDayTemplate.js';
import { MinimalCleanTemplate } from './MinimalCleanTemplate.js';
import { ChampionshipGoldTemplate } from './ChampionshipGoldTemplate.js';
import { VintageClassicTemplate } from './VintageClassicTemplate.js';
import { ElitePerformanceTemplate } from './ElitePerformanceTemplate.js';
import { RegattaRoyalTemplate } from './RegattaRoyalTemplate.js';
import { OxbridgeHeraldTemplate } from './OxbridgeHeraldTemplate.js';
import { HennessyPosterTemplate } from './HennessyPosterTemplate.js';

// Template exports
export { ClassicLineupTemplate } from './ClassicLineupTemplate.js';
export { ModernCardTemplate } from './ModernCardTemplate.js';
export { RaceDayTemplate } from './RaceDayTemplate.js';
export { MinimalCleanTemplate } from './MinimalCleanTemplate.js';
export { ChampionshipGoldTemplate } from './ChampionshipGoldTemplate.js';
export { VintageClassicTemplate } from './VintageClassicTemplate.js';
export { ElitePerformanceTemplate } from './ElitePerformanceTemplate.js';
export { RegattaRoyalTemplate } from './RegattaRoyalTemplate.js';
export { OxbridgeHeraldTemplate } from './OxbridgeHeraldTemplate.js';
export { HennessyPosterTemplate } from './HennessyPosterTemplate.js';

// Template registry for easy access
export const TEMPLATE_REGISTRY = {
  'classic-lineup': ClassicLineupTemplate,
  'modern-card': ModernCardTemplate,
  'race-day': RaceDayTemplate,
  'minimal-clean': MinimalCleanTemplate,
  'championship-gold': ChampionshipGoldTemplate,
  'vintage-classic': VintageClassicTemplate,
  'elite-performance': ElitePerformanceTemplate,
  'regatta-royal': RegattaRoyalTemplate,
  'oxbridge-herald': OxbridgeHeraldTemplate,
  'henley-poster': HennessyPosterTemplate
};

// Template metadata for frontend display
export const TEMPLATE_METADATA = [
  {
    id: 'classic-lineup',
    name: 'Classic Lineup',
    description: 'Traditional roster layout with clean presentation',
    category: 'classic',
    preview: '/api/templates/classic-lineup/preview'
  },
  {
    id: 'modern-card',
    name: 'Modern Card',
    description: 'Contemporary card-based design with member highlights',
    category: 'modern',
    preview: '/api/templates/modern-card/preview'
  },
  {
    id: 'race-day',
    name: 'Race Day',
    description: 'Bold event-focused template with dynamic styling',
    category: 'event',
    preview: '/api/templates/race-day/preview'
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Simple, elegant layout with clean typography',
    category: 'minimal',
    preview: '/api/templates/minimal-clean/preview'
  },
  {
    id: 'championship-gold',
    name: 'Championship Gold',
    description: 'Luxurious golden design for major competitions',
    category: 'championship',
    preview: '/api/templates/championship-gold/preview'
  },
  {
    id: 'vintage-classic',
    name: 'Vintage Classic',
    description: 'Traditional parchment style with ornate decorations',
    category: 'vintage',
    preview: '/api/templates/vintage-classic/preview'
  },
  {
    id: 'elite-performance',
    name: 'Elite Performance',
    description: 'High-tech performance styling for elite crews',
    category: 'elite',
    preview: '/api/templates/elite-performance/preview'
  },
  {
    id: 'regatta-royal',
    name: 'Regatta Royal',
    description: 'Royal regatta styling with heraldic elements',
    category: 'royal',
    preview: '/api/templates/regatta-royal/preview'
  },
  {
    id: 'oxbridge-herald',
    name: 'Oxbridge Herald',
    description: 'Academic heraldic design with Latin styling',
    category: 'academic',
    preview: '/api/templates/oxbridge-herald/preview'
  },
  {
    id: 'henley-poster',
    name: 'Henley Poster',
    description: 'Traditional Henley Royal Regatta poster style',
    category: 'traditional',
    preview: '/api/templates/henley-poster/preview'
  }
];