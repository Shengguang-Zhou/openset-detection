
import React, { createContext, useContext, useMemo, ReactNode } from 'react';

// Color palette for different categories
const COLOR_PALETTE = [
  "#F97316", // Orange (primary)
  "#D946EF", // Magenta
  "#0EA5E9", // Blue
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#6366F1"  // Indigo
];

interface ColorContextType {
  getCategoryColor: (category: string) => string;
  getLabelColor: (category: string, isAiSuggestion: boolean) => string;
  COLOR_PALETTE: string[];
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: ReactNode }) {
  // A map to store category -> color mappings
  const categoryColorMap = useMemo(() => new Map<string, string>(), []);

  // Get a consistent color for a category
  const getCategoryColor = (category: string): string => {
    if (categoryColorMap.has(category)) {
      return categoryColorMap.get(category)!;
    }
    
    // Assign a new color from the palette
    const newColor = COLOR_PALETTE[categoryColorMap.size % COLOR_PALETTE.length];
    categoryColorMap.set(category, newColor);
    return newColor;
  };

  // Get label color, accounting for AI suggestions
  const getLabelColor = (category: string, isAiSuggestion: boolean): string => {
    if (isAiSuggestion) {
      return "#2563EB"; // AI suggestion blue
    }
    return getCategoryColor(category);
  };

  const value = {
    getCategoryColor,
    getLabelColor,
    COLOR_PALETTE
  };

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>;
}

export function useColors() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
}
