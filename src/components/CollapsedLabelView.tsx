
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/hooks/useDummyData";
import { useColors } from "@/contexts/ColorContext";

interface CollapsedLabelViewProps {
  labels: Label[];
  onLabelHover: (id: string | null) => void;
}

export function CollapsedLabelView({ labels, onLabelHover }: CollapsedLabelViewProps) {
  const [expanded, setExpanded] = useState(false);
  const { getLabelColor } = useColors();

  // Group labels by category
  const labelsByCategory = labels.reduce((groups: Record<string, Label[]>, label) => {
    const category = label.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(label);
    return groups;
  }, {});
  
  // Count labels per category
  const categoryCount = Object.entries(labelsByCategory).map(([category, labels]) => ({
    category,
    count: labels.length,
    color: getLabelColor(category, false),
    firstLabel: labels[0]
  }));

  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <div 
        className={`bg-white rounded-lg shadow-lg p-3 ${
          expanded ? "w-64" : "w-auto cursor-pointer"
        }`}
        onClick={() => !expanded && setExpanded(true)}
      >
        {expanded ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">标签 ({labels.length})</h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-xs"
              >
                收起
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categoryCount.map(({ category, count, color, firstLabel }) => (
                <div key={category} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{category}</span>
                  <Badge variant="outline" className="ml-auto">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">标签</span>
            <Badge variant="default" className="bg-primary">
              {labels.length}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
