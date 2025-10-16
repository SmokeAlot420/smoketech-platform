"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hash } from "lucide-react";
import { ImageModel, MODEL_CONFIGS } from "@/lib/model-types";

interface ImageCountSelectorProps {
  selectedCount: number;
  onCountChange: (count: number) => void;
  selectedModel?: ImageModel;
  disabled?: boolean;
  className?: string;
}

export function ImageCountSelector({
  selectedCount,
  onCountChange,
  selectedModel = 'imagen-4',
  disabled = false,
  className = ""
}: ImageCountSelectorProps) {
  const maxImages = MODEL_CONFIGS[selectedModel].maxImages;

  // Generate count options based on model limits
  const countOptions = Array.from({ length: maxImages }, (_, i) => i + 1);

  return (
    <Select
      value={selectedCount.toString()}
      onValueChange={(value) => onCountChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[80px] h-8 ${className}`}>
        <div className="flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">{selectedCount}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {countOptions.map((count) => (
          <SelectItem key={count} value={count.toString()} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="font-medium">{count} image{count > 1 ? 's' : ''}</span>
              <span className="text-xs text-muted-foreground">
                ${(MODEL_CONFIGS[selectedModel].cost * count).toFixed(2)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Hook for managing image count selection
import { useState, useEffect } from "react";

export function useImageCountSelection(selectedModel: ImageModel = 'imagen-4') {
  const maxImages = MODEL_CONFIGS[selectedModel].maxImages;
  const [selectedCount, setSelectedCount] = useState(maxImages);

  // Adjust count if it exceeds new model's limit
  useEffect(() => {
    if (selectedCount > maxImages) {
      setSelectedCount(maxImages);
    }
  }, [selectedModel, maxImages, selectedCount]);

  return {
    selectedCount,
    setSelectedCount,
    maxImages
  };
}