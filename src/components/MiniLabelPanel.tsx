
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Label } from "@/hooks/useDummyData";
import { useColors } from "@/contexts/ColorContext";
import { ScrollArea } from "./ui/scroll-area";

interface MiniLabelPanelProps {
  labels: Label[];
  onEditLabel: (label: Label) => void;
  onDeleteLabel: (labelId: string) => void;
  onAddNewLabel: () => void;
}

export function MiniLabelPanel({
  labels,
  onEditLabel,
  onDeleteLabel,
  onAddNewLabel
}: MiniLabelPanelProps) {
  const { getLabelColor } = useColors();
  
  return (
    <div className="bg-white rounded-lg border p-3 h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">已标注区域</h3>
        <Button size="sm" variant="ghost" onClick={onAddNewLabel} className="h-8 px-2">
          <Plus className="h-4 w-4 mr-1" />
          添加标签
        </Button>
      </div>
      
      {labels.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          请在图像上绘制标注区域
        </div>
      ) : (
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-2">
            {labels.map((label) => {
              const labelColor = getLabelColor(label.category, label.isAiSuggestion || false);
              
              return (
                <div 
                  key={label.id} 
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: labelColor }}
                    />
                    <span className="font-medium">{label.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {label.type === "rect" ? "矩形" : 
                       label.type === "polygon" ? "多边形" : "点"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditLabel(label)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDeleteLabel(label.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
