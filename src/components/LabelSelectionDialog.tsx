
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    setFilteredLabels(existingLabels);
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
    onClose();
  };

  const handleAddNew = () => {
    if (newLabel.trim()) {
      onSelectLabel(newLabel.trim());
      onClose();
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>选择或创建标签</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Input
              ref={inputRef}
              value={newLabel}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="搜索已有标签或创建新标签"
              className="pr-10"
            />
            {newLabel && (
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                onClick={() => setNewLabel("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {filteredLabels.length > 0 && (
            <div className="border rounded-md">
              <ScrollArea className="max-h-60">
                <div className="p-1 grid grid-cols-2 gap-1">
                  {filteredLabels.map((label) => (
                    <button
                      key={label}
                      className="text-left px-3 py-2 rounded-md hover:bg-orange-50 hover:text-primary transition-colors"
                      onClick={() => handleSelectExisting(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {newLabel.trim() && !existingLabels.includes(newLabel.trim()) && (
            <div className="flex items-center gap-2 pt-1">
              <Button 
                variant="outline" 
                className="w-full border-dashed border-primary text-primary" 
                onClick={handleAddNew}
              >
                创建新标签 "{newLabel}"
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
