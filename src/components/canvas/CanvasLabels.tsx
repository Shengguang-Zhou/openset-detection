
import { useRef } from "react";
import { Group, Rect, Circle, Line, Text } from "react-konva";
import { Label } from "@/hooks/useDummyData";
import { useColors } from "@/contexts/ColorContext";

export interface CanvasLabelsProps {
  labels: Label[];
  selectedLabelId: string | null;
  highlightedLabelId: string | null;
  onLabelSelect: (id: string) => void;
  onLabelHover: (id: string | null) => void;
  onLabelUpdate?: (labelId: string, newCoordinates: number[][]) => void;
  onLabelDelete?: (id: string) => void;
}

export function CanvasLabels({
  labels,
  selectedLabelId,
  highlightedLabelId,
  onLabelSelect,
  onLabelHover,
  onLabelUpdate,
  onLabelDelete
}: CanvasLabelsProps) {
  const { getLabelColor } = useColors();
  
  return (
    <Group>
      {labels.map((label) => {
        const isSelected = label.id === selectedLabelId;
        const isHighlighted = label.id === highlightedLabelId;
        const color = getLabelColor(label.category, label.isAiSuggestion || false);
        
        if (label.type === "rect" && label.coordinates?.length === 2) {
          const [topLeft, bottomRight] = label.coordinates;
          const x = topLeft[0];
          const y = topLeft[1];
          const width = bottomRight[0] - topLeft[0];
          const height = bottomRight[1] - topLeft[1];
          
          return (
            <Group 
              key={label.id}
              onClick={() => onLabelSelect(label.id)}
              onTap={() => onLabelSelect(label.id)}
              onMouseEnter={() => onLabelHover(label.id)}
              onMouseLeave={() => onLabelHover(null)}
              listening={true}
            >
              <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                stroke={color}
                strokeWidth={isSelected || isHighlighted ? 3 : 2}
                dash={label.isAiSuggestion ? [5, 5] : undefined}
                fillEnabled={false}
              />
              <Text
                x={x}
                y={y - 20}
                text={label.category}
                fill={color}
                fontSize={12}
                padding={4}
                background={isSelected || isHighlighted ? '#ffffff' : undefined}
              />
            </Group>
          );
        } else if (label.type === "polygon" && label.coordinates?.length >= 3) {
          // Flatten the coordinates for the line
          const points = label.coordinates.flat();
          
          return (
            <Group
              key={label.id}
              onClick={() => onLabelSelect(label.id)}
              onTap={() => onLabelSelect(label.id)}
              onMouseEnter={() => onLabelHover(label.id)}
              onMouseLeave={() => onLabelHover(null)}
              listening={true}
            >
              <Line
                points={points}
                closed
                stroke={color}
                strokeWidth={isSelected || isHighlighted ? 3 : 2}
                dash={label.isAiSuggestion ? [5, 5] : undefined}
                fillEnabled={false}
              />
              <Text
                x={label.coordinates[0][0]}
                y={label.coordinates[0][1] - 20}
                text={label.category}
                fill={color}
                fontSize={12}
                padding={4}
                background={isSelected || isHighlighted ? '#ffffff' : undefined}
              />
            </Group>
          );
        } else if (label.type === "point" && label.coordinates?.length === 1) {
          const [x, y] = label.coordinates[0];
          
          return (
            <Group
              key={label.id}
              onClick={() => onLabelSelect(label.id)}
              onTap={() => onLabelSelect(label.id)}
              onMouseEnter={() => onLabelHover(label.id)}
              onMouseLeave={() => onLabelHover(null)}
              listening={true}
            >
              <Circle
                x={x}
                y={y}
                radius={isSelected || isHighlighted ? 6 : 4}
                stroke={color}
                strokeWidth={2}
                fill={color}
                opacity={0.7}
              />
              <Text
                x={x + 10}
                y={y - 10}
                text={label.category}
                fill={color}
                fontSize={12}
                padding={4}
                background={isSelected || isHighlighted ? '#ffffff' : undefined}
              />
            </Group>
          );
        }
        
        return null;
      })}
    </Group>
  );
}
