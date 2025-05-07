
import { useState, useMemo } from 'react';
import { Label } from '@/hooks/useDummyData';
import { Badge } from './ui/badge';
import { CircleDot, RectangleHorizontal, ChevronRight, ChevronDown } from 'lucide-react';

interface CollapsedLabelViewProps {
  labels: Label[];
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

export function CollapsedLabelView({ labels, onLabelHover }: CollapsedLabelViewProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Group labels by category and count them
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    labels.forEach(label => {
      if (counts[label.category]) {
        counts[label.category]++;
      } else {
        counts[label.category] = 1;
      }
    });
    return counts;
  }, [labels]);

  // Generate consistent colors for categories
  const categoryColors = useMemo(() => {
    const uniqueCategories = Object.keys(categoryCounts);
    return Object.fromEntries(
      uniqueCategories.map((category, index) => [
        category, 
        COLOR_PALETTE[index % COLOR_PALETTE.length]
      ])
    );
  }, [categoryCounts]);

  // Get icon for label type
  const getLabelTypeIcon = (type: string) => {
    switch (type) {
      case 'rect':
        return <RectangleHorizontal size={12} />;
      case 'point':
        return <CircleDot size={12} />;
      case 'polygon':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4l7 4v8l-7 4-7-4V8l7-4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Format coordinates for display in x,y,w,h format
  const formatCoordinates = (label: Label) => {
    if (label.type === 'rect' && label.coordinates?.length === 2) {
      const [x1, y1] = label.coordinates[0];
      const [x2, y2] = label.coordinates[1];
      const x = Math.round(Math.min(x1, x2));
      const y = Math.round(Math.min(y1, y2));
      const width = Math.round(Math.abs(x2 - x1));
      const height = Math.round(Math.abs(y2 - y1));
      return `${x},${y},${width}×${height}`;
    } else if (label.type === 'polygon') {
      return `${label.coordinates.length} 点`;
    } else if (label.type === 'point') {
      const [x, y] = label.coordinates[0];
      return `${Math.round(x)},${Math.round(y)}`;
    }
    return '';
  };

  return (
    <div className="space-y-2 py-2">
      {/* Top level - category counts */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryCounts).map(([category, count]) => {
          const isExpanded = expandedCategory === category;
          const color = categoryColors[category] || "#F97316";
          
          return (
            <div key={category} className="flex flex-col">
              <Badge 
                className="cursor-pointer flex items-center gap-1 px-2 py-1"
                style={{ backgroundColor: color, color: 'white' }}
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
              >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {category}: {count}
              </Badge>
              
              {/* Second level - detailed info when expanded */}
              {isExpanded && (
                <div className="mt-1 flex flex-wrap gap-1 max-w-md">
                  {labels
                    .filter(label => label.category === category)
                    .map(label => (
                      <div 
                        key={label.id}
                        className="flex items-center gap-1 text-xs bg-white/80 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
                        onMouseEnter={() => onLabelHover(label.id)}
                        onMouseLeave={() => onLabelHover(null)}
                      >
                        <span className="text-gray-500">{getLabelTypeIcon(label.type)}</span>
                        <span>{formatCoordinates(label)}</span>
                        {label.isAiSuggestion && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">AI</span>
                        )}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          );
        })}
        
        {Object.keys(categoryCounts).length === 0 && (
          <div className="text-sm text-gray-500">暂无标签</div>
        )}
      </div>
    </div>
  );
}
