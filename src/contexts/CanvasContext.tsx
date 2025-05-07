
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Label } from '@/hooks/useDummyData';

// Define the context state and actions
interface CanvasContextType {
  // Canvas state
  tool: "select" | "rect" | "polygon" | "point" | "move";
  setTool: (tool: "select" | "rect" | "polygon" | "point" | "move") => void;
  lastUsedTool: "rect" | "polygon" | "point";
  drawing: boolean;
  setDrawing: (drawing: boolean) => void;
  points: number[];
  setPoints: (points: number[]) => void;
  scale: number;
  setScale: (scale: number) => void;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
  isImageLoaded: boolean;
  setIsImageLoaded: (loaded: boolean) => void;
  isSpacePressed: boolean;
  setIsSpacePressed: (pressed: boolean) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  
  // Label selection state
  selectedLabelId: string | null;
  setSelectedLabelId: (id: string | null) => void;
  highlightedLabelId: string | null;
  setHighlightedLabelId: (id: string | null) => void;
  
  // Selection box (for image reference mode)
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  setSelectionBox: (box: { x: number; y: number; width: number; height: number } | null) => void;
  
  // Canvas utility functions
  resetDrawing: () => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetZoom: (imageWidth: number, imageHeight: number) => void;
  handleCancelDrawing: (isSelectMode: boolean) => void;
  stageSize: { width: number; height: number };
  setStageSize: (size: { width: number; height: number }) => void;
}

// Create context with default values
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// Provider component
export function CanvasProvider({ children }: { children: ReactNode }) {
  // Basic canvas state
  const [tool, setToolState] = useState<"select" | "rect" | "polygon" | "point" | "move">("select");
  const [lastUsedTool, setLastUsedTool] = useState<"rect" | "polygon" | "point">("rect");
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<number[]>([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  // Label selection state
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [highlightedLabelId, setHighlightedLabelId] = useState<string | null>(null);
  
  // Selection box for reference image mode
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  // Wrapper for setTool that also updates lastUsedTool
  const setTool = useCallback((newTool: "select" | "rect" | "polygon" | "point" | "move") => {
    setToolState(newTool);
    if (newTool !== "select" && newTool !== "move") {
      setLastUsedTool(newTool);
    }
  }, []);

  // Reset drawing state
  const resetDrawing = useCallback(() => {
    setDrawing(false);
    setPoints([]);
  }, []);
  
  // Zoom functions
  const handleZoomIn = useCallback(() => {
    const newScale = scale * 1.2;
    if (newScale > 10) return;
    
    setScale(newScale);
    
    // Adjust position to zoom toward center
    setPosition(position => {
      const centerX = stageSize.width / 2;
      const centerY = stageSize.height / 2;
      const oldCenterX = (centerX - position.x) / scale;
      const oldCenterY = (centerY - position.y) / scale;
      
      return {
        x: centerX - oldCenterX * newScale,
        y: centerY - oldCenterY * newScale,
      };
    });
  }, [scale, stageSize]);

  const handleZoomOut = useCallback(() => {
    const newScale = scale / 1.2;
    if (newScale < 0.1) return;
    
    setScale(newScale);
    
    // Adjust position to zoom toward center
    setPosition(position => {
      const centerX = stageSize.width / 2;
      const centerY = stageSize.height / 2;
      const oldCenterX = (centerX - position.x) / scale;
      const oldCenterY = (centerY - position.y) / scale;
      
      return {
        x: centerX - oldCenterX * newScale,
        y: centerY - oldCenterY * newScale,
      };
    });
  }, [scale, stageSize]);

  const handleResetZoom = useCallback((imageWidth: number, imageHeight: number) => {
    if (stageSize.width && stageSize.height) {
      const scaleX = stageSize.width / imageWidth;
      const scaleY = stageSize.height / imageHeight;
      const newScale = Math.min(scaleX, scaleY) * 0.9;
      
      setScale(newScale);
      setPosition({
        x: (stageSize.width - imageWidth * newScale) / 2,
        y: (stageSize.height - imageHeight * newScale) / 2,
      });
    }
  }, [stageSize]);

  const handleCancelDrawing = useCallback((isSelectMode: boolean) => {
    setDrawing(false);
    setPoints([]);
    
    if (isSelectMode) {
      setSelectionBox(null);
    }
  }, []);

  const value = {
    // State
    tool,
    setTool,
    lastUsedTool,
    drawing,
    setDrawing,
    points, 
    setPoints,
    scale,
    setScale,
    position,
    setPosition,
    isImageLoaded,
    setIsImageLoaded,
    isDragging,
    setIsDragging,
    isSpacePressed,
    setIsSpacePressed,
    selectedLabelId,
    setSelectedLabelId,
    highlightedLabelId,
    setHighlightedLabelId,
    selectionBox,
    setSelectionBox,
    stageSize,
    setStageSize,
    
    // Functions
    resetDrawing,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleCancelDrawing,
  };
  
  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

// Custom hook to use the canvas context
export function useCanvas() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}
