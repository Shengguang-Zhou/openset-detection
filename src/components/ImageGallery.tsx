
import { Badge } from "@/components/ui/badge";
import { CheckCircle, HelpCircle } from "lucide-react";

interface Image {
  id: string;
  fileName: string;
  thumbnail: string;
  osdFlag: 'unknown' | 'reviewed' | 'clean';
}

interface ImageGalleryProps {
  images: Image[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const ImageGallery = ({ images, selectedIndex, onSelect }: ImageGalleryProps) => {
  if (images.length === 0) {
    return (
      <div className="col-span-4 p-4 text-center text-gray-500">
        当前数据集没有图像
      </div>
    );
  }

  return (
    <>
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`relative cursor-pointer ${
            selectedIndex === index ? "ring-2 ring-primary" : "hover:opacity-80"
          }`}
          onClick={() => onSelect(index)}
        >
          <div className="aspect-square w-full overflow-hidden rounded">
            <img
              src={image.thumbnail || `https://picsum.photos/200/200?random=${index}`}
              alt={image.fileName}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://picsum.photos/200/200?grayscale&random=${index}`;
              }}
            />
          </div>
          
          {/* OSD状态标记 */}
          {image.osdFlag === "unknown" && (
            <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-0.5">
              <HelpCircle className="h-3 w-3 text-white" />
            </div>
          )}
          {image.osdFlag === "reviewed" && (
            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
          
          {/* Selected indicator */}
          {selectedIndex === index && (
            <div className="absolute inset-0 bg-primary/10 border border-primary rounded"></div>
          )}
          
          {/* File name tooltip on hover */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
            {image.fileName}
          </div>
        </div>
      ))}
    </>
  );
};

export default ImageGallery;
