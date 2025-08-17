import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface AnalyticsEvent {
  event: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, unknown>;
}

interface AnalyticsStats {
  totalEvents: number;
  crewsCreated: number;
  imagesGenerated: number;
  bulkGenerations: number;
  galleryDownloads: number;
  lastWeekEvents: number;
  popularTemplates: Record<string, number>;
  peakUsageHours: Record<number, number>;
}

interface AnalyticsContextType {
  trackEvent: (event: string, metadata?: Record<string, unknown>) => void;
  getStats: () => AnalyticsStats;
  getEventsByType: (eventType: string) => AnalyticsEvent[];
  exportData: () => string;
  clearData: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    const savedEvents = localStorage.getItem('rowgram_analytics');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Error loading analytics data:', error);
      }
    }
  }, []);

  // Save events to localStorage when events change
  useEffect(() => {
    localStorage.setItem('rowgram_analytics', JSON.stringify(events));
  }, [events]);

  const trackEvent = (event: string, metadata?: Record<string, unknown>) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      userId: user?.id?.toString(),
      metadata,
    };

    setEvents((prev) => [...prev, analyticsEvent]);
  };

  const getStats = (): AnalyticsStats => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const lastWeekEvents = events.filter((e) => e.timestamp > oneWeekAgo);

    const templateCounts: Record<string, number> = {};
    const hourCounts: Record<number, number> = {};

    events.forEach((event) => {
      // Track template usage
      if (event.event === 'image_generated' && event.metadata?.template) {
        const template = String(event.metadata.template);
        templateCounts[template] = (templateCounts[template] || 0) + 1;
      }

      // Track usage by hour
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return {
      totalEvents: events.length,
      crewsCreated: events.filter((e) => e.event === 'crew_created').length,
      imagesGenerated: events.filter((e) => e.event === 'image_generated').length,
      bulkGenerations: events.filter((e) => e.event === 'bulk_generation').length,
      galleryDownloads: events.filter((e) => e.event === 'gallery_download').length,
      lastWeekEvents: lastWeekEvents.length,
      popularTemplates: templateCounts,
      peakUsageHours: hourCounts,
    };
  };

  const exportData = (): string => {
    const stats = getStats();
    const exportData = {
      generatedAt: new Date().toISOString(),
      stats,
      events: events.map((e) => ({
        event: e.event,
        timestamp: new Date(e.timestamp).toISOString(),
        metadata: e.metadata,
      })),
    };
    return JSON.stringify(exportData, null, 2);
  };

  const getEventsByType = (eventType: string): AnalyticsEvent[] => {
    return events.filter((event) => event.event === eventType);
  };

  const clearData = () => {
    setEvents([]);
    localStorage.removeItem('rowgram_analytics');
  };

  return (
    <AnalyticsContext.Provider
      value={{ trackEvent, getStats, getEventsByType, exportData, clearData }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
