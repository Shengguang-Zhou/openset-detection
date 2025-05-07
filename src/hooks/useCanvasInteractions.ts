
import { useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

interface CanvasInteractionsProps {
  isSelectMode: boolean;
  tool: "select" | "rect" | "polygon" | "point";
  setTool: (tool: "select" | "rect" | "polygon" | "point") => void;
  drawing: boolean;
  setDrawing: (drawing: boolean) => void;
  points: number[];
  setPoints: (points: number[]) => void;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
  scale: number;
  setScale: (scale: number) => void;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  setSelectionBox: (box: { x: number; y: number; width: number; height: number } | null) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  onAddLabel: (label: any) => void;
  onLabelCreated: (labelType: string, coordinates: any) => void; // New callback
  onSelectRegion?: (region: { x: number; y: number; width: number; height: number }) => void;
}

export function useCanvasInteractions({
  isSelectMode,
  tool,
  setTool,
  drawing,
  setDrawing,
  points,
  setPoints,
  position,
  setPosition,
  scale,
  setScale,
  selectionBox,
  setSelectionBox,
  isDragging,
  setIsDragging,
  onAddLabel,
  onLabelCreated, // New callback
  onSelectRegion
}: CanvasInteractionsProps) {
  const { toast } = useToast();
  const lastCoordinatesRef = useRef<any>(null);
  
  // Handle mouse down event
  const handleMouseDown = useCallback((e: any, stageRef: any, imageRef: any, isImageLoaded: boolean) => {
    if (!isImageLoaded) return;
    
    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const x = (pointerPos.x - position.x) / scale;
    const y = (pointerPos.y - position.y) / scale;
    
    if (e.evt.button === 1) { // Middle mouse button for panning
      setIsDragging(true);
      return;
    }
    
    if (isSelectMode) {
      // In selection mode for reference image
      setSelectionBox({
        x: x,
        y: y,
        width: 0,
        height: 0
      });
      setDrawing(true);
      return;
    }

    if (tool === "select") return;

    if (tool === "rect" && !drawing) {
      setDrawing(true);
      setPoints([x, y, x, y]); // Initial rectangle: [x1, y1, x2, y2]
    } else if (tool === "point" && !drawing) {
      // Save point coordinates for label selection dialog
      lastCoordinatesRef.current = [[x, y]];
      onLabelCreated("point", [[x, y]]);
    } else if (tool === "polygon") {
      if (!drawing) {
        setDrawing(true);
        setPoints([x, y]);
      } else {
        // Continue adding polygon points
        setPoints([...points, x, y]);
      }
    }
  }, [isSelectMode, tool, drawing, points, scale, position, onLabelCreated, setDrawing, setPoints, setSelectionBox, setIsDragging]);

  // Handle mouse move event
  const handleMouseMove = useCallback((e: any, stageRef: any, isImageLoaded: boolean) => {
    if (!isImageLoaded) return;

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    
    if (isDragging) {
      // Handle panning
      setPosition({
        x: position.x + e.evt.movementX,
        y: position.y + e.evt.movementY
      });
      return;
    }
    
    if (!drawing) return;
    
    const x = (pointerPos.x - position.x) / scale;
    const y = (pointerPos.y - position.y) / scale;

    if (isSelectMode && selectionBox) {
      // Update selection box for reference image
      setSelectionBox({
        x: selectionBox.x,
        y: selectionBox.y,
        width: x - selectionBox.x,
        height: y - selectionBox.y
      });
      return;
    }

    if (tool === "select") return;

    if (tool === "rect") {
      // Update rectangle endpoint
      setPoints([points[0], points[1], x, y]);
    } else if (tool === "polygon" && points.length >= 2) {
      // Preview next polygon point
      const updatedPoints = [...points.slice(0, points.length)];
      setPoints(updatedPoints);
    }
  }, [isSelectMode, tool, drawing, isDragging, points, position, scale, selectionBox, setPoints, setPosition, setSelectionBox]);

  // Handle mouse up event
  const handleMouseUp = useCallback((e: any, stageRef: any, imageRef: any, isImageLoaded: boolean) => {
    if (isDragging) {
      setIsDragging(false);
      return;
    }
    
    if (!isImageLoaded || !drawing) return;

    if (isSelectMode && selectionBox) {
      // Finalize selection box for reference image
      const finalBox = {
        x: Math.min(selectionBox.x, selectionBox.x + selectionBox.width),
        y: Math.min(selectionBox.y, selectionBox.y + selectionBox.height),
        width: Math.abs(selectionBox.width),
        height: Math.abs(selectionBox.height)
      };
      
      // Only use the selection if it has a reasonable size
      if (finalBox.width > 10 && finalBox.height > 10) {
        setSelectionBox(finalBox);
        if (onSelectRegion) {
          onSelectRegion(finalBox);
        }
      } else {
        setSelectionBox(null);
      }
      
      setDrawing(false);
      return;
    }

    if (tool === "select") return;

    if (tool === "rect") {
      const x1 = points[0];
      const y1 = points[1];
      const x2 = points[2];
      const y2 = points[3];

      // Ensure rectangle has a certain size
      if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
        const coordinates = [
          [Math.min(x1, x2), Math.min(y1, y2)],
          [Math.max(x1, x2), Math.max(y1, y2)]
        ];
        
        // Save coordinates for label selection dialog
        lastCoordinatesRef.current = coordinates;
        onLabelCreated("rect", coordinates);
      }

      setDrawing(false);
      setPoints([]);
      // Don't change the tool to select after creation
    }
  }, [isSelectMode, tool, drawing, isDragging, points, selectionBox, onLabelCreated, onSelectRegion, setDrawing, setIsDragging, setPoints, setSelectionBox]);

  // Double click to complete polygon
  const handleDblClick = useCallback((e: any) => {
    if (tool !== "polygon" || !drawing || points.length < 6) return; // At least 3 points needed

    // Convert points to coordinate pairs
    const coordinates = [];
    for (let i = 0; i < points.length; i += 2) {
      coordinates.push([points[i], points[i + 1]]);
    }

    // Save coordinates for label selection dialog
    lastCoordinatesRef.current = coordinates;
    onLabelCreated("polygon", coordinates);

    setDrawing(false);
    setPoints([]);
    // Don't change the tool to select after creation
  }, [tool, drawing, points, onLabelCreated, setDrawing, setPoints]);

  // Handle wheel event for zooming
  const handleWheel = useCallback((e: any, stageRef: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointerPos.x - position.x) / scale,
      y: (pointerPos.y - position.y) / scale,
    };
    
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? scale * scaleBy : scale / scaleBy;
    
    // Limit zoom level
    if (newScale < 0.1 || newScale > 10) return;
    
    // Adjust position to zoom toward mouse position
    const newPos = {
      x: pointerPos.x - mousePointTo.x * newScale,
      y: pointerPos.y - mousePointTo.y * newScale,
    };
    
    setScale(newScale);
    setPosition(newPos);
  }, [scale, position, setScale, setPosition]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDblClick,
    handleWheel
  };
}
