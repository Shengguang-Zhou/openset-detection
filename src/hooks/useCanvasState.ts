
import { useState, useCallback, useEffect } from "react";

export function useCanvasState() {
  const [tool, setTool] = useState<"select" | "rect" | "polygon" | "point" | "move">("select");
  const [lastUsedTool, setLastUsedTool] = useState<"rect" | "polygon" | "point">("rect");
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<number[]>([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  // Keyboard event handlers for space key (temp move mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);
  
  // Wrapper for setTool that also updates lastUsedTool
  const handleSetTool = useCallback((newTool: "select" | "rect" | "polygon" | "point" | "move") => {
    setTool(newTool);
    if (newTool !== "select" && newTool !== "move") {
      setLastUsedTool(newTool);
    }
  }, []);
  
  const resetDrawing = useCallback(() => {
    setDrawing(false);
    setPoints([]);
  }, []);
  
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

  return {
    tool,
    setTool: handleSetTool,
    lastUsedTool,
    selectedLabelId,
    setSelectedLabelId,
    drawing,
    setDrawing,
    points,
    setPoints,
    scale,
    setScale,
    position,
    setPosition,
    stageSize,
    setStageSize,
    isImageLoaded,
    setIsImageLoaded,
    selectionBox,
    setSelectionBox,
    isDragging,
    setIsDragging,
    isSpacePressed,
    resetDrawing,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleCancelDrawing
  };
}
