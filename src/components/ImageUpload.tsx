import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageUrl: (url: string) => void;
  currentUrl: string;
}

export const ImageUpload = ({ onImageUrl, currentUrl }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a preview URL for the selected file
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploading(true);
    try {
      const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onImageUrl(url);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      // Clean up the preview URL
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl("");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      // Clean up the preview URL on error
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl("");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    onImageUrl('');
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <Input
          type="url"
          value={currentUrl || previewUrl}
          onChange={(e) => onImageUrl(e.target.value)}
          placeholder="Enter image URL or upload"
          className="flex-1"
        />
        <Input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*,gif/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
        <Button
          variant="outline"
          size="icon"
          type="button"
          disabled={uploading}
          onClick={handleUploadClick}
        >
          <Upload className="h-4 w-4" />
        </Button>
        {(currentUrl || previewUrl) && (
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {(previewUrl || currentUrl) && (
        <div className="mt-2 relative rounded-lg overflow-hidden border border-border">
          {previewUrl || currentUrl ? (
            <img
              src={previewUrl || currentUrl}
              alt="Preview"
              className="max-h-40 w-full object-contain"
            />
          ) : null}
        </div>
      )}
    </div>
  );
};