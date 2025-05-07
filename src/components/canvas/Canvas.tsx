
import { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/hooks/useDummyData";
import { useCanvas } from "@/contexts/CanvasContext";
import { CanvasControls } from "@/components/canvas/CanvasControls";
import { CanvasLabels } from "@/components/canvas/CanvasLabels";
import { SelectionBox } from "@/components/canvas/SelectionBox";
import LabelSelectionDialog from "@/components/LabelSelectionDialog";

interface Image {
  id: string;
  fileName: string;
  thumbnail: string;
  labels: Label[];
}

interface CanvasProps {
  image: Image;
  onAddLabel: (label: Omit<Label, "id">) => void;
  onUpdateLabel: (id: string, label: Partial<Label>) => void;
  onDeleteLabel: (id: string) => void;
  isSelectMode?: boolean;
  onSelectRegion?: (region: {x: number, y: number, width: number, height: number}) => void;
  categories: string[]; 
}

export function Canvas({
  image,
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
  isSelectMode = false,
  onSelectRegion,
  categories
}: CanvasProps) {
  const {
    tool, setTool,
    drawing, setDrawing,
    points, setPoints,
    scale, setScale,
    position, setPosition,
    stageSize, setStageSize,
    isImageLoaded, setIsImageLoaded,
    selectionBox, setSelectionBox,
    isDragging, setIsDragging,
    isSpacePressed, setIsSpacePressed,
    selectedLabelId, setSelectedLabelId,
    highlightedLabelId, setHighlightedLabelId,
    pendingLabelCoordinates, setPendingLabelCoordinates,
    pendingLabelType, setPendingLabelType,
    handleZoomIn, handleZoomOut, handleResetZoom, handleCancelDrawing
  } = useCanvas();
  
  // State for label selection dialog
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const { toast } = useToast();

  // Handle label selection from dialog
  const handleLabelSelected = useCallback((category: string) => {
    if (!pendingLabelCoordinates || !pendingLabelType) return;
    
    const newLabel = {
      category,
      type: pendingLabelType,
      coordinates: pendingLabelCoordinates,
    };
    
    onAddLabel(newLabel);
    
    toast({
      title: "标签已添加",
      description: `已成功添加「${category}」标签`,
    });
    
    // Reset pending label state
    setPendingLabelCoordinates(null);
    setPendingLabelType(null);
    setIsLabelDialogOpen(false);
  }, [pendingLabelCoordinates, pendingLabelType, onAddLabel, setPendingLabelCoordinates, setPendingLabelType, toast]);

  // Handle label update (coordinates)
  const handleLabelCoordinatesUpdate = useCallback((labelId: string, newCoordinates: number[][]) => {
    onUpdateLabel(labelId, { coordinates: newCoordinates });
  }, [onUpdateLabel]);

  // Reset selection box when leaving selection mode
  useEffect(() => {
    if (!isSelectMode) {
      setSelectionBox(null);
    }
  }, [isSelectMode, setSelectionBox]);

  // Adjusting canvas size to fit container
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setStageSize({
        width: clientWidth,
        height: clientHeight,
      });
    }
  }, [setStageSize]);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  // Loading image with proper error handling
  useEffect(() => {
    const img = imageRef.current;
    if (!image?.thumbnail) {
      setIsImageLoaded(false);
      return;
    }

    // Reset image loading state
    setIsImageLoaded(false);
    
    // Use the actual image URL from the image prop
    img.src = image.thumbnail;
    
    img.onload = () => {
      console.log("Image loaded successfully:", img.width, img.height);
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
    
    img.onerror = (error) => {
      console.error("Image failed to load:", error);
      toast({
        variant: "destructive",
        title: "图像加载失败",
        description: "无法加载图像，请稍后重试",
      });
      setIsImageLoaded(false);
    };
  }, [image?.thumbnail, stageSize, toast, setIsImageLoaded, setScale, setPosition]);

  // Set up canvas interactions
  const handleMouseDown = useCallback((e: any) => {
    if (!isImageLoaded) return;
    
    // Get mouse position relative to stage
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    
    // Check if space is pressed or in move mode
    if (isSpacePressed || tool === "move") {
      setIsDragging(true);
      return;
    }
    
    // Handle tool-specific logic
    if (isSelectMode) {
      // Start selection box for reference image
      setSelectionBox({
        x: (point.x - position.x) / scale,
        y: (point.y - position.y) / scale,
        width: 0,
        height: 0
      });
      setDrawing(true);
      return;
    }
    
    if (tool === "select") {
      // For select tool, check if clicking on a label
      // This is handled in CanvasLabels component
      return;
    }
    
    // Drawing tools
    if (tool === "rect") {
      setPoints([(point.x - position.x) / scale, (point.y - position.y) / scale]);
      setDrawing(true);
    } else if (tool === "polygon") {
      if (!drawing) {
        setPoints([(point.x - position.x) / scale, (point.y - position.y) / scale]);
        setDrawing(true);
      } else {
        // Add new point to existing polygon
        setPoints([...points, (point.x - position.x) / scale, (point.y - position.y) / scale]);
      }
    } else if (tool === "point") {
      setPoints([(point.x - position.x) / scale, (point.y - position.y) / scale]);
      setDrawing(true);
      
      // For point, immediately get ready for label selection
      const pointCoordinates = [[(point.x - position.x) / scale, (point.y - position.y) / scale]];
      setPendingLabelType("point");
      setPendingLabelCoordinates(pointCoordinates);
      setIsLabelDialogOpen(true);
      setDrawing(false);
      setPoints([]);
    }
  }, [isImageLoaded, isSpacePressed, tool, isSelectMode, position, scale, drawing, points, setIsDragging, setSelectionBox, setDrawing, setPoints, setPendingLabelType, setPendingLabelCoordinates]);

  const handleMouseMove = useCallback((e: any) => {
    if (!drawing || !isImageLoaded) return;
    
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    
    if (isSelectMode) {
      // Update selection box size
      if (selectionBox) {
        setSelectionBox({
          ...selectionBox,
          width: (point.x - position.x) / scale - selectionBox.x,
          height: (point.y - position.y) / scale - selectionBox.y
        });
      }
      return;
    }
    
    // Update rectangle drawing
    if (tool === "rect") {
      setPoints([
        points[0], 
        points[1], 
        (point.x - position.x) / scale, 
        (point.y - position.y) / scale
      ]);
    }
  }, [drawing, isImageLoaded, isSelectMode, selectionBox, tool, points, position, scale, setSelectionBox, setPoints]);

  const handleMouseUp = useCallback((e: any) => {
    if (isSpacePressed || tool === "move") {
      setIsDragging(false);
      return;
    }
    
    if (isSelectMode && drawing) {
      // Finalize selection box
      if (selectionBox && Math.abs(selectionBox.width) > 5 && Math.abs(selectionBox.height) > 5) {
        // Normalize the selection box (make sure width/height are positive)
        const normalizedBox = {
          x: selectionBox.width < 0 ? selectionBox.x + selectionBox.width : selectionBox.x,
          y: selectionBox.height < 0 ? selectionBox.y + selectionBox.height : selectionBox.y,
          width: Math.abs(selectionBox.width),
          height: Math.abs(selectionBox.height)
        };
        
        if (onSelectRegion) {
          onSelectRegion(normalizedBox);
        }
      }
      setDrawing(false);
      return;
    }
    
    if (tool === "rect" && drawing) {
      if (points.length === 4) {
        // Finish rectangle drawing
        const x1 = points[0];
        const y1 = points[1];
        const x2 = points[2];
        const y2 = points[3];
        
        // Only create if rectangle has some size
        if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
          // Prepare coordinates for label dialog
          const rectCoordinates = [
            [Math.min(x1, x2), Math.min(y1, y2)],
            [Math.max(x1, x2), Math.max(y1, y2)]
          ];
          
          setPendingLabelType("rect");
          setPendingLabelCoordinates(rectCoordinates);
          setIsLabelDialogOpen(true);
        }
        
        setDrawing(false);
        setPoints([]);
      }
    }
    
    setIsDragging(false);
  }, [isSpacePressed, tool, isSelectMode, drawing, selectionBox, points, onSelectRegion, setIsDragging, setDrawing, setPoints, setPendingLabelType, setPendingLabelCoordinates]);

  const handleDblClick = useCallback((e: any) => {
    if (tool === "polygon" && drawing) {
      // Complete polygon on double click
      if (points.length >= 6) { // At least 3 points (6 coordinates)
        const formattedPoints: number[][] = [];
        for (let i = 0; i < points.length; i += 2) {
          formattedPoints.push([points[i], points[i + 1]]);
        }
        
        setPendingLabelType("polygon");
        setPendingLabelCoordinates(formattedPoints);
        setIsLabelDialogOpen(true);
      }
      
      setDrawing(false);
      setPoints([]);
    }
  }, [tool, drawing, points, setDrawing, setPoints, setPendingLabelType, setPendingLabelCoordinates]);

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const oldScale = scale;
    
    // Get pointer position
    const pointer = stage.getPointerPosition();
    
    // Calculate point in unscaled coordinates
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };
    
    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    
    if (newScale < 0.1 || newScale > 10) return;
    
    // Calculate new position
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setPosition(newPos);
    setScale(newScale);
  }, [scale, position, setPosition, setScale]);
  
  // Set up event listeners on mount
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    // Set up event handlers for the stage
    stage.on('mousedown touchstart', handleMouseDown);
    stage.on('mousemove touchmove', handleMouseMove);
    stage.on('mouseup touchend', handleMouseUp);
    stage.on('dblclick', handleDblClick);
    stage.on('wheel', handleWheel);
    
    // Clean up on unmount
    return () => {
      stage.off('mousedown touchstart', handleMouseDown);
      stage.off('mousemove touchmove', handleMouseMove);
      stage.off('mouseup touchend', handleMouseUp);
      stage.off('dblclick', handleDblClick);
      stage.off('wheel', handleWheel);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleDblClick, handleWheel]);

  // Space key handler for temporary move mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        setIsDragging(false);
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
  }, [isSpacePressed, setIsSpacePressed, setIsDragging]);

  // Handle drag event
  const handleDragMove = useCallback((e: any) => {
    if (isDragging && (isSpacePressed || tool === 'move')) {
      const stage = stageRef.current;
      const newPosition = {
        x: position.x + e.evt.movementX,
        y: position.y + e.evt.movementY
      };
      setPosition(newPosition);
    }
  }, [isDragging, isSpacePressed, tool, position, setPosition]);

  // Set cursor based on tool and state
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
    } else if (tool === "move" || isSpacePressed) {
      document.body.style.cursor = 'grab';
    } else if (tool === "select") {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'crosshair';
    }
  }, [tool, isDragging, isSpacePressed]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* Canvas controls */}
      <CanvasControls 
        isSelectMode={isSelectMode}
        tool={tool}
        setTool={setTool}
        onCancelDrawing={() => handleCancelDrawing(isSelectMode)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={() => handleResetZoom(imageRef.current.width, imageRef.current.height)}
      />

      {/* Annotation tip */}
      {drawing && tool === "polygon" && !isSelectMode && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 bg-white shadow-md rounded-lg px-3 py-1 text-sm">
          单击添加点，双击完成
        </div>
      )}
      
      {/* Space key tip */}
      {isSpacePressed && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 bg-white shadow-md rounded-lg px-3 py-1 text-sm">
          空格键移动模式
        </div>
      )}

      {/* Konva stage */}
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        onDragMove={handleDragMove}
        draggable={isDragging && (isSpacePressed || tool === 'move')}
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
          <CanvasLabels 
            labels={image.labels}
            selectedLabelId={selectedLabelId}
            highlightedLabelId={highlightedLabelId}
            onLabelSelect={setSelectedLabelId}
            onLabelHover={setHighlightedLabelId}
            onLabelUpdate={handleLabelCoordinatesUpdate}
            onLabelDelete={onDeleteLabel}
          />
          
          {/* Current drawing shape or selection box */}
          <SelectionBox 
            drawing={drawing}
            isSelectMode={isSelectMode}
            tool={tool}
            points={points}
            selectionBox={selectionBox}
          />
        </Layer>
      </Stage>

      {/* Loading indicator */}
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">加载图像中...</p>
          </div>
        </div>
      )}

      {/* Label selection dialog */}
      <LabelSelectionDialog
        isOpen={isLabelDialogOpen}
        onClose={() => {
          setIsLabelDialogOpen(false);
          setPendingLabelCoordinates(null);
          setPendingLabelType(null);
        }}
        onSelectLabel={handleLabelSelected}
        existingLabels={categories}
      />
    </div>
  );
}
