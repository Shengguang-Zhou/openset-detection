
import React from "react";
import { Group, Rect, Line, Circle, Text } from "react-konva";
import { Label } from "@/hooks/useDummyData";

interface CanvasLabelsProps {
  labels: Label[];
  selectedLabelId: string | null;
  highlightedLabelId: string | null;
  onLabelSelect: (labelId: string) => void;
  onLabelHover: (labelId: string | null) => void;
}

export function CanvasLabels({
  labels,
  selectedLabelId,
  highlightedLabelId,
  onLabelSelect,
  onLabelHover
}: CanvasLabelsProps) {
  return (
    <>
      {labels.map((label) => {
        const isSelected = label.id === selectedLabelId;
        const isHighlighted = label.id === highlightedLabelId;
        const opacity = isHighlighted ? 0.7 : isSelected ? 0.5 : 0.3;
        
        if (label.type === "rect") {
          const [topLeft, bottomRight] = label.coordinates;
          const width = bottomRight[0] - topLeft[0];
          const height = bottomRight[1] - topLeft[1];

          return (
            <Group key={label.id}>
              <Rect
                x={topLeft[0]}
                y={topLeft[1]}
                width={width}
                height={height}
                stroke={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
                strokeWidth={isSelected || isHighlighted ? 2.5 : 1.5}
                dash={label.isAiSuggestion ? [5, 2] : undefined}
                fill={isSelected || isHighlighted ? (label.isAiSuggestion ? `rgba(37, 99, 235, ${opacity})` : `rgba(249, 115, 22, ${opacity})`) : "transparent"}
                onClick={() => onLabelSelect(label.id)}
                onMouseEnter={() => onLabelHover(label.id)}
                onMouseLeave={() => onLabelHover(null)}
              />
              <Text
                x={topLeft[0]}
                y={topLeft[1] - 20}
                text={`${label.category} ${label.confidence ? `(${Math.round(label.confidence * 100)}%)` : ""}`}
                fontSize={14}
                fill="white"
                padding={4}
                background={label.isAiSuggestion ? "#2563EB" : "#F97316"}
              />
            </Group>
          );
        } else if (label.type === "polygon") {
          const flatPoints = label.coordinates.flat();
          
          return (
            <Group key={label.id}>
              <Line
                points={flatPoints}
                closed
                stroke={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
                strokeWidth={isSelected || isHighlighted ? 2.5 : 1.5}
                dash={label.isAiSuggestion ? [5, 2] : undefined}
                fill={isSelected || isHighlighted ? (label.isAiSuggestion ? `rgba(37, 99, 235, ${opacity})` : `rgba(249, 115, 22, ${opacity})`) : "transparent"}
                onClick={() => onLabelSelect(label.id)}
                onMouseEnter={() => onLabelHover(label.id)}
                onMouseLeave={() => onLabelHover(null)}
              />
              {label.coordinates.map((point, i) => (
                <Circle
                  key={i}
                  x={point[0]}
                  y={point[1]}
                  radius={isSelected || isHighlighted ? 4 : 3}
                  fill={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
                />
              ))}
              <Text
                x={label.coordinates[0][0]}
                y={label.coordinates[0][1] - 20}
                text={`${label.category} ${label.confidence ? `(${Math.round(label.confidence * 100)}%)` : ""}`}
                fontSize={14}
                fill="white"
                padding={4}
                background={label.isAiSuggestion ? "#2563EB" : "#F97316"}
              />
            </Group>
          );
        } else if (label.type === "point") {
          const [point] = label.coordinates;
          
          return (
            <Group key={label.id}>
              <Circle
                x={point[0]}
                y={point[1]}
                radius={isSelected || isHighlighted ? 6 : 4}
                stroke={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
                strokeWidth={2}
                fill={isSelected || isHighlighted ? (label.isAiSuggestion ? `rgba(37, 99, 235, ${opacity})` : `rgba(249, 115, 22, ${opacity})`) : (label.isAiSuggestion ? "#2563EB" : "#F97316")}
                onClick={() => onLabelSelect(label.id)}
                onMouseEnter={() => onLabelHover(label.id)}
                onMouseLeave={() => onLabelHover(null)}
              />
              <Text
                x={point[0] + 10}
                y={point[1] - 10}
                text={`${label.category} ${label.confidence ? `(${Math.round(label.confidence * 100)}%)` : ""}`}
                fontSize={14}
                fill="white"
                padding={4}
                background={label.isAiSuggestion ? "#2563EB" : "#F97316"}
              />
            </Group>
          );
        }
        
        return null;
      })}
    </>
  );
}
