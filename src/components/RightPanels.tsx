
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo } from "react";
import ImageGallery from "@/components/ImageGallery";
import LabelPanel from "@/components/LabelPanel";
import AISuggestionPanel from "@/components/AISuggestionPanel";
import { Label as ImageLabel } from "@/hooks/useDummyData";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Image {
  id: string;
  fileName: string;
  thumbnail: string;
  osdFlag: 'unknown' | 'reviewed' | 'clean';
  labels: ImageLabel[];
}

interface RightPanelsProps {
  filteredImages: Image[];
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  selectedImage: Image | null;
  datasetLabels: string[];
  activeRightPanel: "labels" | "ai";
  setActiveRightPanel: (panel: "labels" | "ai") => void;
  onAddCategory: (category: string) => void;
  onUpdateLabel: (labelId: string, newLabel: any) => void;
  onDeleteLabel: (labelId: string) => void;
  onAcceptAiSuggestion: (label: any) => void;
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

const RightPanels = ({
  filteredImages,
  selectedImageIndex,
  setSelectedImageIndex,
  selectedImage,
  datasetLabels,
  activeRightPanel,
  setActiveRightPanel,
  onAddCategory,
  onUpdateLabel,
  onDeleteLabel,
  onAcceptAiSuggestion
}: RightPanelsProps) => {
  const [highlightedLabelId, setHighlightedLabelId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Group labels by category and count them for the selected image
  const categoryCounts = useMemo(() => {
    if (!selectedImage) return {};
    
    const counts: { [key: string]: number } = {};
    selectedImage.labels.forEach(label => {
      if (counts[label.category]) {
        counts[label.category]++;
      } else {
        counts[label.category] = 1;
      }
    });
    return counts;
  }, [selectedImage]);

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

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Upper image gallery */}
      <div className="bg-white rounded-lg border overflow-hidden h-[45%]">
        <div className="p-3 border-b font-medium">图像画廊</div>
        <ScrollArea className="h-[calc(100%-40px)]">
          <div className="p-2">
            <ImageGallery 
              images={filteredImages}
              selectedIndex={selectedImageIndex}
              onSelect={setSelectedImageIndex}
            />
          </div>
        </ScrollArea>
      </div>
      
      {/* Lower panel */}
      <div className="bg-white rounded-lg border overflow-hidden flex-grow">
        <Tabs value={activeRightPanel} className="h-full flex flex-col">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none bg-white border-b px-4">
              <TabsTrigger
                value="labels"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                onClick={() => setActiveRightPanel("labels")}
              >
                标签
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                onClick={() => setActiveRightPanel("ai")}
              >
                AI 建议
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Search bar */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索标签"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
          </div>
          
          {/* Two-level tag structure for Labels tab */}
          <TabsContent value="labels" className="flex-1 overflow-hidden m-0 border-none p-3">
            {selectedImage && (
              <div className="space-y-3">
                {/* First level - Categories with counts */}
                {Object.entries(categoryCounts).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(categoryCounts)
                      .filter(([category]) => 
                        category.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(([category, count]) => {
                        const isExpanded = expandedCategory === category;
                        const color = categoryColors[category] || "#F97316";
                        
                        return (
                          <div key={category} className="border rounded-md overflow-hidden">
                            <div 
                              className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                              onClick={() => setExpandedCategory(isExpanded ? null : category)}
                              style={{ borderLeft: `4px solid ${color}` }}
                            >
                              <div className="flex items-center gap-2">
                                {isExpanded ? 
                                  <ChevronDown size={16} /> : 
                                  <ChevronRight size={16} />
                                }
                                <span className="font-medium">{category}</span>
                              </div>
                              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                                {count}
                              </Badge>
                            </div>
                            
                            {/* Second level - Labels details */}
                            {isExpanded && (
                              <div className="bg-gray-50 p-2">
                                {selectedImage.labels
                                  .filter(label => label.category === category)
                                  .map(label => (
                                    <LabelDetail 
                                      key={label.id} 
                                      label={label}
                                      color={color}
                                      onHover={setHighlightedLabelId}
                                      onUpdateLabel={onUpdateLabel}
                                      onDeleteLabel={onDeleteLabel}
                                      isHighlighted={highlightedLabelId === label.id}
                                    />
                                  ))
                                }
                              </div>
                            )}
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>暂无标签</p>
                    <p className="text-sm">使用左侧工具添加标注</p>
                  </div>
                )}
                
                {/* Show regular label panel for adding new categories */}
                <LabelPanel
                  image={selectedImage}
                  categories={datasetLabels}
                  onAddCategory={onAddCategory}
                  onUpdateLabel={onUpdateLabel}
                  onDeleteLabel={onDeleteLabel}
                  onHighlightLabel={setHighlightedLabelId}
                  highlightedLabelId={highlightedLabelId}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ai" className="flex-1 overflow-y-auto m-0 border-none p-0">
            {selectedImage && (
              <AISuggestionPanel
                image={selectedImage}
                categories={datasetLabels}
                onAcceptSuggestion={onAcceptAiSuggestion}
                onHighlightLabel={setHighlightedLabelId}
                highlightedLabelId={highlightedLabelId}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Helper component for label details
const LabelDetail = ({ 
  label, 
  color,
  onHover,
  onUpdateLabel,
  onDeleteLabel,
  isHighlighted 
}: { 
  label: ImageLabel;
  color: string;
  onHover: (id: string | null) => void;
  onUpdateLabel: (id: string, label: Partial<ImageLabel>) => void;
  onDeleteLabel: (id: string) => void;
  isHighlighted: boolean;
}) => {
  // Format coordinates string based on label type
  const getCoordinateString = (label: ImageLabel) => {
    if (label.type === "rect") {
      const [topLeft, bottomRight] = label.coordinates;
      const width = Math.round(Math.abs(bottomRight[0] - topLeft[0]));
      const height = Math.round(Math.abs(bottomRight[1] - topLeft[1]));
      return `位置: ${Math.round(topLeft[0])},${Math.round(topLeft[1])}, 尺寸: ${width}×${height}`;
    } else if (label.type === "polygon") {
      return `多边形: ${label.coordinates.length} 点`;
    } else {
      const [point] = label.coordinates;
      return `位置: ${Math.round(point[0])},${Math.round(point[1])}`;
    }
  };

  return (
    <div 
      className={`p-2 mb-2 rounded border ${isHighlighted ? 'bg-white ring-2' : 'bg-white/60'}`}
      style={{ borderColor: color, ...(isHighlighted ? { boxShadow: `0 0 0 1px ${color}` } : {}) }}
      onMouseEnter={() => onHover(label.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Badge style={{ backgroundColor: color }}>{label.type}</Badge>
          {label.isAiSuggestion && (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              AI {Math.round((label.confidence || 0) * 100)}%
            </Badge>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-600">{getCoordinateString(label)}</div>
    </div>
  );
};

export default RightPanels;
