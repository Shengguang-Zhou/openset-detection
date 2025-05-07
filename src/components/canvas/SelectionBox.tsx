
import { Fragment } from 'react';
import { Circle, Line, Rect } from "react-konva";

interface SelectionBoxProps {
  drawing: boolean;
  isSelectMode: boolean;
  tool: "select" | "rect" | "polygon" | "point" | "move";
  points: number[];
  selectionBox: { x: number; y: number; width: number; height: number } | null;
}

export function SelectionBox({
  drawing,
  isSelectMode,
  tool,
  points,
  selectionBox
}: SelectionBoxProps) {
  if (!drawing) return null;

  // Drawing selection box for reference image selection
  if (isSelectMode && selectionBox) {
    return (
      <Rect
        x={selectionBox.x}
        y={selectionBox.y}
        width={selectionBox.width}
        height={selectionBox.height}
        stroke="#F97316"
        strokeWidth={0.8}
        dash={[4, 4]}
        fill="rgba(249, 115, 22, 0.1)"
      />
    );
  }

  // Drawing rectangle
  if (tool === "rect" && points.length === 4) {
    const x = Math.min(points[0], points[2]);
    const y = Math.min(points[1], points[3]);
    const width = Math.abs(points[2] - points[0]);
    const height = Math.abs(points[3] - points[1]);

    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="#F97316"
        strokeWidth={0.8}
        dash={[4, 4]}
      />
    );
  }

  // Drawing polygon
  if (tool === "polygon" && points.length >= 4) {
    const flatPoints = points;

    return (
      <Fragment>
        <Line
          points={flatPoints}
          stroke="#F97316"
          strokeWidth={0.8}
          closed={false}
          dash={[4, 4]}
        />
        {points.length > 2 && (
          <Line
            points={[
              points[points.length - 2],
              points[points.length - 1],
              points[0],
              points[1],
            ]}
            stroke="#F97316"
            strokeWidth={0.8}
            dash={[4, 4]}
            opacity={0.5}
          />
        )}
        {flatPoints.map((_, i) => {
          if (i % 2 === 0) {
            return (
              <Circle
                key={i}
                x={flatPoints[i]}
                y={flatPoints[i + 1]}
                radius={2}
                fill="#F97316"
              />
            );
          }
          return null;
        })}
      </Fragment>
    );
  }

  return null;
}
