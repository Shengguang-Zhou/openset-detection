
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HelpCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useDummyData } from "@/hooks/useDummyData";

const OsdReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { datasets, getDatasetImages } = useDummyData();
  const [reviewedImages, setReviewedImages] = useState<Set<string>>(new Set());

  if (!id) {
    navigate("/datasets");
    return null;
  }

  const dataset = datasets.find(ds => ds.id === id);
  const allImages = getDatasetImages(id);
  
  // 筛选出有未知对象的图像
  const imagesWithUnknown = allImages.filter(img => img.osdFlag === 'unknown');

  const handleMarkReviewed = (imageId: string) => {
    const updatedReviewed = new Set(reviewedImages);
    updatedReviewed.add(imageId);
    setReviewedImages(updatedReviewed);
    
    toast({
      title: "已标记为已审核",
      description: "图像状态已更新",
    });
  };

  const handleComplete = () => {
    toast({
      title: "审核完成",
      description: `已审核 ${reviewedImages.size} 张图像`,
    });
    navigate(`/datasets/${id}`);
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
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/datasets/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回数据集
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">开集检测审核</h1>
              <p className="text-gray-600">
                {dataset.name} - 共 {imagesWithUnknown.length} 张包含未知对象的图像
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>图像</TableHead>
                <TableHead>文件名</TableHead>
                <TableHead>未知对象数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imagesWithUnknown.length > 0 ? (
                imagesWithUnknown.map((image) => {
                  const unknownCount = image.labels.filter(label => label.category === "unknown").length;
                  const isReviewed = reviewedImages.has(image.id);
                  
                  return (
                    <TableRow key={image.id}>
                      <TableCell>
                        <div className="relative h-12 w-16 rounded overflow-hidden bg-gray-200">
                          <img
                            src={image.thumbnail}
                            alt={image.fileName}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute top-0.5 right-0.5 bg-yellow-500 rounded-full p-0.5">
                            <HelpCircle className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{image.fileName}</TableCell>
                      <TableCell>{unknownCount}</TableCell>
                      <TableCell>
                        {isReviewed ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle size={16} className="mr-2" />
                            <span>已审核</span>
                          </div>
                        ) : (
                          <span className="text-yellow-600">待审核</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link to={`/datasets/${id}?image=${image.id}`}>查看</Link>
                          </Button>
                          
                          {!isReviewed && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500 hover:bg-green-50 text-green-600"
                              onClick={() => handleMarkReviewed(image.id)}
                            >
                              标记为已审核
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="text-gray-500">
                      当前数据集中没有未知对象
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleComplete}
            className="bg-primary hover:bg-primary-hover"
          >
            完成审核
          </Button>
        </div>
      </main>
    </div>
  );
};

export default OsdReviewPage;
