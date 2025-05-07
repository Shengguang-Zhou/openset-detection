
import { MousePointer, Square, Hexagon, Circle, Move, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CanvasControlsProps {
  isSelectMode?: boolean;
  tool: "select" | "rect" | "polygon" | "point" | "move";
  setTool?: (tool: "select" | "rect" | "polygon" | "point" | "move") => void;
  onCancelDrawing: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function CanvasControls({
  isSelectMode = false,
  tool,
  setTool,
  onCancelDrawing,
  onZoomIn,
  onZoomOut,
  onResetZoom
}: CanvasControlsProps) {
  return (
    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 flex gap-1 bg-white shadow-md rounded-lg p-1 select-none">
      {/* Drawing tools */}
      {!isSelectMode && setTool && (
        <>
          <Button
            type="button"
            size="sm"
            variant={tool === "select" ? "default" : "ghost"}
            className={cn(
              "h-8 px-2",
              tool === "select" ? "bg-primary text-white" : "text-gray-700"
            )}
            onClick={() => setTool("select")}
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant={tool === "rect" ? "default" : "ghost"}
            className={cn(
              "h-8 px-2",
              tool === "rect" ? "bg-primary text-white" : "text-gray-700"
            )}
            onClick={() => setTool("rect")}
          >
            <Square className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant={tool === "polygon" ? "default" : "ghost"}
            className={cn(
              "h-8 px-2",
              tool === "polygon" ? "bg-primary text-white" : "text-gray-700"
            )}
            onClick={() => setTool("polygon")}
          >
            <Hexagon className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant={tool === "point" ? "default" : "ghost"}
            className={cn(
              "h-8 px-2",
              tool === "point" ? "bg-primary text-white" : "text-gray-700"
            )}
            onClick={() => setTool("point")}
          >
            <Circle className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant={tool === "move" ? "default" : "ghost"}
            className={cn(
              "h-8 px-2",
              tool === "move" ? "bg-primary text-white" : "text-gray-700"
            )}
            onClick={() => setTool("move")}
          >
            <Move className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-8 bg-gray-300 mx-1"></div>
        </>
      )}
      
      {/* Zoom controls */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 px-2 text-gray-700"
        onClick={onZoomIn}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 px-2 text-gray-700"
        onClick={onZoomOut}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 px-2 text-gray-700"
        onClick={onResetZoom}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      
      {/* Cancel button (visible during drawing) */}
      {isSelectMode && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={onCancelDrawing}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
