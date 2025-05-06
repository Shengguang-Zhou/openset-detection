
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X } from "lucide-react";

interface NewDatasetDialogProps {
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

const NewDatasetDialog = ({ onSubmit, onCancel }: NewDatasetDialogProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files) {
      // 获取拖拽的文件
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast({
          variant: "destructive",
          title: "请输入数据集名称",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "请至少上传一个文件",
      });
      return;
    }
    
    setIsUploading(true);
    
    // 模拟上传进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        onSubmit(name, description);
        setIsUploading(false);
      }
    }, 300);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>新建数据集</DialogTitle>
        <DialogDescription>
          创建新的图像数据集用于标注和OSD检测
        </DialogDescription>
      </DialogHeader>
      
      <Tabs value={`step-${step}`} className="mt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="step-1" disabled>基本信息</TabsTrigger>
          <TabsTrigger value="step-2" disabled>上传文件</TabsTrigger>
          <TabsTrigger value="step-3" disabled>确认创建</TabsTrigger>
        </TabsList>
        
        <TabsContent value="step-1" className={step === 1 ? "block" : "hidden"}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">数据集名称</Label>
              <Input
                id="name"
                placeholder="输入数据集名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">描述 (可选)</Label>
              <Textarea
                id="description"
                placeholder="关于此数据集的简要描述..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="step-2" className={step === 2 ? "block" : "hidden"}>
          <div className="space-y-4 py-4">
            <div
              className="border-2 border-dashed rounded-md p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm mb-1">将文件拖放到此处，或</p>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary hover:text-primary-hover font-medium">浏览文件</span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                支持.jpg、.png、.zip格式
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label>已选择文件 ({files.length})</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(i)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="step-3" className={step === 3 ? "block" : "hidden"}>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">确认信息</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">数据集名称:</span> {name}
                </p>
                {description && (
                  <p className="text-sm">
                    <span className="font-medium">描述:</span> {description}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">文件数量:</span> {files.length}
                </p>
              </div>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>上传进度</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <DialogFooter className="mt-6">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={isUploading}
          >
            上一步
          </Button>
        )}
        
        <Button 
          type="button" 
          onClick={step < 3 ? handleNext : simulateUpload}
          disabled={isUploading}
          className="bg-primary hover:bg-primary-hover"
        >
          {isUploading ? (
            <>
              <span className="mr-2">上传中</span>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </>
          ) : step < 3 ? "下一步" : "创建数据集"}
        </Button>
      </DialogFooter>
    </>
  );
};

export default NewDatasetDialog;
