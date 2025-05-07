import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, ZapIcon, Search, Upload, Text, Image as ImageIcon } from "lucide-react";
import { useDummyData } from "@/hooks/useDummyData";
import ImageGallery from "@/components/ImageGallery";
import AnnotationCanvas from "@/components/AnnotationCanvas";
import LabelPanel from "@/components/LabelPanel";
import AISuggestionPanel from "@/components/AISuggestionPanel";
import ExportYoloDialog from "@/components/ExportYoloDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Label as ImageLabel } from "@/hooks/useDummyData"; // Import the Label type

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReferenceImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
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
          <div className="col-span-2 bg-white rounded-lg border overflow-hidden flex flex-col">
            <div className="p-3 border-b font-medium">检测模式</div>
            <div className="p-3 space-y-3">
              <RadioGroup value={promptMode} onValueChange={(value) => setPromptMode(value as "free" | "text" | "image")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="flex items-center">
                    <ZapIcon className="mr-2 h-4 w-4" />
                    无提示模式
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text" className="flex items-center">
                    <Text className="mr-2 h-4 w-4" />
                    文本提示模式
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image" className="flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    图像提示模式
                  </Label>
                </div>
              </RadioGroup>

              {/* 根据不同模式显示不同的提示输入区域 */}
              {promptMode === "text" && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">请输入文本提示</label>
                  <Textarea 
                    placeholder="描述要检测的对象..." 
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={handleRunDetection}
                    disabled={textPrompt.trim() === '' || isRunningDetection}
                  >
                    {isRunningDetection ? (
                      <>
                        <div className="h-4 w-4 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        检测中...
                      </>
                    ) : "运行检测"}
                  </Button>
                </div>
              )}

              {promptMode === "image" && (
                <div className="mt-4 space-y-3">
                  <RadioGroup 
                    value={imagePromptMethod} 
                    onValueChange={(v) => setImagePromptMethod(v as "upload" | "select")}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upload" id="upload" />
                      <Label htmlFor="upload">上传参考图像</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="select" id="select" />
                      <Label htmlFor="select">从画布选择区域</Label>
                    </div>
                  </RadioGroup>
                  
                  {imagePromptMethod === "upload" && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      {referenceImage ? (
                        <div className="space-y-2">
                          <img 
                            src={referenceImage} 
                            alt="参考图像" 
                            className="max-w-full h-auto max-h-[150px] mx-auto"
                          />
                          <Button size="sm" variant="outline" onClick={() => setReferenceImage(null)}>
                            移除图像
                          </Button>
                        </div>
                      ) : (
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-gray-400" />
                            <span className="mt-2 text-sm text-gray-500">
                              点击上传图像
                            </span>
                          </div>
                        </label>
                      )}
                    </div>
                  )}
                  
                  {imagePromptMethod === "select" && (
                    <div className="border rounded p-2">
                      <p className="text-xs text-gray-500">
                        请在画布上按住鼠标拖动创建红色选择框作为参考区域
                      </p>
                      {selectionBox && (
                        <div className="mt-2 text-xs text-blue-600">
                          已选择区域：X:{selectionBox.x.toFixed(0)} Y:{selectionBox.y.toFixed(0)} 宽:{selectionBox.width.toFixed(0)} 高:{selectionBox.height.toFixed(0)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    className="w-full" 
                    disabled={(imagePromptMethod === "upload" && !referenceImage) || 
                             (imagePromptMethod === "select" && !selectionBox) ||
                             isRunningDetection}
                    onClick={handleRunDetection}
                  >
                    {isRunningDetection ? (
                      <>
                        <div className="h-4 w-4 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        检测中...
                      </>
                    ) : "运行检测"}
                  </Button>
                </div>
              )}
              
              {promptMode === "free" && (
                <Button 
                  size="sm" 
                  className="w-full mt-4" 
                  onClick={handleRunDetection}
                  disabled={isRunningDetection}
                >
                  {isRunningDetection ? (
                    <>
                      <div className="h-4 w-4 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      检测中...
                    </>
                  ) : "运行检测"}
                </Button>
              )}
            </div>
          </div>
          
          {/* 中间标注画布 */}
          <div className="col-span-7 bg-white rounded-lg border overflow-hidden flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="font-medium truncate">
                {selectedImage ? selectedImage.fileName : "未选择图像"}
              </div>
              
              <div className="flex items-center">
                {selectedImage && selectedImage.osdFlag === 'unknown' && (
                  <Button
                    size="sm"
                    className="bg-accent hover:bg-blue-700"
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
                <AnnotationCanvas
                  image={selectedImage}
                  onAddLabel={handleAddLabel}
                  onUpdateLabel={handleLabelChange}
                  onDeleteLabel={handleLabelDelete}
                  isSelectMode={imagePromptMethod === "select" && promptMode === "image"}
                  onSelectRegion={(region) => setSelectionBox(region)}
                />
              ) : (
                <div className="text-gray-500">请选择一张图像以开始标注</div>
              )}
            </div>
          </div>
          
          {/* 右侧栏 - 图像画廊和标签面板 */}
          <div className="col-span-3 flex flex-col gap-3">
            {/* 上方图像画廊 */}
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
            
            {/* 下方标签面板 */}
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
                      onAddCategory={handleAddCategory}
                      onUpdateLabel={handleLabelChange}
                      onDeleteLabel={handleLabelDelete}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="ai" className="flex-1 overflow-y-auto m-0 border-none p-0">
                  {selectedImage && (
                    <AISuggestionPanel
                      image={selectedImage}
                      categories={datasetLabels}
                      onAcceptSuggestion={(label) => {
                        const labelId = `label-${Date.now()}`;
                        updateImageLabel(id, selectedImage.id, labelId, { 
                          ...label, 
                          id: labelId,
                          isAiSuggestion: false 
                        });
                      }}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
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
