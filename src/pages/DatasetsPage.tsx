
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Search, Upload, Loader, CheckCircle, XCircle } from "lucide-react";
import { useDummyData } from "@/hooks/useDummyData";
import NewDatasetDialog from "@/components/NewDatasetDialog";

export interface Dataset {
  id: string;
  name: string;
  imgCount: number;
  osdStatus: 'idle' | 'running' | 'done' | 'error';
  updatedAt: string;
}

const DatasetsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [showNewDatasetDialog, setShowNewDatasetDialog] = useState(false);
  const { datasets, addDataset, removeDataset } = useDummyData();
  const { toast } = useToast();

  const handleCreateDataset = (name: string, description: string) => {
    const newDataset: Dataset = {
      id: `ds-${Date.now()}`,
      name,
      imgCount: Math.floor(Math.random() * 1000) + 50,
      osdStatus: "idle",
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    addDataset(newDataset);
    setShowNewDatasetDialog(false);
    
    toast({
      title: "数据集已创建",
      description: `${name} 已成功创建`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    removeDataset(id);
    toast({
      title: "数据集已删除",
      description: `${name} 已被删除`,
    });
  };

  const filteredDatasets = datasets.filter(dataset => 
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDatasets = [...filteredDatasets].sort((a, b) => {
    if (sortBy === "updatedAt") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "imgCount") {
      return b.imgCount - a.imgCount;
    }
    return 0;
  });

  const getOsdStatusElement = (status: Dataset['osdStatus']) => {
    switch (status) {
      case 'running':
        return (
          <div className="flex items-center">
            <Loader size={16} className="mr-2 animate-spin" />
            <span>进行中</span>
          </div>
        );
      case 'done':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle size={16} className="mr-2" />
            <span>完成</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <XCircle size={16} className="mr-2" />
            <span>错误</span>
          </div>
        );
      default:
        return <span className="text-gray-500">未运行</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">数据集列表</h1>
          
          <Dialog open={showNewDatasetDialog} onOpenChange={setShowNewDatasetDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-hover">
                <Upload size={16} className="mr-2" />
                新建数据集
              </Button>
            </DialogTrigger>
            <DialogContent>
              <NewDatasetDialog onSubmit={handleCreateDataset} onCancel={() => setShowNewDatasetDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索数据集..."
              className="pl-8 w-full sm:w-[350px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">排序：</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">更新时间</SelectItem>
                <SelectItem value="name">名称</SelectItem>
                <SelectItem value="imgCount">图像数量</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">名称</TableHead>
                <TableHead>图像数量</TableHead>
                <TableHead>OSD 状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDatasets.length > 0 ? (
                sortedDatasets.map((dataset) => (
                  <TableRow 
                    key={dataset.id}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      <Link to={`/datasets/${dataset.id}`} className="hover:underline hover:text-primary">
                        {dataset.name}
                      </Link>
                    </TableCell>
                    <TableCell>{dataset.imgCount.toLocaleString()}</TableCell>
                    <TableCell>{getOsdStatusElement(dataset.osdStatus)}</TableCell>
                    <TableCell>{dataset.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(dataset.id, dataset.name);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-red-50"
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchQuery ? (
                      <div className="text-gray-500">没有找到匹配的数据集</div>
                    ) : (
                      <div className="text-gray-500">
                        暂无数据集，点击上方"新建数据集"按钮创建
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default DatasetsPage;
