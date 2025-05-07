
import { memo, useMemo, useState } from "react";
import { Label } from "@/hooks/useDummyData";
import { Circle, Group, Line, Rect, Text, Transformer } from "react-konva";

interface CanvasLabelsProps {
  labels: Label[];
  selectedLabelId: string | null;
  highlightedLabelId: string | null;
  onLabelSelect: (id: string) => void;
  onLabelHover: (id: string | null) => void;
  onLabelUpdate?: (id: string, newCoordinates: number[][]) => void;
  onLabelDelete?: (id: string) => void;
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
  onLabelHover,
  onLabelUpdate,
  onLabelDelete
}: CanvasLabelsProps) => {
  const [isTransforming, setIsTransforming] = useState(false);
  
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
  const getLabelColor = (label: Label) => {
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
        const labelColor = getLabelColor(label);
        const opacity = getLabelOpacity(isSelected, isHighlighted, label.id);
        
        if (label.type === "rect" && label.coordinates?.length === 2) {
          const [x1, y1] = label.coordinates[0];
          const [x2, y2] = label.coordinates[1];
          const x = Math.min(x1, x2);
          const y = Math.min(y1, y2);
          const width = Math.abs(x2 - x1);
          const height = Math.abs(y2 - y1);
          
          return (
            <Group 
              key={label.id}
              onClick={() => onLabelSelect(label.id)}
              onMouseEnter={() => onLabelHover(label.id)}
              onMouseLeave={() => onLabelHover(null)}
              onDblClick={() => onLabelDelete?.(label.id)}
              draggable={isSelected}
              onDragEnd={(e) => {
                if (onLabelUpdate) {
                  const node = e.target;
                  const newX1 = node.x();
                  const newY1 = node.y();
                  const newX2 = newX1 + width;
                  const newY2 = newY1 + height;
                  onLabelUpdate(label.id, [[newX1, newY1], [newX2, newY2]]);
                }
              }}
            >
              <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                stroke={labelColor}
                strokeWidth={0.8}
                fill={labelColor}
                opacity={opacity}
                shadowColor="black"
                shadowBlur={isSelected || isHighlighted ? 4 : 0}
                shadowOpacity={isSelected || isHighlighted ? 0.4 : 0}
                perfectDrawEnabled={false}
                name={`label-${label.id}`}
              />
              <Text
                x={x}
                y={y - 16}
                text={label.category || "未标注"}
                fontSize={10}
                padding={3}
                fill="white"
                background={labelColor}
                perfectDrawEnabled={false}
              />
              
              {isSelected && (
                <Transformer
                  anchorStroke={labelColor}
                  borderStroke={labelColor}
                  anchorFill="white"
                  anchorSize={8}
                  rotateEnabled={false}
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Minimum size constraint
                    if (newBox.width < 10 || newBox.height < 10) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  onTransformStart={() => setIsTransforming(true)}
                  onTransformEnd={(e) => {
                    setIsTransforming(false);
                    if (onLabelUpdate) {
                      const node = e.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();
                      
                      // Reset scale to avoid compounding transforms
                      node.scaleX(1);
                      node.scaleY(1);
                      
                      const newX1 = node.x();
                      const newY1 = node.y();
                      const newX2 = newX1 + width * scaleX;
                      const newY2 = newY1 + height * scaleY;
                      
                      onLabelUpdate(label.id, [[newX1, newY1], [newX2, newY2]]);
                    }
                  }}
                  ref={node => {
                    if (node && !isTransforming) {
                      const stage = node.getStage();
                      if (stage) {
                        const rect = stage.findOne(`.label-${label.id}`);
                        if (rect) {
                          node.nodes([rect]);
                          node.getLayer()?.batchDraw();
                        }
                      }
                    }
                  }}
                />
              )}
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
              onDblClick={() => onLabelDelete?.(label.id)}
              draggable={isSelected}
              onDragEnd={(e) => {
                if (onLabelUpdate) {
                  const node = e.target;
                  const dx = node.x();
                  const dy = node.y();
                  
                  // Move all points by the drag amount
                  const newCoordinates = label.coordinates.map(point => [
                    point[0] + dx,
                    point[1] + dy
                  ]);
                  
                  // Reset position to avoid compounding transforms
                  node.x(0);
                  node.y(0);
                  
                  onLabelUpdate(label.id, newCoordinates);
                }
              }}
            >
              <Line
                points={points}
                closed={true}
                stroke={labelColor}
                strokeWidth={0.8}
                fill={labelColor}
                opacity={opacity}
                shadowColor="black"
                shadowBlur={isSelected || isHighlighted ? 4 : 0}
                shadowOpacity={isSelected || isHighlighted ? 0.4 : 0}
                perfectDrawEnabled={false}
                name={`label-${label.id}`}
              />
              <Text
                x={centerX - 20}
                y={centerY - 16}
                text={label.category || "未标注"}
                fontSize={10}
                padding={3}
                fill="white"
                background={labelColor}
                perfectDrawEnabled={false}
              />
              
              {/* For polygon editing we would add point handles here */}
              {isSelected && label.coordinates.map((point, index) => (
                <Circle
                  key={`point-${index}`}
                  x={point[0]}
                  y={point[1]}
                  radius={5}
                  fill="white"
                  stroke={labelColor}
                  strokeWidth={1}
                  draggable
                  onDragEnd={(e) => {
                    if (onLabelUpdate) {
                      const newPoint = [e.target.x(), e.target.y()];
                      const newCoordinates = [...label.coordinates];
                      newCoordinates[index] = newPoint as [number, number];
                      onLabelUpdate(label.id, newCoordinates);
                    }
                  }}
                />
              ))}
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
              onDblClick={() => onLabelDelete?.(label.id)}
              draggable={isSelected}
              onDragEnd={(e) => {
                if (onLabelUpdate) {
                  const node = e.target;
                  onLabelUpdate(label.id, [[node.x(), node.y()]]);
                }
              }}
            >
              <Circle
                x={x}
                y={y}
                radius={4}
                fill={labelColor}
                stroke={labelColor}
                strokeWidth={0.8}
                opacity={0.7}
                shadowColor="black"
                shadowBlur={isSelected || isHighlighted ? 4 : 0}
                shadowOpacity={isSelected || isHighlighted ? 0.4 : 0}
                perfectDrawEnabled={false}
                name={`label-${label.id}`}
              />
              <Text
                x={x + 6}
                y={y - 16}
                text={label.category || "未标注"}
                fontSize={10}
                padding={3}
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
