
import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Line, Circle, Group, Text } from "react-konva";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Rectangle, Polygon, Pencil } from "lucide-react";
import { Label } from "@/hooks/useDummyData";

interface Image {
  id: string;
  fileName: string;
  thumbnail: string;
  labels: Label[];
}

interface AnnotationCanvasProps {
  image: Image;
  onAddLabel: (label: Omit<Label, "id">) => void;
  onUpdateLabel: (id: string, label: Partial<Label>) => void;
  onDeleteLabel: (id: string) => void;
}

const AnnotationCanvas = ({
  image,
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
}: AnnotationCanvasProps) => {
  const [tool, setTool] = useState<"select" | "rect" | "polygon" | "point">("select");
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<number[]>([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const { toast } = useToast();

  // 调整画布大小以适应容器
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setStageSize({
          width: clientWidth,
          height: clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 加载图像
  useEffect(() => {
    const img = imageRef.current;
    img.src = image.thumbnail || "https://picsum.photos/800/600";
    img.onload = () => {
      setIsImageLoaded(true);
      
      // 计算适当的缩放以适应舞台
      if (stageSize.width && stageSize.height) {
        const scaleX = stageSize.width / img.width;
        const scaleY = stageSize.height / img.height;
        const newScale = Math.min(scaleX, scaleY) * 0.9;
        
        setScale(newScale);
        setPosition({
          x: (stageSize.width - img.width * newScale) / 2,
          y: (stageSize.height - img.height * newScale) / 2,
        });
      }
    };
    img.onerror = () => {
      toast({
        variant: "destructive",
        title: "图像加载失败",
        description: "无法加载图像，请稍后重试",
      });
      setIsImageLoaded(false);
    };
  }, [image.thumbnail, stageSize, toast]);

  // 处理鼠标按下事件
  const handleMouseDown = (e: any) => {
    if (tool === "select" || !isImageLoaded) return;

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const x = (pointerPos.x - position.x) / scale;
    const y = (pointerPos.y - position.y) / scale;

    if (tool === "rect" && !drawing) {
      setDrawing(true);
      setPoints([x, y, x, y]); // 初始矩形: [x1, y1, x2, y2]
    } else if (tool === "point" && !drawing) {
      // 点直接创建标签
      onAddLabel({
        category: "未标注",
        type: "point",
        coordinates: [[x, y]],
      });
      setTool("select"); // 创建后切换回选择模式
    } else if (tool === "polygon") {
      if (!drawing) {
        setDrawing(true);
        setPoints([x, y]);
      } else {
        // 继续添加多边形点
        setPoints([...points, x, y]);
      }
    }
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: any) => {
    if (!drawing || tool === "select" || !isImageLoaded) return;

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const x = (pointerPos.x - position.x) / scale;
    const y = (pointerPos.y - position.y) / scale;

    if (tool === "rect") {
      // 更新矩形终点
      setPoints([points[0], points[1], x, y]);
    } else if (tool === "polygon" && points.length >= 2) {
      // 预览下一个多边形点
      const updatedPoints = [...points.slice(0, points.length)];
      setPoints(updatedPoints);
    }
  };

  // 处理鼠标抬起事件
  const handleMouseUp = (e: any) => {
    if (!drawing || tool === "select" || !isImageLoaded) return;

    if (tool === "rect") {
      const x1 = points[0];
      const y1 = points[1];
      const x2 = points[2];
      const y2 = points[3];

      // 确保矩形有一定大小
      if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
        onAddLabel({
          category: "未标注",
          type: "rect",
          coordinates: [
            [Math.min(x1, x2), Math.min(y1, y2)],
            [Math.max(x1, x2), Math.max(y1, y2)],
          ],
        });
      }

      setDrawing(false);
      setPoints([]);
      setTool("select"); // 创建后切换回选择模式
    }
  };

  // 双击完成多边形
  const handleDblClick = (e: any) => {
    if (tool !== "polygon" || !drawing || points.length < 6) return; // 至少需要3个点

    // 将点转换为坐标对
    const coordinates = [];
    for (let i = 0; i < points.length; i += 2) {
      coordinates.push([points[i], points[i + 1]]);
    }

    onAddLabel({
      category: "未标注",
      type: "polygon",
      coordinates,
    });

    setDrawing(false);
    setPoints([]);
    setTool("select"); // 创建后切换回选择模式
  };

  // 处理标签选择
  const handleLabelSelect = (labelId: string) => {
    setSelectedLabelId(selectedLabelId === labelId ? null : labelId);
  };

  // 删除当前选中的标签
  const handleDeleteSelected = () => {
    if (selectedLabelId) {
      onDeleteLabel(selectedLabelId);
      setSelectedLabelId(null);
    }
  };

  // 取消当前绘制
  const handleCancelDrawing = () => {
    setDrawing(false);
    setPoints([]);
    setTool("select");
  };

  // 渲染标签
  const renderLabels = () => {
    return image.labels.map((label) => {
      const isSelected = label.id === selectedLabelId;
      
      if (label.type === "rect") {
        const [topLeft, bottomRight] = label.coordinates;
        const width = bottomRight[0] - topLeft[0];
        const height = bottomRight[1] - topLeft[1];

        return (
          <Group key={label.id}>
            <Rect
              x={topLeft[0]}
              y={topLeft[1]}
              width={width}
              height={height}
              stroke={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
              strokeWidth={isSelected ? 2.5 : 1.5}
              dash={label.isAiSuggestion ? [5, 2] : undefined}
              fill={isSelected ? "rgba(249, 115, 22, 0.1)" : label.isAiSuggestion ? "rgba(37, 99, 235, 0.1)" : "transparent"}
              onClick={() => handleLabelSelect(label.id)}
            />
            <Text
              x={topLeft[0]}
              y={topLeft[1] - 20}
              text={`${label.category} ${label.confidence ? `(${Math.round(label.confidence * 100)}%)` : ""}`}
              fontSize={14}
              fill={label.isAiSuggestion ? "#2563EB" : "#F97316"}
              padding={2}
              background={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
            />
          </Group>
        );
      } else if (label.type === "polygon") {
        const flatPoints = label.coordinates.flat();
        
        return (
          <Group key={label.id}>
            <Line
              points={flatPoints}
              closed
              stroke={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
              strokeWidth={isSelected ? 2.5 : 1.5}
              dash={label.isAiSuggestion ? [5, 2] : undefined}
              fill={isSelected ? "rgba(249, 115, 22, 0.1)" : label.isAiSuggestion ? "rgba(37, 99, 235, 0.1)" : "transparent"}
              onClick={() => handleLabelSelect(label.id)}
            />
            {label.coordinates.map((point, i) => (
              <Circle
                key={i}
                x={point[0]}
                y={point[1]}
                radius={isSelected ? 4 : 3}
                fill={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
                onClick={() => handleLabelSelect(label.id)}
              />
            ))}
            <Text
              x={label.coordinates[0][0]}
              y={label.coordinates[0][1] - 20}
              text={`${label.category} ${label.confidence ? `(${Math.round(label.confidence * 100)}%)` : ""}`}
              fontSize={14}
              fill={label.isAiSuggestion ? "#2563EB" : "#F97316"}
              padding={2}
              background={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
            />
          </Group>
        );
      } else if (label.type === "point") {
        const [point] = label.coordinates;
        
        return (
          <Group key={label.id}>
            <Circle
              x={point[0]}
              y={point[1]}
              radius={isSelected ? 6 : 4}
              stroke={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
              strokeWidth={2}
              fill={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
              onClick={() => handleLabelSelect(label.id)}
            />
            <Text
              x={point[0] + 10}
              y={point[1] - 10}
              text={`${label.category} ${label.confidence ? `(${Math.round(label.confidence * 100)}%)` : ""}`}
              fontSize={14}
              fill={label.isAiSuggestion ? "#2563EB" : "#F97316"}
              padding={2}
              background={isSelected ? "#F97316" : label.isAiSuggestion ? "#2563EB" : "#F97316"}
            />
          </Group>
        );
      }
      
      return null;
    });
  };

  // 渲染当前绘制的形状
  const renderDrawing = () => {
    if (!drawing || points.length === 0) return null;

    if (tool === "rect" && points.length === 4) {
      const x1 = points[0];
      const y1 = points[1];
      const x2 = points[2];
      const y2 = points[3];
      const width = x2 - x1;
      const height = y2 - y1;

      return (
        <Rect
          x={Math.min(x1, x2)}
          y={Math.min(y1, y2)}
          width={Math.abs(width)}
          height={Math.abs(height)}
          stroke="#F97316"
          strokeWidth={2}
          dash={[5, 2]}
        />
      );
    } else if (tool === "polygon" && points.length >= 2) {
      return (
        <Line
          points={points}
          stroke="#F97316"
          strokeWidth={2}
          dash={[5, 2]}
        />
      );
    }

    return null;
  };

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* 工具栏 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white shadow-md rounded-lg p-1 flex space-x-1">
        <Button
          size="icon"
          variant={tool === "select" ? "default" : "outline"}
          onClick={() => setTool("select")}
          className={tool === "select" ? "bg-primary hover:bg-primary-hover" : ""}
        >
          <span className="sr-only">选择</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </Button>
        <Button
          size="icon"
          variant={tool === "rect" ? "default" : "outline"}
          onClick={() => setTool("rect")}
          className={tool === "rect" ? "bg-primary hover:bg-primary-hover" : ""}
        >
          <span className="sr-only">矩形</span>
          <Rectangle size={16} />
        </Button>
        <Button
          size="icon"
          variant={tool === "polygon" ? "default" : "outline"}
          onClick={() => setTool("polygon")}
          className={tool === "polygon" ? "bg-primary hover:bg-primary-hover" : ""}
        >
          <span className="sr-only">多边形</span>
          <Polygon size={16} />
        </Button>
        <Button
          size="icon"
          variant={tool === "point" ? "default" : "outline"}
          onClick={() => setTool("point")}
          className={tool === "point" ? "bg-primary hover:bg-primary-hover" : ""}
        >
          <span className="sr-only">点</span>
          <Pencil size={16} />
        </Button>
        
        {selectedLabelId && (
          <Button
            size="icon"
            variant="outline"
            onClick={handleDeleteSelected}
            className="border-red-500 hover:bg-red-50 text-red-500"
          >
            <span className="sr-only">删除</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </Button>
        )}
        
        {drawing && (
          <Button
            size="icon"
            variant="outline"
            onClick={handleCancelDrawing}
            className="border-red-500 hover:bg-red-50 text-red-500"
          >
            <span className="sr-only">取消</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        )}
      </div>

      {/* 标注提示 */}
      {drawing && tool === "polygon" && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 bg-white shadow-md rounded-lg px-3 py-1 text-sm">
          单击添加点，双击完成
        </div>
      )}

      {/* Konva舞台 */}
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDblClick}
      >
        <Layer
          offsetX={-position.x / scale}
          offsetY={-position.y / scale}
          scaleX={scale}
          scaleY={scale}
        >
          {/* 背景图片 */}
          {isImageLoaded && (
            <Rect
              width={imageRef.current.width}
              height={imageRef.current.height}
              fillPatternImage={imageRef.current}
            />
          )}
          
          {/* 标签 */}
          {renderLabels()}
          
          {/* 正在绘制的形状 */}
          {renderDrawing()}
        </Layer>
      </Stage>

      {/* 加载指示器 */}
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">加载图像中...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationCanvas;
