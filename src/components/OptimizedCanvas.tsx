
import { useRef, useEffect, useCallback, memo } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/hooks/useDummyData";
import { useCanvasState } from "@/hooks/useCanvasState";
import { useCanvasInteractions } from "@/hooks/useCanvasInteractions";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { CanvasZoomControls } from "@/components/canvas/CanvasZoomControls";
import { CanvasLabels } from "@/components/canvas/CanvasLabels";
import { CanvasDrawing } from "@/components/canvas/CanvasDrawing";

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
  const {
    tool, setTool,
    selectedLabelId, setSelectedLabelId,
    drawing, setDrawing,
    points, setPoints,
    scale, setScale,
    position, setPosition,
    stageSize, setStageSize,
    isImageLoaded, setIsImageLoaded,
    selectionBox, setSelectionBox,
    isDragging, setIsDragging,
    handleZoomIn, handleZoomOut, handleResetZoom, handleCancelDrawing
  } = useCanvasState();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const { toast } = useToast();

  // Canvas interactions
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDblClick,
    handleWheel
  } = useCanvasInteractions({
    isSelectMode,
    tool,
    drawing,
    setDrawing,
    points,
    setPoints,
    position,
    setPosition,
    scale,
    selectionBox,
    setSelectionBox,
    isDragging,
    setIsDragging,
    onAddLabel,
    onSelectRegion,
    setTool
  });

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
  }, [image.thumbnail, stageSize, toast, setIsImageLoaded, setScale, setPosition]);

  // Handle label selection
  const handleLabelSelect = useCallback((labelId: string) => {
    if (isSelectMode) return; // Disable selection in selection mode
    setSelectedLabelId(selectedLabelId === labelId ? null : labelId);
  }, [isSelectMode, selectedLabelId, setSelectedLabelId]);

  // Delete currently selected label
  const handleDeleteSelected = useCallback(() => {
    if (selectedLabelId) {
      onDeleteLabel(selectedLabelId);
      setSelectedLabelId(null);
    }
  }, [selectedLabelId, onDeleteLabel, setSelectedLabelId]);

  // Use useEffect to set up event listeners once
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    // Set up event handlers
    const handleStageMouseDown = (e: any) => {
      handleMouseDown(e, stageRef, imageRef, isImageLoaded);
    };
    
    const handleStageMouseMove = (e: any) => {
      handleMouseMove(e, stageRef, isImageLoaded);
    };
    
    const handleStageMouseUp = (e: any) => {
      handleMouseUp(e, stageRef, imageRef, isImageLoaded);
    };
    
    const handleStageDblClick = (e: any) => {
      handleDblClick(e);
    };
    
    const handleStageWheel = (e: any) => {
      handleWheel(e, stageRef);
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
  }, [
    stageRef, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp, 
    handleDblClick, 
    handleWheel, 
    isImageLoaded
  ]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* Toolbar */}
      <CanvasToolbar 
        isSelectMode={isSelectMode}
        tool={tool}
        setTool={setTool}
        selectedLabelId={selectedLabelId}
        drawing={drawing}
        onDeleteSelected={handleDeleteSelected}
        onCancelDrawing={() => handleCancelDrawing(isSelectMode)}
      />

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
          <CanvasLabels 
            labels={image.labels}
            selectedLabelId={selectedLabelId}
            highlightedLabelId={highlightedLabelId}
            onLabelSelect={handleLabelSelect}
            onLabelHover={setHighlightedLabelId}
          />
          
          {/* Current drawing shape */}
          <CanvasDrawing 
            drawing={drawing}
            isSelectMode={isSelectMode}
            tool={tool}
            points={points}
            selectionBox={selectionBox}
          />
        </Layer>
      </Stage>

      {/* Zoom controls */}
      <CanvasZoomControls 
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={() => handleResetZoom(imageRef.current.width, imageRef.current.height)}
      />

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
