
import React from "react";
import { Rect, Line } from "react-konva";

interface CanvasDrawingProps {
  drawing: boolean;
  isSelectMode: boolean;
  tool: "select" | "rect" | "polygon" | "point";
  points: number[];
  selectionBox: { x: number; y: number; width: number; height: number } | null;
}

export function CanvasDrawing({
  drawing,
  isSelectMode,
  tool,
  points,
  selectionBox
}: CanvasDrawingProps) {
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
}
