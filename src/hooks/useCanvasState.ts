
import { useState, useCallback } from "react";

export function useCanvasState() {
  const [tool, setTool] = useState<"select" | "rect" | "polygon" | "point">("select");
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<number[]>([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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
    } else {
      setTool("select");
    }
  }, []);

  return {
    tool,
    setTool,
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
    resetDrawing,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleCancelDrawing
  };
}
