
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { CanvasProvider } from "@/contexts/CanvasContext";
import { ColorProvider } from "@/contexts/ColorContext";
import { Canvas } from "@/components/canvas/Canvas";
import { MiniLabelPanel } from "./MiniLabelPanel";
import { Label } from "@/hooks/useDummyData";

interface ImagePromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  imageUrl: string;
  categories: string[];
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  onSelectRegion?: (region: { x: number; y: number; width: number; height: number }) => void;
}

export function ImagePromptDialog({
  isOpen,
  onClose,
  onConfirm,
  imageUrl,
  categories,
  selectionBox,
  onSelectRegion
}: ImagePromptDialogProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  
  // Reset labels when dialog opens or closes
  useEffect(() => {
    if (isOpen) {
      setLabels([]);
    }
  }, [isOpen]);
  
  const handleAddLabel = (newLabel: Omit<Label, "id">) => {
    const labelId = `prompt-label-${Date.now()}`;
    setLabels(current => [
      ...current,
      { ...newLabel, id: labelId }
    ]);
  };

  const handleUpdateLabel = (labelId: string, updatedProps: Partial<Label>) => {
    setLabels(current => 
      current.map(label => 
        label.id === labelId ? { ...label, ...updatedProps } : label
      )
    );
  };

  const handleDeleteLabel = (labelId: string) => {
    setLabels(current => current.filter(label => label.id !== labelId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>选择图像区域</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="col-span-2 h-[400px] border rounded overflow-hidden">
            <CanvasProvider>
              <ColorProvider>
                <Canvas 
                  image={{
                    id: "prompt-image",
                    fileName: "参考图像",
                    thumbnail: imageUrl,
                    labels: labels
                  }}
                  categories={categories}
                  onAddLabel={handleAddLabel}
                  onUpdateLabel={handleUpdateLabel}
                  onDeleteLabel={handleDeleteLabel}
                  isSelectMode={false}
                  onSelectRegion={onSelectRegion}
                />
              </ColorProvider>
            </CanvasProvider>
          </div>
          
          <div className="col-span-1 h-[400px]">
            <MiniLabelPanel 
              labels={labels}
              onEditLabel={(label) => {
                // Edit functionality could be implemented here
              }}
              onDeleteLabel={handleDeleteLabel}
              onAddNewLabel={() => {
                // This would trigger draw mode on the canvas
              }}
            />
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-between">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={onConfirm}>
            确认选择
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
