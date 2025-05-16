
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ItemImage } from '@/types/item';
import { Image, Plus, Trash, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  images: ItemImage[];
  onChange: (images: ItemImage[]) => void;
  isDisabled?: boolean;
}

const ImageUploader = ({ images, onChange, isDisabled = false }: ImageUploaderProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Check if we exceed the limit (10 images)
    if (images.length + newFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 10 images",
        variant: "destructive",
      });
      return;
    }
    
    // Check file sizes (max 10MB per file)
    const validFiles = newFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    // Convert files to our image structure
    const newImages = validFiles.map(file => ({
      id: uuidv4(),
      url: URL.createObjectURL(file),
      file,
      isUploaded: false
    }));
    
    onChange([...images, ...newImages]);
    e.target.value = ''; // Reset input
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!e.dataTransfer.files?.length) return;
    
    // Similar to handleFileChange but for drag and drop
    const newFiles = Array.from(e.dataTransfer.files);
    
    if (images.length + newFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 10 images",
        variant: "destructive",
      });
      return;
    }
    
    const validFiles = newFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    const newImages = validFiles.map(file => ({
      id: uuidv4(),
      url: URL.createObjectURL(file),
      file,
      isUploaded: false
    }));
    
    onChange([...images, ...newImages]);
  };
  
  const removeImage = (id: string) => {
    onChange(images.filter(image => image.id !== id));
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map(image => (
          <div key={image.id} className="relative group">
            <AspectRatio ratio={1} className="bg-slate-100 rounded-lg overflow-hidden">
              <img 
                src={image.url} 
                alt="Item photo"
                className="w-full h-full object-cover"
              />
            </AspectRatio>
            {!isDisabled && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(image.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {images.length < 10 && !isDisabled && (
          <div
            className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 h-full min-h-[150px] transition-colors cursor-pointer ${
              isDragging 
                ? "border-primary bg-primary/10" 
                : "border-slate-300 hover:border-primary hover:bg-slate-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isDisabled}
            />
            <Upload className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-600 text-center">
              Drag & drop images or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1 text-center">
              JPG, PNG, WEBP • Max 10MB each
            </p>
          </div>
        )}
      </div>
      
      {images.length === 0 && !isDisabled && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            className="w-full max-w-md"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Images
          </Button>
        </div>
      )}
      
      <div className="text-xs text-slate-500 flex items-center gap-1">
        <Image className="h-3 w-3" />
        {images.length}/10 images
      </div>
    </div>
  );
};

export default ImageUploader;
