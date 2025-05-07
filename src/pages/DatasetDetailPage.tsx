
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, ZapIcon, Search } from "lucide-react";
import { useDummyData } from "@/hooks/useDummyData";
import ExportYoloDialog from "@/components/ExportYoloDialog";
import PromptModeSidebar from "@/components/PromptModeSidebar";
import CanvasArea from "@/components/CanvasArea";
import RightPanels from "@/components/RightPanels";

const DatasetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    datasets, 
    getDatasetImages, 
    labels, 
    runOsd, 
    updateImageLabel, 
    deleteImageLabel,
    updateDatasetLabels
  } = useDummyData();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeRightPanel, setActiveRightPanel] = useState<"labels" | "ai">("labels");
  const [filter, setFilter] = useState<"all" | "unknown" | "clean">("all");
  const [promptMode, setPromptMode] = useState<"free" | "text" | "image">("free");
  const [textPrompt, setTextPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [imagePromptMethod, setImagePromptMethod] = useState<"upload" | "select">("upload");
  const [isRunningDetection, setIsRunningDetection] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  if (!id) {
    navigate("/datasets");
    return null;
  }

  const dataset = datasets.find(ds => ds.id === id);
  const images = getDatasetImages(id);
  const filteredImages = filter === "all" 
    ? images 
    : filter === "unknown" 
      ? images.filter(img => img.osdFlag === 'unknown')
      : images.filter(img => img.osdFlag === 'clean');
  
  const selectedImage = filteredImages[selectedImageIndex] || null;
  const datasetLabels = labels[id] || [];

  const handleRunOsd = () => {
    if (!dataset) return;
    
    // Set loading state
    setIsRunningDetection(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      runOsd(id);
      setIsRunningDetection(false);
      
      toast({
        title: "开集目标检测已完成",
        description: "检测结果已更新",
      });
    }, 2000);
  };

  const handleExport = (options: { includeUnknown: boolean; format: string }) => {
    toast({
      title: "导出成功",
      description: "YOLO格式数据已准备好下载",
    });
    
    setShowExportDialog(false);
    
    // 模拟下载
    setTimeout(() => {
      const a = document.createElement('a');
      a.style.display = 'none';
      document.body.appendChild(a);
      a.href = window.URL.createObjectURL(new Blob(['模拟YOLO数据输出'], { type: 'text/plain' }));
      a.setAttribute('download', `${dataset?.name}_yolo_export.zip`);
      a.click();
      document.body.removeChild(a);
    }, 1000);
  };

  const handleLabelChange = (labelId: string, newLabel: any) => {
    if (!selectedImage) return;
    updateImageLabel(id, selectedImage.id, labelId, newLabel);
  };

  const handleLabelDelete = (labelId: string) => {
    if (!selectedImage) return;
    deleteImageLabel(id, selectedImage.id, labelId);
  };

  const handleAddLabel = (newLabel: any) => {
    if (!selectedImage) return;
    const labelId = `label-${Date.now()}`;
    updateImageLabel(id, selectedImage.id, labelId, { ...newLabel, id: labelId });
  };

  const handleAddCategory = (category: string) => {
    if (!datasetLabels.includes(category)) {
      updateDatasetLabels(id, [...datasetLabels, category]);
    }
  };

  const handleRunDetection = () => {
    setIsRunningDetection(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Add a fake detected label based on the prompt mode
      if (selectedImage) {
        const newLabel = {
          id: `label-auto-${Date.now()}`,
          category: promptMode === "text" ? "文本检测" : promptMode === "image" ? "图像匹配" : "自动检测",
          type: "rect" as const, // Fix: Use a literal type with 'as const' to ensure type safety
          coordinates: [
            [50, 50],
            [200, 200]
          ],
          isAiSuggestion: true,
          confidence: 0.85
        };
        
        // Add the new label to the selected image
        updateImageLabel(id, selectedImage.id, newLabel.id, newLabel);
      }
      
      setIsRunningDetection(false);
      
      toast({
        title: "检测完成",
        description: promptMode === "free" ? "自动检测已完成" : 
                    promptMode === "text" ? "基于文本提示的检测已完成" : "基于图像的检测已完成",
      });
    }, 2000);
  };

  const handleAcceptAiSuggestion = (label: any) => {
    if (!selectedImage) return;
    const labelId = `label-${Date.now()}`;
    updateImageLabel(id, selectedImage.id, labelId, { 
      ...label, 
      id: labelId,
      isAiSuggestion: false 
    });
  };

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{dataset.name}</h1>
            <p className="text-gray-600">
              {dataset.imgCount.toLocaleString()} 张图像
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFilter(filter === "all" ? "unknown" : filter === "unknown" ? "clean" : "all")}
            >
              <Search className="mr-1 h-4 w-4" />
              {filter === "all" ? "全部图像" : filter === "unknown" ? "仅未知对象" : "仅已清理"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleRunOsd()}
              disabled={dataset.osdStatus === 'running' || isRunningDetection}
              className={dataset.osdStatus === 'done' ? "bg-blue-50 text-accent border-accent hover:bg-blue-100" : ""}
            >
              {(dataset.osdStatus === 'running' || isRunningDetection) ? (
                <>
                  <div className="h-4 w-4 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  OSD运行中...
                </>
              ) : (
                <>
                  <ZapIcon className="mr-1 h-4 w-4" />
                  {dataset.osdStatus === 'done' ? "OSD已完成" : "运行开集检测"}
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="mr-1 h-4 w-4" />
              导出YOLO
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-3 h-[calc(100vh-180px)]">
          {/* 左侧边栏 - 模式选择 */}
          <PromptModeSidebar
            promptMode={promptMode}
            setPromptMode={setPromptMode}
            textPrompt={textPrompt}
            setTextPrompt={setTextPrompt}
            imagePromptMethod={imagePromptMethod}
            setImagePromptMethod={setImagePromptMethod}
            referenceImage={referenceImage}
            setReferenceImage={setReferenceImage}
            selectionBox={selectionBox}
            isRunningDetection={isRunningDetection}
            onRunDetection={handleRunDetection}
          />
          
          {/* 中间标注画布 */}
          <CanvasArea
            selectedImage={selectedImage}
            imagePromptMethod={imagePromptMethod}
            promptMode={promptMode}
            onAddLabel={handleAddLabel}
            onUpdateLabel={handleLabelChange}
            onDeleteLabel={handleLabelDelete}
            onSelectRegion={setSelectionBox}
            setActiveRightPanel={setActiveRightPanel}
          />
          
          {/* 右侧栏 - 图像画廊和标签面板 */}
          <RightPanels
            filteredImages={filteredImages}
            selectedImageIndex={selectedImageIndex}
            setSelectedImageIndex={setSelectedImageIndex}
            selectedImage={selectedImage}
            datasetLabels={datasetLabels}
            activeRightPanel={activeRightPanel}
            setActiveRightPanel={setActiveRightPanel}
            onAddCategory={handleAddCategory}
            onUpdateLabel={handleLabelChange}
            onDeleteLabel={handleLabelDelete}
            onAcceptAiSuggestion={handleAcceptAiSuggestion}
          />
        </div>
      </main>
      
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导出 YOLO 格式</DialogTitle>
          </DialogHeader>
          <ExportYoloDialog onExport={handleExport} onCancel={() => setShowExportDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatasetDetailPage;
