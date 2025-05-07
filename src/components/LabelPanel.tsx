
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RectangleHorizontal, CircleDot, Trash2, Plus, Search, Tag } from "lucide-react";
import { Label as ImageLabel } from "@/hooks/useDummyData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LabelPanelProps {
  image: {
    id: string;
    labels: ImageLabel[];
  };
  categories: string[];
  onAddCategory: (category: string) => void;
  onUpdateLabel: (id: string, label: Partial<ImageLabel>) => void;
  onDeleteLabel: (id: string) => void;
  onHighlightLabel: (id: string | null) => void;
  highlightedLabelId: string | null;
}

const LabelPanel = ({
  image,
  categories,
  onAddCategory,
  onUpdateLabel,
  onDeleteLabel,
  onHighlightLabel,
  highlightedLabelId
}: LabelPanelProps) => {
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"labels" | "categories">("labels");

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
        return <RectangleHorizontal size={14} />;
      case "polygon":
        return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4l7 4v8l-7 4-7-4V8l7-4z" />
        </svg>;
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

  // Filter labels by search term
  const filteredLabels = image.labels.filter((label) => 
    label.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter categories by search term
  const filteredCategories = categories.filter((category) => 
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate category usage statistics
  const categoryStats = categories.reduce((stats, category) => {
    const count = image.labels.filter(label => label.category === category).length;
    return { ...stats, [category]: count };
  }, {} as Record<string, number>);

  return (
    <div className="p-0 h-full flex flex-col">
      {/* Search bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索类别或标签"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "labels" | "categories")} className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="labels" className="text-sm">标签 ({image.labels.length})</TabsTrigger>
            <TabsTrigger value="categories" className="text-sm">类别 ({categories.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="labels" className="flex-1 overflow-hidden m-0 p-0 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {filteredLabels.length > 0 ? (
                filteredLabels.map((label) => {
                  const isHighlighted = label.id === highlightedLabelId;
                  return (
                    <div
                      key={label.id}
                      className={`p-3 rounded-md border transition-colors ${
                        isHighlighted ? 'ring-2 ring-primary bg-primary/5' : ''
                      } ${
                        label.isAiSuggestion ? "border-blue-200 bg-blue-50" : "border-gray-200"
                      }`}
                      onMouseEnter={() => onHighlightLabel(label.id)}
                      onMouseLeave={() => onHighlightLabel(null)}
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
                        <Label className="text-xs mb-1 block">选择标签类别</Label>
                        <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                          {categories.length > 0 ? (
                            categories.map((cat) => (
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
                            ))
                          ) : (
                            <div className="text-xs text-gray-500 italic">
                              请先添加类别
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>没有找到匹配的标签</p>
                  {searchTerm && (
                    <p className="text-sm">尝试其他搜索词或清除搜索</p>
                  )}
                </div>
              )}
              
              {filteredLabels.length === 0 && image.labels.length === 0 && !searchTerm && (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无标签</p>
                  <p className="text-sm">使用左侧工具添加标注</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="categories" className="flex-1 overflow-hidden m-0 p-0 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {filteredCategories.map((category) => (
                    <div key={category} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-primary" />
                        <span>{category}</span>
                      </div>
                      <Badge variant="outline">
                        {categoryStats[category] || 0}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>没有找到匹配的类别</p>
                  {searchTerm && (
                    <p className="text-sm">尝试其他搜索词或清除搜索</p>
                  )}
                </div>
              )}
              
              {categories.length === 0 && !searchTerm && (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无类别</p>
                  <p className="text-sm">请添加新的类别</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      {/* Add new category */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="输入新类别名称"
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
  );
};

export default LabelPanel;
