
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ImageGallery from "@/components/ImageGallery";
import LabelPanel from "@/components/LabelPanel";
import AISuggestionPanel from "@/components/AISuggestionPanel";
import { Label as ImageLabel } from "@/hooks/useDummyData";
import { useState } from "react";

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
      
      {/* Lower label panel */}
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
          
          <TabsContent value="labels" className="flex-1 overflow-y-auto m-0 border-none p-0">
            {selectedImage && (
              <LabelPanel
                image={selectedImage}
                categories={datasetLabels}
                onAddCategory={onAddCategory}
                onUpdateLabel={onUpdateLabel}
                onDeleteLabel={onDeleteLabel}
                onHighlightLabel={setHighlightedLabelId}
                highlightedLabelId={highlightedLabelId}
              />
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

export default RightPanels;
