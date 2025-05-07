
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZapIcon, Text, Image as ImageIcon, Upload } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  onRunDetection
}: ImprovedPromptSidebarProps) {
  const [activeTab, setActiveTab] = useState("usage");
  
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
              <div className="border rounded-md p-2 flex items-center justify-between">
                <span>智拓标注 Pro</span>
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
                </svg>
              </div>
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
                      请在画布上按住鼠标拖动创建橙色选择框作为参考区域
                    </p>
                    {selectionBox && (
                      <div className="mt-2 text-xs text-primary">
                        已选择区域：X:{selectionBox.x.toFixed(0)} Y:{selectionBox.y.toFixed(0)} 宽:{selectionBox.width.toFixed(0)} 高:{selectionBox.height.toFixed(0)}
                      </div>
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
    </div>
  );
}
