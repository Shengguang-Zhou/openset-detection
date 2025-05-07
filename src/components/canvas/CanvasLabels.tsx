
import { memo } from "react";
import { Label } from "@/hooks/useDummyData";
import { Circle, Group, Line, Rect, Text } from "react-konva";

interface CanvasLabelsProps {
  labels: Label[];
  selectedLabelId: string | null;
  highlightedLabelId: string | null;
  onLabelSelect: (id: string) => void;
  onLabelHover: (id: string | null) => void;
}

// Using memo for performance optimization
export const CanvasLabels = memo(({
  labels,
  selectedLabelId,
  highlightedLabelId,
  onLabelSelect,
  onLabelHover
}: CanvasLabelsProps) => {
  // Helper function to determine fill color
  const getLabelColor = (label: Label, isSelected: boolean, isHighlighted: boolean) => {
    const baseColor = label.isAiSuggestion ? "#2563EB" : "#F97316";
    return isSelected || isHighlighted ? baseColor : baseColor;
  };

  // Helper function to determine opacity
  const getLabelOpacity = (isSelected: boolean, isHighlighted: boolean, labelId: string) => {
    // When a label is highlighted, make all other labels more transparent
    if (highlightedLabelId && highlightedLabelId !== labelId) {
      return 0.15; // More transparent for non-highlighted labels
    }
    
    // For highlighted or selected labels
    if (isHighlighted || isSelected) {
      return 0.3; // More visible
    }
    
    // Default opacity
    return 0.2;
  };

  return (
    <>
      {labels.map((label) => {
        const isSelected = selectedLabelId === label.id;
        const isHighlighted = highlightedLabelId === label.id;
        const labelColor = getLabelColor(label, isSelected, isHighlighted);
        const opacity = getLabelOpacity(isSelected, isHighlighted, label.id);
        
        if (label.type === "rect" && label.coordinates?.length === 2) {
          const [x1, y1] = label.coordinates[0];
          const [x2, y2] = label.coordinates[1];
          const width = x2 - x1;
          const height = y2 - y1;
          
          return (
            <Group 
              key={label.id}
              onClick={() => onLabelSelect(label.id)}
              onMouseEnter={() => onLabelHover(label.id)}
              onMouseLeave={() => onLabelHover(null)}
            >
              <Rect
                x={x1}
                y={y1}
                width={width}
                height={height}
                stroke={labelColor}
                strokeWidth={2}
                fill={labelColor}
                opacity={opacity}
                shadowColor="black"
                shadowBlur={isSelected || isHighlighted ? 5 : 0}
                shadowOpacity={isSelected || isHighlighted ? 0.5 : 0}
                perfectDrawEnabled={false}
              />
              <Text
                x={x1}
                y={y1 - 20}
                text={label.category || "未标注"}
                fontSize={12}
                padding={5}
                fill="white"
                background={labelColor}
                backgroundStrokeWidth={1}
                backgroundStroke={labelColor}
                perfectDrawEnabled={false}
              />
            </Group>
          );
        }
        
        if (label.type === "polygon" && label.coordinates?.length > 2) {
          const points = label.coordinates.flatMap((coord) => coord);
          
          // Calculate label position (center of polygon)
          const xSum = label.coordinates.reduce((sum, coord) => sum + coord[0], 0);
          const ySum = label.coordinates.reduce((sum, coord) => sum + coord[1], 0);
          const centerX = xSum / label.coordinates.length;
          const centerY = ySum / label.coordinates.length;
          
          return (
            <Group 
              key={label.id}
              onClick={() => onLabelSelect(label.id)}
              onMouseEnter={() => onLabelHover(label.id)}
              onMouseLeave={() => onLabelHover(null)}
            >
              <Line
                points={points}
                closed={true}
                stroke={labelColor}
                strokeWidth={2}
                fill={labelColor}
                opacity={opacity}
                shadowColor="black"
                shadowBlur={isSelected || isHighlighted ? 5 : 0}
                shadowOpacity={isSelected || isHighlighted ? 0.5 : 0}
                perfectDrawEnabled={false}
              />
              <Text
                x={centerX - 20}
                y={centerY - 20}
                text={label.category || "未标注"}
                fontSize={12}
                padding={5}
                fill="white"
                background={labelColor}
                backgroundStrokeWidth={1}
                backgroundStroke={labelColor}
                perfectDrawEnabled={false}
              />
            </Group>
          );
        }
        
        if (label.type === "point" && label.coordinates?.length === 1) {
          const [x, y] = label.coordinates[0];
          
          return (
            <Group 
              key={label.id}
              onClick={() => onLabelSelect(label.id)}
              onMouseEnter={() => onLabelHover(label.id)}
              onMouseLeave={() => onLabelHover(null)}
            >
              <Circle
                x={x}
                y={y}
                radius={7}
                fill={labelColor}
                stroke={labelColor}
                strokeWidth={2}
                opacity={0.7}
                shadowColor="black"
                shadowBlur={isSelected || isHighlighted ? 5 : 0}
                shadowOpacity={isSelected || isHighlighted ? 0.5 : 0}
                perfectDrawEnabled={false}
              />
              <Text
                x={x + 10}
                y={y - 20}
                text={label.category || "未标注"}
                fontSize={12}
                padding={5}
                fill="white"
                background={labelColor}
                backgroundStrokeWidth={1}
                backgroundStroke={labelColor}
                perfectDrawEnabled={false}
              />
            </Group>
          );
        }
        
        return null;
      })}
    </>
  );
});

CanvasLabels.displayName = "CanvasLabels";
