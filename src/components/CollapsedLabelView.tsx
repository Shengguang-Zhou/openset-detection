
import { Label as ImageLabel } from "@/hooks/useDummyData";
import { Badge } from "./ui/badge";
import { CircleDot, RectangleHorizontal } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

interface CollapsedLabelViewProps {
  labels: ImageLabel[];
  onLabelHover: (labelId: string | null) => void;
}

export function CollapsedLabelView({ labels, onLabelHover }: CollapsedLabelViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredLabels = labels.filter(label => 
    label.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "rect":
        return <RectangleHorizontal size={12} />;
      case "polygon":
        return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4l7 4v8l-7 4-7-4V8l7-4z" />
        </svg>;
      case "point":
        return <CircleDot size={12} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-[200px]">
      <div className="relative mb-2">
        <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
        <Input
          placeholder="搜索标签"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="space-y-1 pr-2">
          {filteredLabels.length > 0 ? (
            filteredLabels.map((label) => (
              <div 
                key={label.id}
                className={`px-2 py-1 rounded border ${
                  label.isAiSuggestion ? "border-blue-200" : "border-orange-200"
                } flex items-center text-xs hover:bg-gray-100 cursor-pointer transition-colors`}
                onMouseEnter={() => onLabelHover(label.id)}
                onMouseLeave={() => onLabelHover(null)}
              >
                <div className={`p-1 rounded mr-1 ${
                  label.isAiSuggestion ? "bg-blue-100" : "bg-orange-100"
                }`}>
                  {getTypeIcon(label.type)}
                </div>
                <span className="truncate flex-1">{label.category}</span>
                {label.isAiSuggestion && (
                  <Badge className="text-[8px] h-4 bg-accent ml-1">
                    AI {Math.round((label.confidence || 0) * 100)}%
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-2 text-gray-500 text-xs">
              没有找到标签
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
