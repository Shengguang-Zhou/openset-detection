import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ZapIcon,
  Text,
  Image as ImageIcon,
  Upload,
  ChevronDown,
  Maximize2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImprovedPromptSidebarProps {
  promptMode: "free" | "text" | "image";
  setPromptMode: (mode: "free" | "text" | "image") => void;
  textPrompt: string;
  setTextPrompt: (text: string) => void;
  imagePromptMethod: "upload" | "select";
  setImagePromptMethod: (method: "upload" | "select") => void;
  referenceImage: string | null;
  setReferenceImage: (image: string | null) => void;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  isRunningDetection: boolean;
  onRunDetection: () => void;
  categories: string[]; // Added categories prop
}

export function ImprovedPromptSidebar({
  promptMode,
  setPromptMode,
  textPrompt,
  setTextPrompt,
  imagePromptMethod,
  setImagePromptMethod,
  referenceImage,
  setReferenceImage,
  selectionBox,
  isRunningDetection,
  onRunDetection,
  categories
}: ImprovedPromptSidebarProps) {
  const [activeTab, setActiveTab] = useState("usage");
  const [modelValue, setModelValue] = useState("智拓标注 Pro");
  const [showFullImageDialog, setShowFullImageDialog] = useState(false);
  const canvasPreviewRef = useRef<HTMLDivElement>(null);
  
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b font-medium flex items-center">
        <span className="text-lg font-bold mr-2 text-primary">智拓标注</span>
        <span className="text-xs text-gray-500">AI 图像标注系统</span>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <div className="border-b">
          <TabsList className="w-full justify-start rounded-none bg-white border-b">
            <TabsTrigger 
              value="usage" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              使用
            </TabsTrigger>
            <TabsTrigger 
              value="intro" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              介绍
            </TabsTrigger>
            <TabsTrigger 
              value="api" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
            >
              API
            </TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1">
          <TabsContent value="usage" className="m-0 p-3 space-y-4">
            <div className="space-y-2">
              <Label className="font-medium">模型</Label>
              <Select value={modelValue} onValueChange={setModelValue}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="智拓标注 Pro">智拓标注 Pro</SelectItem>
                  <SelectItem value="智拓标注 Max">智拓标注 Max</SelectItem>
                  <SelectItem value="智拓标注 Ultra">智拓标注 Ultra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <Label className="font-medium">标注模式</Label>
              </div>
              <RadioGroup 
                value={promptMode} 
                onValueChange={(value) => setPromptMode(value as "free" | "text" | "image")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="flex items-center">
                    <ZapIcon className="mr-2 h-4 w-4 text-primary" />
                    无提示模式
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text" className="flex items-center">
                    <Text className="mr-2 h-4 w-4 text-primary" />
                    文本提示
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image" className="flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4 text-primary" />
                    <span className="flex items-center">
                      <span className="bg-orange-50 text-primary text-xs px-1 rounded mr-1">推荐</span>
                      图像提示
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Display different inputs based on mode */}
            {promptMode === "text" && (
              <div className="space-y-2">
                <Label className="font-medium">文本提示</Label>
                <Textarea 
                  placeholder="描述要检测的对象..." 
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
            
            {promptMode === "image" && (
              <div className="space-y-3">
                <Label className="font-medium">图像提示方式</Label>
                <RadioGroup 
                  value={imagePromptMethod} 
                  onValueChange={(v) => setImagePromptMethod(v as "upload" | "select")}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="select" id="select" />
                    <Label htmlFor="select">从当前图像选择区域</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" />
                    <Label htmlFor="upload">上传参考图像</Label>
                  </div>
                </RadioGroup>
                
                {imagePromptMethod === "select" && (
                  <div className="border rounded p-2 space-y-2">
                    <p className="text-xs text-gray-500">
                      请在画布上按住鼠标拖动创建橙色选择框作为参考区域
                    </p>
                    
                    <div className="relative">
                      <div 
                        ref={canvasPreviewRef} 
                        className="h-[120px] bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => setShowFullImageDialog(true)}
                      >
                        {selectionBox ? (
                          <div className="relative w-full h-full">
                            <img 
                              src="https://picsum.photos/800/600" 
                              alt="当前图像" 
                              className="w-full h-full object-cover"
                            />
                            <div 
                              className="absolute border-2 border-primary bg-primary/10"
                              style={{
                                left: `${selectionBox.x * 100 / 800}%`, 
                                top: `${selectionBox.y * 100 / 600}%`,
                                width: `${selectionBox.width * 100 / 800}%`, 
                                height: `${selectionBox.height * 100 / 600}%`
                              }}
                            ></div>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                            <span className="text-xs text-gray-500 ml-2">请选择区域</span>
                          </>
                        )}
                      </div>
                      
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="absolute top-1 right-1 h-6 w-6 bg-white" 
                        onClick={() => setShowFullImageDialog(true)}
                      >
                        <Maximize2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {selectionBox && (
                      <div className="mt-2 text-xs text-primary">
                        已选择区域：X:{selectionBox.x.toFixed(0)} Y:{selectionBox.y.toFixed(0)} 宽:{selectionBox.width.toFixed(0)} 高:{selectionBox.height.toFixed(0)}
                      </div>
                    )}
                  </div>
                )}
                
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
              </div>
            )}
            
            <Button 
              className="w-full bg-primary hover:bg-primary-hover"
              onClick={onRunDetection}
              disabled={isRunningDetection || 
                      (promptMode === "text" && textPrompt.trim() === '') ||
                      (promptMode === "image" && imagePromptMethod === "upload" && !referenceImage) ||
                      (promptMode === "image" && imagePromptMethod === "select" && !selectionBox)}
            >
              {isRunningDetection ? (
                <>
                  <div className="h-4 w-4 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  检测中...
                </>
              ) : "开始标注"}
            </Button>
          </TabsContent>
          
          <TabsContent value="intro" className="m-0 p-3">
            <div className="text-sm text-gray-600">
              <p>智拓标注是一款强大的多模态图像标注工具，支持：</p>
              <ul className="list-disc pl-5 my-2 space-y-1">
                <li>无提示开放域标注</li>
                <li>文本引导标注</li>
                <li>图像参考标注</li>
                <li>多种标注格式支持</li>
              </ul>
              <p>通过简单的操作即可实现专业级的图像标注效果。</p>
            </div>
          </TabsContent>
          
          <TabsContent value="api" className="m-0 p-3">
            <div className="text-sm text-gray-600">
              <p>API 接口文档：</p>
              <pre className="bg-gray-100 p-2 rounded my-2 overflow-x-auto">
                POST /api/detect<br/>
                Content-Type: multipart/form-data<br/>
                {`{
  "image": <image_file>,
  "mode": "free|text|image",
  "prompt": "optional text prompt"
}`}
              </pre>
              <p>详细文档请参考开发者中心。</p>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Full-size image selection dialog */}
      <Dialog open={showFullImageDialog} onOpenChange={setShowFullImageDialog}>
        <DialogContent className="max-w-4xl p-0">
          <div className="p-4 border-b">
            <h2 className="font-medium">选择图像区域</h2>
            <p className="text-sm text-gray-500">在图像上拖动鼠标选择目标区域</p>
          </div>
          <div className="p-4 flex items-center justify-center min-h-[400px]">
            <div className="relative w-full h-[400px]">
              <img 
                src="https://picsum.photos/800/600" 
                alt="当前图像" 
                className="w-full h-full object-contain"
              />
              {selectionBox && (
                <div 
                  className="absolute border-2 border-primary bg-primary/10"
                  style={{
                    left: `${selectionBox.x}px`, 
                    top: `${selectionBox.y}px`,
                    width: `${selectionBox.width}px`, 
                    height: `${selectionBox.height}px`
                  }}
                ></div>
              )}
            </div>
          </div>
          <div className="p-4 border-t flex justify-between">
            <Button variant="outline" onClick={() => setShowFullImageDialog(false)}>
              取消
            </Button>
            <Button onClick={() => setShowFullImageDialog(false)}>
              确认选择
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
