import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ItemImage } from "@/types/item";
import { Image, Trash, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import imageCompression from "browser-image-compression";

const compressImage = async (file: File) => {
  return imageCompression(file, {
    maxWidthOrHeight: 1280,      // 1-2 MP is enough for marketplaces
    maxSizeMB: 0.6,              // ~600 kB hard-cap
    useWebWorker: true,
    alwaysKeepResolution: false, // let it down-scale
  });
};

// Safeguard when running during SSR
const token = typeof window !== "undefined" ? localStorage.getItem("flipit_token") : null;

interface ImageUploaderProps {
  images: ItemImage[];
  onChange: (images: ItemImage[]) => void;
  isDisabled?: boolean;
}

/**
 * ImageUploader component that keeps images persistent by
 * 1. Uploading each file to R2 and replacing the temporary blob URL
 *    with the permanent public URL as soon as the upload finishes.
 * 2. Never revoking the URL for images that have already been uploaded.
 * 3. Ensuring the parent receives the *final* list – including the new images –
 *    so that a page change can re‑hydrate the same data.
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange, isDisabled = false }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Clean up temporary URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (!img.isUploaded && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [images]);

  // ────────────────────────────────────────────────────────────────────────────
  // File → ItemImage[] helper (validation + compression)
  // ────────────────────────────────────────────────────────────────────────────
  const processFiles = async (fileList: FileList): Promise<ItemImage[]> => {
    const files = Array.from(fileList);

    // Validate type & size first (synchronously)
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10 MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    // Compress in parallel
    const compressedFiles = await Promise.all(validFiles.map((f) => compressImage(f)));

    return compressedFiles.map((file) => ({
      id: uuidv4(),
      url: URL.createObjectURL(file), // preview URL (compressed)
      file,
      isUploaded: false,
    }));
  };

  /** Wrapper around the actual upload logic */
  const handleNewImages = async (incoming: ItemImage[]) => {
    if (!incoming.length) return;

    // 10‑image hard‑limit check
    if (images.length + incoming.length > 10) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 10 images",
        variant: "destructive",
      });
      return;
    }

    // Optimistically show previews
    onChange([...images, ...incoming]);

    // Upload to R2 and replace blob URLs with permanent URLs
    await uploadImages(incoming);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const incoming = await processFiles(e.target.files);
    await handleNewImages(incoming);
    e.target.value = ""; // allow re‑selecting same file later
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files?.length) return;
    const incoming = await processFiles(e.dataTransfer.files);
    await handleNewImages(incoming);
  };

  /**
   * Core uploader – replaces temporary blob URLs with the final CDN URL and
   * flips `isUploaded` to true so they survive navigation.
   */
  const uploadImages = async (newImages: ItemImage[]) => {
    setUploading(true);

    // Start with the most up‑to‑date list that includes the *new* images.
    let updatedImages: ItemImage[] = [...images, ...newImages];

    try {
      for (const image of newImages) {
        // 1. Request a pre‑signed PUT URL
        const { data: presigned } = await axios.post(
          "/api/get-presigned-url",
          {
            filename: image.file!.name,
            content_type: image.file!.type,
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );

        const { url: putUrl, key } = presigned;

        // 2. PUT the file to R2
        await axios.put(putUrl, image.file, {
          headers: { "Content-Type": image.file!.type },
        });

        // 3. Build the public URL that never expires
        const publicUrl = `https://images.myflipit.live/${key}`;

        // 4. Update our local copy (replace blob URL, set isUploaded = true)
        updatedImages = updatedImages.map((img) =>
          img.id === image.id ? { ...img, url: publicUrl, isUploaded: true } : img
        );

        // 5. Release the temporary blob URL from memory
        if (image.url.startsWith("blob:")) {
          URL.revokeObjectURL(image.url);
        }
      }

      // Push the final list to the parent so it can persist the data (e.g. DB, URL param, Zustand store …)
      onChange(updatedImages);

      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.response?.data?.detail || error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (id: string) => {
    const remaining = images.filter((image) => image.id !== id);

    // Clean up any blob URLs we generated for images that were never uploaded
    images
      .filter((img) => img.id === id && !img.isUploaded && img.url.startsWith("blob:"))
      .forEach((img) => URL.revokeObjectURL(img.url));

    onChange(remaining);
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <AspectRatio ratio={1} className="bg-slate-100 rounded-lg overflow-hidden">
              <img
                src={image.url}
                alt="Item photo"
                className="w-full h-full object-cover"
                onError={() => console.error(`Failed to load image: ${image.url}`)}
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
              disabled={isDisabled || uploading}
            />
            <Upload className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-600 text-center">
              {uploading ? "Uploading…" : "Drag & drop images or click to browse"}
            </p>
            <p className="text-xs text-slate-400 mt-1 text-center">JPG, PNG, WEBP • Max 10MB each</p>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 flex items-center gap-1">
        <Image className="h-3 w-4" />
        {images.length}/10 images
      </div>
    </div>
  );
};

export default ImageUploader;
