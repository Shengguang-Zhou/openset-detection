
import React, { createContext, useContext, ReactNode } from 'react';

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

// AI suggestion color
const AI_COLOR = "#2563EB"; // Blue

interface ColorContextType {
  getCategoryColor: (category: string) => string;
  getLabelColor: (category: string, isAiSuggestion: boolean) => string;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: ReactNode }) {
  // Function to deterministically map a category to a color
  const getCategoryColor = (category: string): string => {
    // Get a consistent hash for the category
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = ((hash << 5) - hash) + category.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use the hash to select a color from the palette
    const index = Math.abs(hash) % COLOR_PALETTE.length;
    return COLOR_PALETTE[index];
  };
  
  // Get label color based on whether it's an AI suggestion
  const getLabelColor = (category: string, isAiSuggestion: boolean): string => {
    if (isAiSuggestion) {
      return AI_COLOR;
    }
    return getCategoryColor(category);
  };
  
  const value = {
    getCategoryColor,
    getLabelColor,
  };
  
  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>;
}

// Custom hook to use color context
export function useColors() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
}
