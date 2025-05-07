
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ZapIcon, Text, Image as ImageIcon, Upload } from "lucide-react";

interface PromptModeSidebarProps {
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

const PromptModeSidebar = ({
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
}: PromptModeSidebarProps) => {
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
              onClick={onRunDetection}
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
              onClick={onRunDetection}
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
            onClick={onRunDetection}
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
  );
};

export default PromptModeSidebar;
