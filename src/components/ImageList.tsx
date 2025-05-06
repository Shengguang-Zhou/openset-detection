
import { Badge } from "@/components/ui/badge";
import { CheckCircle, HelpCircle } from "lucide-react";

interface Image {
  id: string;
  fileName: string;
  thumbnail: string;
  osdFlag: 'unknown' | 'reviewed' | 'clean';
}

interface ImageListProps {
  images: Image[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const ImageList = ({ images, selectedIndex, onSelect }: ImageListProps) => {
  if (images.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        当前数据集没有图像
      </div>
    );
  }

  return (
    <div className="space-y-1 p-1">
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`flex items-center p-2 rounded-md cursor-pointer ${
            selectedIndex === index ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"
          }`}
          onClick={() => onSelect(index)}
        >
          <div className="relative h-14 w-14 rounded overflow-hidden bg-gray-200 flex-shrink-0 mr-3">
            {/* 使用占位图或实际缩略图 */}
            <img
              src={image.thumbnail}
              alt={image.fileName}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://picsum.photos/200/150?grayscale";
              }}
            />
            
            {/* OSD状态标记 */}
            {image.osdFlag === "unknown" && (
              <div className="absolute top-0.5 right-0.5 bg-yellow-500 rounded-full p-0.5">
                <HelpCircle className="h-3 w-3 text-white" />
              </div>
            )}
            {image.osdFlag === "reviewed" && (
              <div className="absolute top-0.5 right-0.5 bg-green-500 rounded-full p-0.5">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <p className="text-sm truncate">{image.fileName}</p>
            <div className="flex gap-1 mt-1">
              {image.osdFlag === "unknown" && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-200">
                  未知对象
                </Badge>
              )}
              {image.osdFlag === "reviewed" && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-800 border-green-200">
                  已审核
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageList;
