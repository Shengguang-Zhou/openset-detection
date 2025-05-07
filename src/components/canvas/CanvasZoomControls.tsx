
import React from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface CanvasZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function CanvasZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom
}: CanvasZoomControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white shadow-md rounded-lg p-1 flex items-center">
      <Button size="icon" variant="outline" onClick={onZoomOut} className="h-8 w-8 p-0">
        <span className="sr-only">缩小</span>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onResetZoom} className="px-2 mx-1 text-xs">
        {Math.round(scale * 100)}%
      </Button>
      <Button size="icon" variant="outline" onClick={onZoomIn} className="h-8 w-8 p-0">
        <span className="sr-only">放大</span>
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
}
