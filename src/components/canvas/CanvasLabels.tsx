
import { memo, useMemo } from "react";
import { Label } from "@/hooks/useDummyData";
import { Circle, Group, Line, Rect, Text } from "react-konva";

interface CanvasLabelsProps {
  labels: Label[];
  selectedLabelId: string | null;
  highlightedLabelId: string | null;
  onLabelSelect: (id: string) => void;
  onLabelHover: (id: string | null) => void;
}

// Color palette for different categories
const COLOR_PALETTE = [
  "#F97316", // Orange (primary)
  "#D946EF", // Magenta
  "#0EA5E9", // Blue
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#6366F1"  // Indigo
];

// Using memo for performance optimization
export const CanvasLabels = memo(({
  labels,
  selectedLabelId,
  highlightedLabelId,
  onLabelSelect,
  onLabelHover
}: CanvasLabelsProps) => {
  // Generate consistent colors for categories
  const categoryColors = useMemo(() => {
    const uniqueCategories = Array.from(new Set(labels.map(label => label.category)));
    return Object.fromEntries(
      uniqueCategories.map((category, index) => [
        category, 
        COLOR_PALETTE[index % COLOR_PALETTE.length]
      ])
    );
  }, [labels]);

  // Helper function to determine fill color
  const getLabelColor = (label: Label, isSelected: boolean, isHighlighted: boolean) => {
    // Use AI suggestion color for AI labels, otherwise use category color
    if (label.isAiSuggestion) {
      return "#2563EB";
    }
    
    // Use the category color if available, otherwise default to primary
    return categoryColors[label.category] || "#F97316";
  };

  // Helper function to determine opacity
  const getLabelOpacity = (isSelected: boolean, isHighlighted: boolean, labelId: string) => {
    // When a label is highlighted, make all other labels more transparent
    if (highlightedLabelId && highlightedLabelId !== labelId) {
      return 0.15; // More transparent for non-highlighted labels
    }
    
    // For highlighted or selected labels
    if (isHighlighted || isSelected) {
      return 0.25; // More visible
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
                strokeWidth={1.5}
                fill={labelColor}
                opacity={opacity}
                shadowColor="black"
                shadowBlur={isSelected || isHighlighted ? 4 : 0}
                shadowOpacity={isSelected || isHighlighted ? 0.4 : 0}
                perfectDrawEnabled={false}
              />
              <Text
                x={x1}
                y={y1 - 18}
                text={label.category || "未标注"}
                fontSize={11}
                padding={4}
                fill="white"
                background={labelColor}
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
                strokeWidth={1.5}
                fill={labelColor}
                opacity={opacity}
                shadowColor="black"
                shadowBlur={isSelected || isHighlighted ? 4 : 0}
                shadowOpacity={isSelected || isHighlighted ? 0.4 : 0}
                perfectDrawEnabled={false}
              />
              <Text
                x={centerX - 20}
                y={centerY - 18}
                text={label.category || "未标注"}
                fontSize={11}
                padding={4}
                fill="white"
                background={labelColor}
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
                radius={6}
                fill={labelColor}
                stroke={labelColor}
                strokeWidth={1.5}
                opacity={0.7}
                shadowColor="black"
                shadowBlur={isSelected || isHighlighted ? 4 : 0}
                shadowOpacity={isSelected || isHighlighted ? 0.4 : 0}
                perfectDrawEnabled={false}
              />
              <Text
                x={x + 8}
                y={y - 18}
                text={label.category || "未标注"}
                fontSize={11}
                padding={4}
                fill="white"
                background={labelColor}
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
