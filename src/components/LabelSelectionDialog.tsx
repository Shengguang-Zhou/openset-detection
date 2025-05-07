
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X, Plus, Search } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface LabelSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLabel: (label: string) => void;
  existingLabels: string[];
}

export default function LabelSelectionDialog({
  isOpen,
  onClose,
  onSelectLabel,
  existingLabels
}: LabelSelectionDialogProps) {
  const [newLabel, setNewLabel] = useState("");
  const [filteredLabels, setFilteredLabels] = useState<string[]>(existingLabels);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset the input and update the filtered labels when the dialog opens
    if (isOpen) {
      setNewLabel("");
      setFilteredLabels(existingLabels);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, existingLabels]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLabel(e.target.value);
    const filtered = e.target.value 
      ? existingLabels.filter(label => 
          label.toLowerCase().includes(e.target.value.toLowerCase()))
      : existingLabels;
    setFilteredLabels(filtered);
  };

  const handleSelectExisting = (label: string) => {
    onSelectLabel(label);
  };

  const handleAddNew = () => {
    if (newLabel.trim()) {
      onSelectLabel(newLabel.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNew();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>选择标签类别</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder="输入新标签或选择现有标签"
                value={newLabel}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="pl-8"
              />
            </div>
            <Button onClick={handleAddNew} disabled={!newLabel.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </div>
          
          {existingLabels.length > 0 ? (
            <div>
              <div className="text-sm text-gray-500 mb-2">现有标签</div>
              <ScrollArea className="max-h-60">
                <div className="flex flex-wrap gap-2">
                  {filteredLabels.map((label) => (
                    <Badge
                      key={label}
                      className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                      variant="outline"
                      onClick={() => handleSelectExisting(label)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
                {filteredLabels.length === 0 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    没有找到匹配的标签
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              没有现有标签。请输入一个新标签。
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="mr-2"
          >
            <X className="h-4 w-4 mr-1" />
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
