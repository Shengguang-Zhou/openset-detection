
import { ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label as ImageLabel } from "@/hooks/useDummyData";
import { Canvas } from "@/components/canvas/Canvas";
import { CanvasProvider } from "@/contexts/CanvasContext";
import { ColorProvider } from "@/contexts/ColorContext";

// Define an interface that matches the Image type expected by Canvas
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
    thumbnail?: string;
    osdFlag: 'unknown' | 'reviewed' | 'clean';
    labels: ImageLabel[];
  } | null;
  categories: string[];
  imagePromptMethod: "upload" | "select";
  promptMode: "free" | "text" | "image";
  onAddLabel: (newLabel: any) => void;
  onUpdateLabel: (labelId: string, newLabel: any) => void;
  onDeleteLabel: (labelId: string) => void;
  onSelectRegion: (region: {x: number, y: number, width: number, height: number}) => void;
  setActiveRightPanel: (panel: "labels" | "ai") => void;
  highlightedLabelId: string | null;
  setHighlightedLabelId: (id: string | null) => void;
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
  setActiveRightPanel,
  highlightedLabelId,
  setHighlightedLabelId
}: CanvasAreaProps) => {
  
  // Generate a dummy component key to force reset when image changes
  const canvasKey = selectedImage ? `canvas-${selectedImage.id}` : 'no-image';
  
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
          <CanvasProvider key={canvasKey}>
            <ColorProvider>
              <Canvas
                image={{
                  ...selectedImage,
                  thumbnail: selectedImage.thumbnail || `https://picsum.photos/800/600?random=${selectedImage.id}`
                } as Image}
                categories={categories}
                onAddLabel={onAddLabel}
                onUpdateLabel={onUpdateLabel}
                onDeleteLabel={onDeleteLabel}
                isSelectMode={imagePromptMethod === "select" && promptMode === "image"}
                onSelectRegion={onSelectRegion}
              />
            </ColorProvider>
          </CanvasProvider>
        ) : (
          <div className="text-gray-500">请选择一张图像以开始标注</div>
        )}
      </div>
    </div>
  );
};

export default CanvasArea;
