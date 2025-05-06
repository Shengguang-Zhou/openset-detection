import { useState, useEffect } from "react";
import { Dataset } from "@/pages/DatasetsPage";

interface Image {
  id: string;
  fileName: string;
  thumbnail: string;
  osdFlag: 'unknown' | 'reviewed' | 'clean';
  labels: Label[];
}

export interface Label {
  id: string;
  category: string;
  type: 'rect' | 'polygon' | 'point';
  coordinates: number[][];
  isAiSuggestion?: boolean;
  confidence?: number;
}

// 初始数据集数据
const initialDatasets: Dataset[] = [
  {
    id: "ds-1",
    name: "汽车图像",
    imgCount: 1024,
    osdStatus: "done",
    updatedAt: "2025-05-05",
  },
  {
    id: "ds-2",
    name: "道路场景",
    imgCount: 2300,
    osdStatus: "running",
    updatedAt: "2025-05-04",
  },
  {
    id: "ds-3",
    name: "行人数据集",
    imgCount: 850,
    osdStatus: "idle",
    updatedAt: "2025-05-03",
  },
];

// 为每个数据集生成示例图像
const generateImagesForDataset = (datasetId: string): Record<string, Image[]> => {
  const imageCount = Math.floor(Math.random() * 20) + 10;
  const images: Image[] = [];
  
  for (let i = 1; i <= imageCount; i++) {
    const osdFlags: ('unknown' | 'reviewed' | 'clean')[] = ['unknown', 'reviewed', 'clean'];
    const randomFlag = osdFlags[Math.floor(Math.random() * osdFlags.length)];
    
    const labels: Label[] = [];
    const labelCount = Math.floor(Math.random() * 3);
    
    for (let j = 0; j < labelCount; j++) {
      const categories = ["汽车", "行人", "自行车", "摩托车", "卡车", "公交车", "交通灯", "unknown"];
      const types: ('rect' | 'polygon' | 'point')[] = ["rect", "polygon", "point"];
      
      const selectedType = types[Math.floor(Math.random() * types.length)];
      let coordinates: number[][] = [];
      
      if (selectedType === "rect") {
        // 格式: [[x1, y1], [x2, y2]]
        coordinates = [
          [Math.random() * 800, Math.random() * 600],
          [(Math.random() * 800) + 100, (Math.random() * 600) + 100],
        ];
      } else if (selectedType === "polygon") {
        // 多边形格式: [[x1, y1], [x2, y2], [x3, y3], ...]
        const pointCount = Math.floor(Math.random() * 3) + 3;
        for (let p = 0; p < pointCount; p++) {
          coordinates.push([Math.random() * 800, Math.random() * 600]);
        }
      } else {
        // 点格式: [[x, y]]
        coordinates = [[Math.random() * 800, Math.random() * 600]];
      }
      
      labels.push({
        id: `label-${datasetId}-${i}-${j}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        type: selectedType,
        coordinates,
        isAiSuggestion: Math.random() > 0.5,
        confidence: Math.random() * 0.5 + 0.5,
      });
    }
    
    images.push({
      id: `img-${datasetId}-${i}`,
      fileName: `image_${String(i).padStart(4, '0')}.jpg`,
      thumbnail: `https://picsum.photos/id/${(i * 10) % 100}/200/150`,
      osdFlag: randomFlag,
      labels,
    });
  }
  
  return { [datasetId]: images };
};

// 初始化所有数据集的图像
const initializeImagesData = () => {
  let imagesData: Record<string, Image[]> = {};
  
  initialDatasets.forEach(dataset => {
    imagesData = { ...imagesData, ...generateImagesForDataset(dataset.id) };
  });
  
  return imagesData;
};

export const useDummyData = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [imagesData, setImagesData] = useState<Record<string, Image[]>>({});
  const [labels, setLabels] = useState<Record<string, string[]>>({});
  
  // 模拟从"后端"加载数据
  useEffect(() => {
    // 延迟加载以模拟API调用
    const timer = setTimeout(() => {
      setDatasets(initialDatasets);
      setImagesData(initializeImagesData());
      
      // 初始化一些默认标签
      const defaultLabels: Record<string, string[]> = {};
      initialDatasets.forEach(dataset => {
        if (dataset.id === "ds-1") {
          defaultLabels[dataset.id] = ["汽车", "卡车", "公交车", "摩托车"];
        } else if (dataset.id === "ds-2") {
          defaultLabels[dataset.id] = ["道路", "车道线", "交通标志", "交通灯"];
        } else {
          defaultLabels[dataset.id] = ["行人", "自行车", "摩托车", "背包"];
        }
      });
      
      setLabels(defaultLabels);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 添加新数据集
  const addDataset = (dataset: Dataset) => {
    setDatasets(prev => [...prev, dataset]);
    setImagesData(prev => ({ ...prev, ...generateImagesForDataset(dataset.id) }));
    setLabels(prev => ({ ...prev, [dataset.id]: ["物体", "人物", "车辆"] }));
  };
  
  // 删除数据集
  const removeDataset = (id: string) => {
    setDatasets(prev => prev.filter(ds => ds.id !== id));
    
    setImagesData(prev => {
      const newImagesData = { ...prev };
      delete newImagesData[id];
      return newImagesData;
    });
    
    setLabels(prev => {
      const newLabels = { ...prev };
      delete newLabels[id];
      return newLabels;
    });
  };
  
  // 获取特定数据集的图像
  const getDatasetImages = (datasetId: string): Image[] => {
    return imagesData[datasetId] || [];
  };
  
  // 添加或更新图像标签
  const updateImageLabel = (datasetId: string, imageId: string, labelId: string, updatedLabel: Partial<Label>) => {
    setImagesData(prev => {
      const datasetImages = [...(prev[datasetId] || [])];
      const imageIndex = datasetImages.findIndex(img => img.id === imageId);
      
      if (imageIndex === -1) return prev;
      
      const image = { ...datasetImages[imageIndex] };
      const labelIndex = image.labels.findIndex(label => label.id === labelId);
      
      if (labelIndex === -1) {
        // 添加新标签
        image.labels = [...image.labels, { ...(updatedLabel as Label), id: labelId }];
      } else {
        // 更新现有标签
        image.labels = [
          ...image.labels.slice(0, labelIndex),
          { ...image.labels[labelIndex], ...updatedLabel },
          ...image.labels.slice(labelIndex + 1)
        ];
      }
      
      datasetImages[imageIndex] = image;
      return { ...prev, [datasetId]: datasetImages };
    });
  };
  
  // 删除图像标签
  const deleteImageLabel = (datasetId: string, imageId: string, labelId: string) => {
    setImagesData(prev => {
      const datasetImages = [...(prev[datasetId] || [])];
      const imageIndex = datasetImages.findIndex(img => img.id === imageId);
      
      if (imageIndex === -1) return prev;
      
      const image = { ...datasetImages[imageIndex] };
      image.labels = image.labels.filter(label => label.id !== labelId);
      
      datasetImages[imageIndex] = image;
      return { ...prev, [datasetId]: datasetImages };
    });
  };
  
  // 运行OSD状态更新
  const runOsd = (datasetId: string) => {
    setDatasets(prev => {
      return prev.map(ds => {
        if (ds.id === datasetId) {
          return { ...ds, osdStatus: 'running' as const };
        }
        return ds;
      });
    });
    
    // 模拟异步OSD处理完成
    setTimeout(() => {
      setDatasets(prev => {
        return prev.map(ds => {
          if (ds.id === datasetId) {
            return { ...ds, osdStatus: 'done' as const };
          }
          return ds;
        });
      });
      
      // 为一些图像添加unknown标签
      setImagesData(prev => {
        if (!prev[datasetId]) return prev;
        
        const updatedImages = prev[datasetId].map(img => {
          // 随机50%的图像添加unknown标签
          if (Math.random() > 0.5) {
            return {
              ...img,
              osdFlag: 'unknown' as const,
              labels: [
                ...img.labels,
                {
                  id: `unknown-${Date.now()}`,
                  category: 'unknown',
                  type: 'rect' as const,
                  coordinates: [
                    [Math.random() * 800, Math.random() * 600],
                    [(Math.random() * 800) + 100, (Math.random() * 600) + 100]
                  ],
                  isAiSuggestion: true,
                  confidence: Math.random() * 0.5 + 0.3
                }
              ]
            };
          }
          return img;
        });
        
        return { ...prev, [datasetId]: updatedImages };
      });
    }, 3000);
  };
  
  // 添加或更新数据集标签类别
  const updateDatasetLabels = (datasetId: string, updatedLabels: string[]) => {
    setLabels(prev => ({
      ...prev,
      [datasetId]: updatedLabels
    }));
  };
  
  return {
    datasets,
    imagesData,
    labels,
    addDataset,
    removeDataset,
    getDatasetImages,
    updateImageLabel,
    deleteImageLabel,
    runOsd,
    updateDatasetLabels
  };
};
