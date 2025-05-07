
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
        <span className="text-lg font-bold mr-2">DINO-X</span>
        <span className="text-xs text-gray-500">图像检测与多模态智能</span>
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
                <span>DINO-X</span>
                <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <Label className="font-medium">图片</Label>
              </div>
              <div className="border border-dashed rounded-md p-4 text-center">
                <div className="mb-2">
                  <img 
                    src="https://picsum.photos/200/150?random=1" 
                    alt="Sample" 
                    className="max-h-[150px] mx-auto rounded"
                  />
                </div>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                  <span>没有图片？尝试上传</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <Label className="font-medium">显示提示</Label>
              </div>
              <RadioGroup defaultValue="none" className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">无需提示 (检测万物)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text">文本提示</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image" className="flex items-center">
                    <span className="bg-red-50 text-red-500 text-xs px-1 rounded mr-1">新</span>
                    指代提示
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              开始运行
            </Button>
          </TabsContent>
          
          <TabsContent value="intro" className="m-0 p-3">
            <div className="text-sm text-gray-600">
              <p>DINO-X 是一款强大的多模态图像检测工具，支持：</p>
              <ul className="list-disc pl-5 my-2 space-y-1">
                <li>无提示开放域检测</li>
                <li>文本引导检测</li>
                <li>图像参考检测</li>
                <li>多种标注格式支持</li>
              </ul>
              <p>通过简单的操作即可实现专业级的图像标注和检测效果。</p>
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
