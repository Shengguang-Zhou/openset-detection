
import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Stage, Layer, Rect, Line, Circle, Group, Text } from "react-konva";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { RectangleHorizontal, Pencil, ZoomIn, ZoomOut } from "lucide-react";
import { Label } from "@/hooks/useDummyData";

interface Image {
  id: string;
  fileName: string;
  thumbnail: string;
  labels: Label[];
}

interface OptimizedCanvasProps {
  image: Image;
  onAddLabel: (label: Omit<Label, "id">) => void;
  onUpdateLabel: (id: string, label: Partial<Label>) => void;
  onDeleteLabel: (id: string) => void;
  isSelectMode?: boolean;
  onSelectRegion?: (region: {x: number, y: number, width: number, height: number}) => void;
  highlightedLabelId: string | null;
  setHighlightedLabelId: (id: string | null) => void;
}

// Using memo for performance optimization
export const OptimizedCanvas = memo(({
  image,
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
  isSelectMode = false,
  onSelectRegion,
  highlightedLabelId,
  setHighlightedLabelId
}: OptimizedCanvasProps) => {
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const { toast } = useToast();

  // Reset selection box when leaving selection mode
  useEffect(() => {
    if (!isSelectMode) {
      setSelectionBox(null);
    }
  }, [isSelectMode]);

  // Adjusting canvas size to fit container
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setStageSize({
        width: clientWidth,
        height: clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  // Loading image
  useEffect(() => {
    const img = imageRef.current;
    img.src = image.thumbnail || "https://picsum.photos/800/600";
    img.onload = () => {
      setIsImageLoaded(true);
      
      // Calculate appropriate scale to fit the stage
      if (stageSize.width && stageSize.height) {
        const scaleX = stageSize.width / img.width;
        const scaleY = stageSize.height / img.height;
        const newScale = Math.min(scaleX, scaleY) * 0.9;
        
        setScale(newScale);
        setPosition({
          x: (stageSize.width - img.width * newScale) / 2,
          y: (stageSize.height - img.height * newScale) / 2,
        });
      }
    };
    img.onerror = () => {
      toast({
        variant: "destructive",
        title: "图像加载失败",
        description: "无法加载图像，请稍后重试",
      });
      setIsImageLoaded(false);
    };
  }, [image.thumbnail, stageSize, toast]);

  // Handling mouse down event
  const handleMouseDown = useCallback((e: any) => {
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
      // Point directly creates a label
      onAddLabel({
        category: "未标注",
        type: "point",
        coordinates: [[x, y]],
      });
      setTool("select"); // Switch back to select mode after creation
    } else if (tool === "polygon") {
      if (!drawing) {
        setDrawing(true);
        setPoints([x, y]);
      } else {
        // Continue adding polygon points
        setPoints([...points, x, y]);
      }
    }
  }, [isImageLoaded, isSelectMode, tool, drawing, points, scale, position, onAddLabel]);

  // Handling mouse move event
  const handleMouseMove = useCallback((e: any) => {
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
  }, [isImageLoaded, drawing, isDragging, isSelectMode, selectionBox, tool, points, scale, position]);

  // Handling mouse up event
  const handleMouseUp = useCallback((e: any) => {
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
        onAddLabel({
          category: "未标注",
          type: "rect",
          coordinates: [
            [Math.min(x1, x2), Math.min(y1, y2)],
            [Math.max(x1, x2), Math.max(y1, y2)],
          ],
        });
      }

      setDrawing(false);
      setPoints([]);
      setTool("select"); // Switch back to select mode after creation
    }
  }, [isImageLoaded, drawing, isDragging, isSelectMode, selectionBox, tool, points, onAddLabel, onSelectRegion]);

  // Double click to complete polygon
  const handleDblClick = useCallback((e: any) => {
    if (tool !== "polygon" || !drawing || points.length < 6) return; // At least 3 points needed

    // Convert points to coordinate pairs
    const coordinates = [];
    for (let i = 0; i < points.length; i += 2) {
      coordinates.push([points[i], points[i + 1]]);
    }

    onAddLabel({
      category: "未标注",
      type: "polygon",
      coordinates,
    });

    setDrawing(false);
    setPoints([]);
    setTool("select"); // Switch back to select mode after creation
  }, [tool, drawing, points, onAddLabel]);

  // Handle label selection
  const handleLabelSelect = useCallback((labelId: string) => {
    if (isSelectMode) return; // Disable selection in selection mode
    setSelectedLabelId(selectedLabelId === labelId ? null : labelId);
  }, [isSelectMode, selectedLabelId]);

  // Handle wheel event for zooming
  const handleWheel = useCallback((e: any) => {
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
    
    setScale(newScale);
    
    // Adjust position to zoom toward mouse position
    const newPos = {
      x: pointerPos.x - mousePointTo.x * newScale,
      y: pointerPos.y - mousePointTo.y * newScale,
    };
    
    setPosition(newPos);
  }, [scale, position]);

  // Delete currently selected label
  const handleDeleteSelected = () => {
    if (selectedLabelId) {
      onDeleteLabel(selectedLabelId);
      setSelectedLabelId(null);
    }
  };

  // Cancel current drawing
  const handleCancelDrawing = () => {
    setDrawing(false);
    setPoints([]);
    
    if (isSelectMode) {
      setSelectionBox(null);
    } else {
      setTool("select");
    }
  };

  // Render labels with hover effect
  const renderLabels = useCallback(() => {
    return image.labels.map((label) => {
      const isSelected = label.id === selectedLabelId;
      const isHighlighted = label.id === highlightedLabelId;
      const opacity = isHighlighted ? 0.7 : isSelected ? 0.5 : 0.3;
      
      if (label.type === "rect") {
        const [topLeft, bottomRight] = label.coordinates;
        const width = bottomRight[0] - topLeft[0];
        const height = bottomRight[1] - topLeft[1];

        return (
          <Group key={label.id}>
            <Rect
              x={topLeft[0]}
              y={topLeft[1]}
              width={width}
              height={height}
              stroke={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
              strokeWidth={isSelected || isHighlighted ? 2.5 : 1.5}
              dash={label.isAiSuggestion ? [5, 2] : undefined}
              fill={isSelected || isHighlighted ? (label.isAiSuggestion ? `rgba(37, 99, 235, ${opacity})` : `rgba(249, 115, 22, ${opacity})`) : "transparent"}
              onClick={() => handleLabelSelect(label.id)}
              onMouseEnter={() => setHighlightedLabelId(label.id)}
              onMouseLeave={() => setHighlightedLabelId(null)}
            />
            <Text
              x={topLeft[0]}
              y={topLeft[1] - 20}
              text={`${label.category} ${label.confidence ? `(${Math.round(label.confidence * 100)}%)` : ""}`}
              fontSize={14}
              fill="white"
              padding={4}
              background={label.isAiSuggestion ? "#2563EB" : "#F97316"}
            />
          </Group>
        );
      } else if (label.type === "polygon") {
        const flatPoints = label.coordinates.flat();
        
        return (
          <Group key={label.id}>
            <Line
              points={flatPoints}
              closed
              stroke={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
              strokeWidth={isSelected || isHighlighted ? 2.5 : 1.5}
              dash={label.isAiSuggestion ? [5, 2] : undefined}
              fill={isSelected || isHighlighted ? (label.isAiSuggestion ? `rgba(37, 99, 235, ${opacity})` : `rgba(249, 115, 22, ${opacity})`) : "transparent"}
              onClick={() => handleLabelSelect(label.id)}
              onMouseEnter={() => setHighlightedLabelId(label.id)}
              onMouseLeave={() => setHighlightedLabelId(null)}
            />
            {label.coordinates.map((point, i) => (
              <Circle
                key={i}
                x={point[0]}
                y={point[1]}
                radius={isSelected || isHighlighted ? 4 : 3}
                fill={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
              />
            ))}
            <Text
              x={label.coordinates[0][0]}
              y={label.coordinates[0][1] - 20}
              text={`${label.category} ${label.confidence ? `(${Math.round(label.confidence * 100)}%)` : ""}`}
              fontSize={14}
              fill="white"
              padding={4}
              background={label.isAiSuggestion ? "#2563EB" : "#F97316"}
            />
          </Group>
        );
      } else if (label.type === "point") {
        const [point] = label.coordinates;
        
        return (
          <Group key={label.id}>
            <Circle
              x={point[0]}
              y={point[1]}
              radius={isSelected || isHighlighted ? 6 : 4}
              stroke={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
              strokeWidth={2}
              fill={isSelected || isHighlighted ? (label.isAiSuggestion ? `rgba(37, 99, 235, ${opacity})` : `rgba(249, 115, 22, ${opacity})`) : (label.isAiSuggestion ? "#2563EB" : "#F97316")}
              onClick={() => handleLabelSelect(label.id)}
              onMouseEnter={() => setHighlightedLabelId(label.id)}
              onMouseLeave={() => setHighlightedLabelId(null)}
            />
            <Text
              x={point[0] + 10}
              y={point[1] - 10}
              text={`${label.category} ${label.confidence ? `(${Math.round(label.confidence * 100)}%)` : ""}`}
              fontSize={14}
              fill="white"
              padding={4}
              background={label.isAiSuggestion ? "#2563EB" : "#F97316"}
            />
          </Group>
        );
      }
      
      return null;
    });
  }, [image.labels, selectedLabelId, highlightedLabelId, handleLabelSelect, setHighlightedLabelId]);

  // Render current drawing shape
  const renderDrawing = () => {
    if (!drawing) return null;

    if (isSelectMode && selectionBox) {
      // Render the selection rectangle for reference image
      return (
        <Rect
          x={Math.min(selectionBox.x, selectionBox.x + selectionBox.width)}
          y={Math.min(selectionBox.y, selectionBox.y + selectionBox.height)}
          width={Math.abs(selectionBox.width)}
          height={Math.abs(selectionBox.height)}
          stroke="#F42A35"
          strokeWidth={2.5}
          dash={[5, 2]}
          fill="rgba(244, 42, 53, 0.1)"
        />
      );
    }

    if (points.length === 0) return null;

    if (tool === "rect" && points.length === 4) {
      const x1 = points[0];
      const y1 = points[1];
      const x2 = points[2];
      const y2 = points[3];
      const width = x2 - x1;
      const height = y2 - y1;

      return (
        <Rect
          x={Math.min(x1, x2)}
          y={Math.min(y1, y2)}
          width={Math.abs(width)}
          height={Math.abs(height)}
          stroke="#F97316"
          strokeWidth={2}
          dash={[5, 2]}
        />
      );
    } else if (tool === "polygon" && points.length >= 2) {
      return (
        <Line
          points={points}
          stroke="#F97316"
          strokeWidth={2}
          dash={[5, 2]}
        />
      );
    }

    return null;
  };

  const handleZoomIn = () => {
    const newScale = scale * 1.2;
    if (newScale > 10) return;
    
    setScale(newScale);
    
    // Adjust position to zoom toward center
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    const oldCenterX = (centerX - position.x) / scale;
    const oldCenterY = (centerY - position.y) / scale;
    
    const newPos = {
      x: centerX - oldCenterX * newScale,
      y: centerY - oldCenterY * newScale,
    };
    
    setPosition(newPos);
  };

  const handleZoomOut = () => {
    const newScale = scale / 1.2;
    if (newScale < 0.1) return;
    
    setScale(newScale);
    
    // Adjust position to zoom toward center
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    const oldCenterX = (centerX - position.x) / scale;
    const oldCenterY = (centerY - position.y) / scale;
    
    const newPos = {
      x: centerX - oldCenterX * newScale,
      y: centerY - oldCenterY * newScale,
    };
    
    setPosition(newPos);
  };

  const handleResetZoom = () => {
    if (stageSize.width && stageSize.height && imageRef.current) {
      const scaleX = stageSize.width / imageRef.current.width;
      const scaleY = stageSize.height / imageRef.current.height;
      const newScale = Math.min(scaleX, scaleY) * 0.9;
      
      setScale(newScale);
      setPosition({
        x: (stageSize.width - imageRef.current.width * newScale) / 2,
        y: (stageSize.height - imageRef.current.height * newScale) / 2,
      });
    }
  };

  // Use useEffect to set up event listeners once
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    // Set up event handlers
    const handleStageMouseDown = (e: any) => {
      handleMouseDown(e);
    };
    
    const handleStageMouseMove = (e: any) => {
      handleMouseMove(e);
    };
    
    const handleStageMouseUp = (e: any) => {
      handleMouseUp(e);
    };
    
    const handleStageDblClick = (e: any) => {
      handleDblClick(e);
    };
    
    const handleStageWheel = (e: any) => {
      handleWheel(e);
    };
    
    // Add them to the stage
    stage.on('mousedown touchstart', handleStageMouseDown);
    stage.on('mousemove touchmove', handleStageMouseMove);
    stage.on('mouseup touchend', handleStageMouseUp);
    stage.on('dblclick', handleStageDblClick);
    stage.on('wheel', handleStageWheel);
    
    // Clean up on unmount
    return () => {
      stage.off('mousedown touchstart', handleStageMouseDown);
      stage.off('mousemove touchmove', handleStageMouseMove);
      stage.off('mouseup touchend', handleStageMouseUp);
      stage.off('dblclick', handleStageDblClick);
      stage.off('wheel', handleStageWheel);
    };
  }, [stageRef, handleMouseDown, handleMouseMove, handleMouseUp, handleDblClick, handleWheel]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white shadow-md rounded-lg p-1 flex space-x-1">
        {isSelectMode ? (
          <div className="flex items-center px-2 text-sm text-red-600 font-medium">
            请框选图像区域作为参考
          </div>
        ) : (
          <>
            <Button
              size="icon"
              variant={tool === "select" ? "default" : "outline"}
              onClick={() => setTool("select")}
              className={tool === "select" ? "bg-primary hover:bg-primary-hover" : ""}
            >
              <span className="sr-only">选择</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </Button>
            <Button
              size="icon"
              variant={tool === "rect" ? "default" : "outline"}
              onClick={() => setTool("rect")}
              className={tool === "rect" ? "bg-primary hover:bg-primary-hover" : ""}
            >
              <span className="sr-only">矩形</span>
              <RectangleHorizontal size={16} />
            </Button>
            <Button
              size="icon"
              variant={tool === "polygon" ? "default" : "outline"}
              onClick={() => setTool("polygon")}
              className={tool === "polygon" ? "bg-primary hover:bg-primary-hover" : ""}
            >
              <span className="sr-only">多边形</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4l7 4v8l-7 4-7-4V8l7-4z" />
              </svg>
            </Button>
            <Button
              size="icon"
              variant={tool === "point" ? "default" : "outline"}
              onClick={() => setTool("point")}
              className={tool === "point" ? "bg-primary hover:bg-primary-hover" : ""}
            >
              <span className="sr-only">点</span>
              <Pencil size={16} />
            </Button>
          </>
        )}
        
        {selectedLabelId && !isSelectMode && (
          <Button
            size="icon"
            variant="outline"
            onClick={handleDeleteSelected}
            className="border-red-500 hover:bg-red-50 text-red-500"
          >
            <span className="sr-only">删除</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </Button>
        )}
        
        {drawing && (
          <Button
            size="icon"
            variant="outline"
            onClick={handleCancelDrawing}
            className="border-red-500 hover:bg-red-50 text-red-500"
          >
            <span className="sr-only">取消</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        )}
      </div>

      {/* Annotation tip */}
      {drawing && tool === "polygon" && !isSelectMode && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 bg-white shadow-md rounded-lg px-3 py-1 text-sm">
          单击添加点，双击完成
        </div>
      )}

      {/* Konva stage */}
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
      >
        <Layer
          offsetX={-position.x / scale}
          offsetY={-position.y / scale}
          scaleX={scale}
          scaleY={scale}
        >
          {/* Background image */}
          {isImageLoaded && (
            <Rect
              width={imageRef.current.width}
              height={imageRef.current.height}
              fillPatternImage={imageRef.current}
            />
          )}
          
          {/* Labels */}
          {renderLabels()}
          
          {/* Current drawing shape */}
          {renderDrawing()}
        </Layer>
      </Stage>

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-4 z-10 bg-white shadow-md rounded-lg p-1 flex items-center">
        <Button size="icon" variant="outline" onClick={handleZoomOut} className="h-8 w-8 p-0">
          <span className="sr-only">缩小</span>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleResetZoom} className="px-2 mx-1 text-xs">
          {Math.round(scale * 100)}%
        </Button>
        <Button size="icon" variant="outline" onClick={handleZoomIn} className="h-8 w-8 p-0">
          <span className="sr-only">放大</span>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading indicator */}
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">加载图像中...</p>
          </div>
        </div>
      )}
      
      {/* Dragging cursor indicator */}
      {isDragging && (
        <div className="absolute inset-0 cursor-grabbing z-20 pointer-events-none" />
      )}
    </div>
  );
});
