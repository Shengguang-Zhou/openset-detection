
import React from "react";
import { Button } from "@/components/ui/button";
import { RectangleHorizontal, Pencil } from "lucide-react";

interface CanvasToolbarProps {
  isSelectMode: boolean;
  tool: "select" | "rect" | "polygon" | "point";
  setTool: (tool: "select" | "rect" | "polygon" | "point") => void;
  selectedLabelId: string | null;
  drawing: boolean;
  onDeleteSelected: () => void;
  onCancelDrawing: () => void;
}

export function CanvasToolbar({
  isSelectMode,
  tool,
  setTool,
  selectedLabelId,
  drawing,
  onDeleteSelected,
  onCancelDrawing
}: CanvasToolbarProps) {
  return (
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
          onClick={onDeleteSelected}
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
          onClick={onCancelDrawing}
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
  );
}
