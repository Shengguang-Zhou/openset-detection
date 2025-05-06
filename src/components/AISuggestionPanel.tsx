
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label as ImageLabel } from "@/hooks/useDummyData";
import { CheckCircle, ZapIcon } from "lucide-react";

interface AISuggestionPanelProps {
  image: {
    id: string;
    labels: ImageLabel[];
  };
  categories: string[];
  onAcceptSuggestion: (label: Omit<ImageLabel, "id">) => void;
}

const AISuggestionPanel = ({
  image,
  categories,
  onAcceptSuggestion,
}: AISuggestionPanelProps) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  // 过滤出AI建议的标签
  const aiSuggestions = image.labels.filter(
    (label) => label.isAiSuggestion && label.category === "unknown"
  );

  if (aiSuggestions.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <ZapIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">暂无AI建议</p>
          <p className="text-sm text-gray-400">
            尝试运行开集目标检测来获取建议
          </p>
        </div>
      </div>
    );
  }

  const handleSelectAll = () => {
    if (selectedSuggestions.length === aiSuggestions.length) {
      setSelectedSuggestions([]);
    } else {
      setSelectedSuggestions(aiSuggestions.map((s) => s.id));
    }
  };

  const handleSelectSuggestion = (id: string) => {
    if (selectedSuggestions.includes(id)) {
      setSelectedSuggestions(selectedSuggestions.filter((s) => s !== id));
    } else {
      setSelectedSuggestions([...selectedSuggestions, id]);
    }
  };

  const handleCategoryChange = (id: string, category: string) => {
    setCategoryMap({
      ...categoryMap,
      [id]: category,
    });
  };

  const handleAcceptSelected = () => {
    selectedSuggestions.forEach((id) => {
      const suggestion = aiSuggestions.find((s) => s.id === id);
      if (suggestion) {
        onAcceptSuggestion({
          ...suggestion,
          category: categoryMap[id] || categories[0] || "物体",
        });
      }
    });
    setSelectedSuggestions([]);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">AI建议 ({aiSuggestions.length})</h3>
          <Badge className="bg-accent text-xs font-normal">OSD</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleSelectAll}
        >
          {selectedSuggestions.length === aiSuggestions.length
            ? "取消全选"
            : "全选"}
        </Button>
      </div>

      <div className="space-y-3 mt-2">
        {aiSuggestions.map((suggestion) => {
          const isSelected = selectedSuggestions.includes(suggestion.id);
          const confidence = Math.round((suggestion.confidence || 0.7) * 100);
          
          return (
            <div
              key={suggestion.id}
              className={`p-3 rounded-md border transition-colors ${
                isSelected
                  ? "border-accent bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleSelectSuggestion(suggestion.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelectSuggestion(suggestion.id)}
                    className="data-[state=checked]:bg-accent"
                  />
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 border-yellow-200 text-yellow-800 text-xs"
                      >
                        未知对象
                      </Badge>
                      <span className="text-xs text-gray-500">
                        置信度: {confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      坐标:{" "}
                      {suggestion.type === "rect"
                        ? `(${Math.round(suggestion.coordinates[0][0])}, ${Math.round(
                            suggestion.coordinates[0][1]
                          )}) - (${Math.round(suggestion.coordinates[1][0])}, ${Math.round(
                            suggestion.coordinates[1][1]
                          )})`
                        : `${suggestion.coordinates.length} 点`}
                    </p>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 pl-6">
                  <p className="text-xs mb-1">选择类别:</p>
                  <Select
                    value={categoryMap[suggestion.id] || categories[0] || ""}
                    onValueChange={(value) =>
                      handleCategoryChange(suggestion.id, value)
                    }
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="选择类别" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSuggestions.length > 0 && (
        <Button
          className="w-full bg-accent hover:bg-blue-700"
          onClick={handleAcceptSelected}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          采纳所选 ({selectedSuggestions.length})
        </Button>
      )}
    </div>
  );
};

export default AISuggestionPanel;
