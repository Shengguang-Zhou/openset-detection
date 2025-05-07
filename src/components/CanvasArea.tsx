
import { ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedCanvas } from "@/components/OptimizedCanvas";
import { Label as ImageLabel } from "@/hooks/useDummyData";
import { useState } from "react";

// Define an interface that matches the Image type expected by OptimizedCanvas
interface Image {
  id: string;
  fileName: string;
  thumbnail: string;
  osdFlag: 'unknown' | 'reviewed' | 'clean';
  labels: ImageLabel[];
}

interface CanvasAreaProps {
  selectedImage: {
    id: string;
    fileName: string;
    thumbnail?: string; // Optional in the props
    osdFlag: 'unknown' | 'reviewed' | 'clean';
    labels: ImageLabel[];
  } | null;
  categories: string[]; // Added categories
  imagePromptMethod: "upload" | "select";
  promptMode: "free" | "text" | "image";
  onAddLabel: (newLabel: any) => void;
  onUpdateLabel: (labelId: string, newLabel: any) => void;
  onDeleteLabel: (labelId: string) => void;
  onSelectRegion: (region: {x: number, y: number, width: number, height: number}) => void;
  setActiveRightPanel: (panel: "labels" | "ai") => void;
}

const CanvasArea = ({
  selectedImage,
  categories,
  imagePromptMethod,
  promptMode,
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
  onSelectRegion,
  setActiveRightPanel
}: CanvasAreaProps) => {
  const [highlightedLabelId, setHighlightedLabelId] = useState<string | null>(null);
  
  return (
    <div className="col-span-7 bg-white rounded-lg border overflow-hidden flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="font-medium truncate">
          {selectedImage ? selectedImage.fileName : "未选择图像"}
        </div>
        
        <div className="flex items-center">
          {selectedImage && selectedImage.osdFlag === 'unknown' && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary-hover"
              onClick={() => setActiveRightPanel("ai")}
            >
              <ZapIcon className="mr-2 h-4 w-4" />
              AI 建议
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        {selectedImage ? (
          <OptimizedCanvas
            image={{
              ...selectedImage,
              thumbnail: selectedImage.thumbnail || `https://picsum.photos/200/200?random=${selectedImage.id}`
            } as Image}
            categories={categories}
            onAddLabel={onAddLabel}
            onUpdateLabel={onUpdateLabel}
            onDeleteLabel={onDeleteLabel}
            isSelectMode={imagePromptMethod === "select" && promptMode === "image"}
            onSelectRegion={onSelectRegion}
            highlightedLabelId={highlightedLabelId}
            setHighlightedLabelId={setHighlightedLabelId}
          />
        ) : (
          <div className="text-gray-500">请选择一张图像以开始标注</div>
        )}
      </div>
    </div>
  );
};

export default CanvasArea;
