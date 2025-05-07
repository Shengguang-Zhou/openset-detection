
import { useState, useMemo } from 'react';
import { Label } from '@/hooks/useDummyData';
import { Badge } from './ui/badge';
import { CircleDot, RectangleHorizontal, ChevronRight, ChevronDown } from 'lucide-react';
import { formatCoordinates } from '@/utils/labelUtils';
import { useColors } from '@/contexts/ColorContext';

interface CollapsedLabelViewProps {
  labels: Label[];
  onLabelHover: (id: string | null) => void;
}

export function CollapsedLabelView({ labels, onLabelHover }: CollapsedLabelViewProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { getCategoryColor } = useColors();
  
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

  return (
    <div className="space-y-2 py-2">
      {/* Top level - category counts */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryCounts).map(([category, count]) => {
          const isExpanded = expandedCategory === category;
          const color = getCategoryColor(category);
          
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
                <div className="mt-1">
                  <div className="flex flex-wrap gap-1 max-w-[500px]">
                    {labels
                      .filter(label => label.category === category)
                      .map(label => (
                        <div 
                          key={label.id}
                          className="flex flex-col gap-1 bg-white/90 border border-gray-200 rounded p-1 hover:bg-gray-50"
                          onMouseEnter={() => onLabelHover(label.id)}
                          onMouseLeave={() => onLabelHover(null)}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">{getLabelTypeIcon(label.type)}</span>
                            <span className="text-xs font-medium">{label.type}</span>
                            {label.isAiSuggestion && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">AI</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-700">
                            {formatCoordinates(label)}
                          </div>
                        </div>
                      ))
                    }
                  </div>
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
