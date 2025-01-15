import { useState } from 'react';
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
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        type="url"
        value={currentUrl}
        onChange={(e) => onImageUrl(e.target.value)}
        placeholder="Enter image URL or upload"
        className="flex-1"
      />
      <Input
        type="file"
        ref={fileInputRef}
        accept="image/*"
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
      {currentUrl && (
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => onImageUrl('')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};