
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, ZapIcon, Search } from "lucide-react";
import { useDummyData } from "@/hooks/useDummyData";
import ImageList from "@/components/ImageList";
import AnnotationCanvas from "@/components/AnnotationCanvas";
import LabelPanel from "@/components/LabelPanel";
import AISuggestionPanel from "@/components/AISuggestionPanel";
import ExportYoloDialog from "@/components/ExportYoloDialog";

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
    
    runOsd(id);
    toast({
      title: "开集目标检测已启动",
      description: "任务正在后台运行，请稍候...",
    });
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
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{dataset.name}</h1>
            <p className="text-gray-600">
              {dataset.imgCount.toLocaleString()} 张图像
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setFilter(filter === "all" ? "unknown" : filter === "unknown" ? "clean" : "all")}
            >
              <Search className="mr-2 h-4 w-4" />
              {filter === "all" ? "全部图像" : filter === "unknown" ? "仅未知对象" : "仅已清理"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleRunOsd()}
              disabled={dataset.osdStatus === 'running'}
              className={dataset.osdStatus === 'done' ? "bg-blue-50 text-accent border-accent hover:bg-blue-100" : ""}
            >
              <ZapIcon className="mr-2 h-4 w-4" />
              {dataset.osdStatus === 'running' ? "OSD运行中..." : dataset.osdStatus === 'done' ? "OSD已完成" : "运行开集检测"}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              导出YOLO
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* 左侧图像缩略图列表 */}
          <div className="col-span-3 bg-white rounded-lg border overflow-hidden flex flex-col">
            <div className="p-4 border-b font-medium">图像列表</div>
            <div className="flex-1 overflow-y-auto">
              <ImageList 
                images={filteredImages}
                selectedIndex={selectedImageIndex}
                onSelect={setSelectedImageIndex}
              />
            </div>
          </div>
          
          {/* 中间标注画布 */}
          <div className="col-span-6 bg-white rounded-lg border overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
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
                />
              ) : (
                <div className="text-gray-500">请选择一张图像以开始标注</div>
              )}
            </div>
            
            <div className="p-3 border-t flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">-</Button>
                  <span className="mx-2">100%</span>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">+</Button>
                </div>
                
                <button className="text-blue-600 hover:underline">显示快捷键</button>
              </div>
              
              <div className="text-gray-500">
                {selectedImageIndex + 1} / {filteredImages.length}
              </div>
            </div>
          </div>
          
          {/* 右侧标签面板 */}
          <div className="col-span-3 bg-white rounded-lg border overflow-hidden flex flex-col">
            <Tabs value={activeRightPanel} className="flex-1 flex flex-col">
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
