
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Rectangle, Polygon, CircleDot, Trash2, Plus } from "lucide-react";
import { Label as ImageLabel } from "@/hooks/useDummyData";

interface LabelPanelProps {
  image: {
    id: string;
    labels: ImageLabel[];
  };
  categories: string[];
  onAddCategory: (category: string) => void;
  onUpdateLabel: (id: string, label: Partial<ImageLabel>) => void;
  onDeleteLabel: (id: string) => void;
}

const LabelPanel = ({
  image,
  categories,
  onAddCategory,
  onUpdateLabel,
  onDeleteLabel,
}: LabelPanelProps) => {
  const [newCategory, setNewCategory] = useState("");

  const handleCategoryChange = (labelId: string, category: string) => {
    onUpdateLabel(labelId, { category });
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      onAddCategory(newCategory);
      setNewCategory("");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "rect":
        return <Rectangle size={14} />;
      case "polygon":
        return <Polygon size={14} />;
      case "point":
        return <CircleDot size={14} />;
      default:
        return null;
    }
  };

  const getCoordinateString = (label: ImageLabel) => {
    if (label.type === "rect") {
      const [topLeft, bottomRight] = label.coordinates;
      return `(${Math.round(topLeft[0])}, ${Math.round(topLeft[1])}) - (${Math.round(bottomRight[0])}, ${Math.round(bottomRight[1])})`;
    } else if (label.type === "polygon") {
      return `${label.coordinates.length} 点`;
    } else {
      const [point] = label.coordinates;
      return `(${Math.round(point[0])}, ${Math.round(point[1])})`;
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">标签 ({image.labels.length})</h3>
          {image.labels.length > 0 ? (
            <div className="space-y-3">
              {image.labels.map((label) => (
                <div
                  key={label.id}
                  className={`p-3 rounded-md border ${
                    label.isAiSuggestion ? "border-blue-200 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1 rounded ${
                          label.isAiSuggestion ? "bg-blue-100" : "bg-orange-100"
                        }`}
                      >
                        {getTypeIcon(label.type)}
                      </div>
                      <span className="text-sm font-medium">{label.category}</span>
                      {label.isAiSuggestion && (
                        <Badge className="bg-accent text-white">
                          AI {Math.round((label.confidence || 0) * 100)}%
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteLabel(label.id)}
                      className="h-7 w-7 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    {getCoordinateString(label)}
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">标签类别</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className={`cursor-pointer transition-all ${
                            label.category === cat
                              ? "bg-primary text-white"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => handleCategoryChange(label.id, cat)}
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>暂无标签</p>
              <p className="text-sm">使用左侧工具添加标注</p>
            </div>
          )}
        </div>

        <div className="border-t pt-3">
          <h3 className="font-medium mb-2">添加新类别</h3>
          <div className="flex gap-2">
            <Input
              placeholder="输入类别名称"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="text-sm"
            />
            <Button
              size="sm"
              className="bg-primary hover:bg-primary-hover"
              onClick={handleAddCategory}
              disabled={!newCategory.trim()}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelPanel;
