
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";

interface ExportYoloDialogProps {
  onExport: (options: { includeUnknown: boolean; format: string }) => void;
  onCancel: () => void;
}

const ExportYoloDialog = ({ onExport, onCancel }: ExportYoloDialogProps) => {
  const [includeUnknown, setIncludeUnknown] = useState(false);
  const [format, setFormat] = useState("xywh");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    // 模拟导出过程
    setTimeout(() => {
      onExport({ includeUnknown, format });
      setIsExporting(false);
    }, 1500);
  };

  return (
    <div className="py-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">坐标格式</h4>
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="xywh" id="xywh" />
                <Label htmlFor="xywh">XYWH (中心点 + 宽高)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xyxy" id="xyxy" />
                <Label htmlFor="xyxy">XYXY (左上角 + 右下角)</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="unknown-objects">包含未知目标框</Label>
              <Switch
                id="unknown-objects"
                checked={includeUnknown}
                onCheckedChange={setIncludeUnknown}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {includeUnknown
                ? "未知目标将以 'unknown' 类别导出"
                : "未知目标将被排除"}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">导出内容</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>图像文件 (JPG/PNG)</li>
            <li>标签文件 (TXT)</li>
            <li>classes.txt (类别列表)</li>
          </ul>
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isExporting}
        >
          取消
        </Button>
        <Button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="bg-primary hover:bg-primary-hover"
        >
          {isExporting ? (
            <>
              <span className="mr-2">导出中</span>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </>
          ) : (
            "导出"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ExportYoloDialog;
