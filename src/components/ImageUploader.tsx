import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ItemImage } from "@/types/item";
import { Image, Trash, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

// Public base for served images (configure via VITE_IMAGES_BASE_URL)
const PUBLIC_IMAGES_BASE = (import.meta as any)?.env?.VITE_IMAGES_BASE_URL || 'https://images.myflipit.live/';

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
  const imagesRef = useRef<ItemImage[]>(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const syncUpdate = (next: ItemImage[]) => {
    imagesRef.current = next;
    onChange(next);
  };

  // Clean up temporary URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        try {
          if (img.preview && img.preview.startsWith('blob:')) {
            URL.revokeObjectURL(img.preview);
          }
          if (!img.isUploaded && img.url && img.url.startsWith('blob:')) {
            URL.revokeObjectURL(img.url);
          }
        } catch {}
      });
    };
  }, [images]);

  // ────────────────────────────────────────────────────────────────────────────
  // File → ItemImage[] helper (validation + preparation)
  // ────────────────────────────────────────────────────────────────────────────
  const processAndUploadFiles = async (fileList: FileList) => {
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
          description: `${file.name} exceeds 10 MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // 10-image hard-limit check
    if (images.length + validFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 10 images",
        variant: "destructive",
      });
      return;
    }

    // Prepare client-side previews for immediate feedback
    const newImages: ItemImage[] = validFiles.map((file) => {
      const blobUrl = URL.createObjectURL(file);
      return {
        id: uuidv4(),
        url: blobUrl,      // temporary until upload finishes
        preview: blobUrl,  // persist preview even after upload
        file,
        isUploaded: false,
        isUploading: false,
        progress: 0,
      };
    });

    const updatedImages = [...images, ...newImages];
    syncUpdate(updatedImages);

    // Upload originals without compression
    await uploadImages(newImages);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    await processAndUploadFiles(e.target.files);
    e.target.value = ""; // allow re-selecting same file later
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
    await processAndUploadFiles(e.dataTransfer.files);
  };

  /**
   * Core uploader – replaces temporary blob URLs with the final CDN URL and
   * flips `isUploaded` to true so they survive navigation.
   */
  const uploadImages = async (newImages: ItemImage[]) => {
    setUploading(true);

    // Mark images as uploading - use imagesRef.current to get latest state
    let updatedImages = imagesRef.current.map((img) => {
      if (newImages.some((newImg) => newImg.id === img.id)) {
        return { ...img, isUploading: true };
      }
      return img;
    });
    syncUpdate(updatedImages);

    try {
      const uploads = await Promise.all(
        // Kick off presign + upload per image concurrently
        newImages.map(async (image) => {
          const originalUrl = image.url;

          const authToken = typeof window !== 'undefined' ? localStorage.getItem('flipit_token') : null;
          const { data: presigned } = await axios.post(
            "/api/get-presigned-url",
            {
              filename: image.file!.name,
              content_type: image.file!.type,
            },
            {
              headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
            }
          );

          const { url: putUrl, key } = presigned;

          await axios.put(putUrl, image.file, {
            headers: { "Content-Type": image.file!.type },
            onUploadProgress: (evt) => {
              if (!evt.total) return;
              const pct = Math.round((evt.loaded / evt.total) * 100);
              const next = imagesRef.current.map((img) =>
                img.id === image.id
                  ? { ...img, isUploading: true, progress: pct }
                  : img
              );
              syncUpdate(next);
            },
          });

          return {
            id: image.id,
            publicUrl: `${PUBLIC_IMAGES_BASE.replace(/\/$/, '')}/${key}`,
            originalUrl,
          };
        })
      );

      const uploadedMap = new Map(uploads.map((result) => [result.id, result]));

      updatedImages = updatedImages.map((img) => {
        const uploadResult = uploadedMap.get(img.id);
        if (!uploadResult) return img;

        // Clean up blob preview URL after successful upload
        if (img.preview && img.preview.startsWith('blob:')) {
          try { URL.revokeObjectURL(img.preview); } catch {}
        }

        // Replace with final CDN URL and clear blob preview
        return { 
          ...img, 
          url: uploadResult.publicUrl, 
          preview: uploadResult.publicUrl,  // Use CDN URL for preview too
          isUploaded: true, 
          isUploading: false, 
          progress: 100 
        };
      });

      syncUpdate(updatedImages);

      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { detail?: string } }; message?: string }).response?.data?.detail || (error as { message?: string }).message
        : 'Unknown error';
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Reset uploading state on error
      updatedImages = updatedImages.map((img) => {
        if (newImages.some((newImg) => newImg.id === img.id)) {
          return { ...img, isUploading: false };
        }
        return img;
      });
      syncUpdate(updatedImages);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (id: string) => {
    const remaining = images.filter((image) => image.id !== id);

    // Clean up any blob URLs we generated for images that were never uploaded
    images
      .filter((img) => img.id === id)
      .forEach((img) => {
        if (img.preview && img.preview.startsWith('blob:')) {
          try { URL.revokeObjectURL(img.preview); } catch {}
        }
        if (!img.isUploaded && img.url && img.url.startsWith('blob:')) {
          try { URL.revokeObjectURL(img.url); } catch {}
        }
      });

    syncUpdate(remaining);
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <AspectRatio ratio={1} className="bg-slate-100 rounded-lg overflow-hidden">
              { (image.url || image.preview) ? (
                <img
                  src={image.url || image.preview}
                  alt="Item photo"
                  className="w-full h-full object-cover"
                  onError={() => console.error(`Failed to load image: ${image.url || image.preview}`)}
                />
              ) : (
                <div className="w-full h-full bg-slate-200" />
              )}
              {image.isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-xs">
                      {`Uploading${typeof image.progress === 'number' ? ` ${image.progress}%` : '...'}`}
                    </p>
                  </div>
                </div>
              )}
            </AspectRatio>
            {!isDisabled && !image.isUploading && (
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
              {uploading ? "Uploading..." : "Drag & drop images or click to browse"}
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
