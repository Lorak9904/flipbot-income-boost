import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ItemImage } from "@/types/item";
import { Image, Trash, Upload, Loader2, WandSparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import imageCompression from "browser-image-compression";
import heic2any from "heic2any";
import { ImagePreview } from "./ImagePreview";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { imageUploaderTranslations } from "@/utils/translations/image-uploader-translations";

// Public base for served images (configure via VITE_IMAGES_BASE_URL)
const PUBLIC_IMAGES_BASE = import.meta.env.VITE_IMAGES_BASE_URL || 'https://images.myflipit.live/';
const MARKETPLACE_SAFE_MAX_BYTES = 4_500_000;
const MARKETPLACE_TARGET_LONG_EDGE = 2560;

interface ImageUploaderProps {
  images: ItemImage[];
  onChange: (images: ItemImage[]) => void;
  isDisabled?: boolean;
  language?: string;
  onEnhanceImage?: (image: ItemImage) => void;
  enhancingImageId?: string | null;
}

/**
 * ImageUploader component that keeps images persistent by
 * 1. Uploading each file to R2 and replacing the temporary blob URL
 *    with the permanent public URL as soon as the upload finishes.
 * 2. Never revoking the URL for images that have already been uploaded.
 * 3. Ensuring the parent receives the *final* list – including the new images –
 *    so that a page change can re‑hydrate the same data.
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  isDisabled = false,
  language = 'en',
  onEnhanceImage,
  enhancingImageId = null,
}) => {
  const { toast } = useToast();
  const copy = imageUploaderTranslations[language === 'pl' ? 'pl' : 'en'];
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const imagesRef = useRef<ItemImage[]>(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const syncUpdate = (next: ItemImage[]) => {
    imagesRef.current = next;
    onChange(next);
  };

  /**
   * Convert source formats that cannot be uploaded consistently as a JPEG.
   * Handles HEIC (iPhone), PNG, WebP, and other formats.
   */
  const convertToJPEG = async (file: File): Promise<File> => {
    try {
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      
      // Detect HEIC format (iOS photos)
      const isHEIC = fileType === 'image/heic' || 
                     fileType === 'image/heif' || 
                     fileName.endsWith('.heic') || 
                     fileName.endsWith('.heif');

      // Convert HEIC to JPEG
      if (isHEIC) {
        console.log('Converting HEIC to JPEG:', file.name);
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.95,
        });

        // heic2any can return Blob or Blob[], handle both
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
        return new File([blob], newFileName, { type: 'image/jpeg' });
      }

      // Browser Image Compression performs the JPEG conversion for browser-
      // decodable PNG/WebP inputs in one rasterization pass.
      return file;
    } catch (error) {
      console.warn('Format conversion failed, using original:', error);
      return file; // Fallback to original on any error
    }
  };

  /**
   * Preserve an already suitable JPEG. Other images get one normalized export
   * with enough room for marketplace detail photos without exceeding Vinted's
   * documented 5 MB photo limit.
   */
  const compressImage = async (file: File, forceNormalization: boolean): Promise<File> => {
    try {
      const shouldPreserve = (
        !forceNormalization
        &&
        file.type === 'image/jpeg'
        && file.size <= MARKETPLACE_SAFE_MAX_BYTES
      );

      if (shouldPreserve) {
        return file;
      }

      const options = {
        maxWidthOrHeight: MARKETPLACE_TARGET_LONG_EDGE,
        initialQuality: 0.92,
        maxSizeMB: MARKETPLACE_SAFE_MAX_BYTES / (1024 * 1024),
        useWebWorker: true,
        fileType: 'image/jpeg',
      };

      return await imageCompression(file, options);
    } catch (error) {
      console.warn("Image compression failed, using original:", error);
      // Fallback to original file on compression error
      return file;
    }
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
        } catch {
          // Blob URLs may already have been revoked by a prior state update.
        }
      });
    };
  }, [images]);

  // ────────────────────────────────────────────────────────────────────────────
  // File → ItemImage[] helper (validation + preparation + compression)
  // ────────────────────────────────────────────────────────────────────────────
  const processAndUploadFiles = async (fileList: FileList) => {
    const files = Array.from(fileList);

    // Validate type & size first (synchronously)
    // Note: Size check is pre-compression, actual uploads will be smaller
    const validFiles = files.filter((file) => {
      // Check MIME type OR file extension (HEIC files often have empty MIME type)
      const fileName = file.name.toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.bmp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => fileName.endsWith(ext));
      const hasImageMimeType = file.type.startsWith("image/");
      
      if (!hasImageMimeType && !hasImageExtension) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 25 MB (will be compressed before upload)`,
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

    // First, create placeholder images with original files for immediate feedback
    const placeholderImages: ItemImage[] = validFiles.map((file) => {
      const blobUrl = URL.createObjectURL(file);
      return {
        id: uuidv4(),
        url: blobUrl,
        preview: blobUrl,
        file,
        isUploaded: false,
        isCompressing: true,  // Show "Compressing..." state
        isUploading: false,
        progress: 0,
      };
    });

    // Add placeholders to grid immediately
    let updatedImages = [...images, ...placeholderImages];
    syncUpdate(updatedImages);

    try {
      // Convert and compress images in parallel (client-side, non-blocking)
      const compressedFiles = await Promise.all(
        placeholderImages.map(async (placeholder) => {
          // Step 1: HEIC needs a browser-supported JPEG conversion.
          const converted = await convertToJPEG(placeholder.file!);
          // Step 2: Normalize only when the original is not already a
          // marketplace-safe JPEG or exceeds the photo-size safety margin.
          const compressed = await compressImage(
            converted,
            placeholder.file!.type !== 'image/jpeg',
          );
          return {
            id: placeholder.id,
            compressed,
          };
        })
      );

      // Update with compressed files and clear compression state
      updatedImages = imagesRef.current.map((img) => {
        const compressed = compressedFiles.find((cf) => cf.id === img.id);
        if (!compressed) return img;

        // Revoke old blob URL and create new one for compressed file
        if (img.url && img.url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(img.url);
          } catch {
            // Blob URLs may already have been revoked by a prior state update.
          }
        }

        const blobUrl = URL.createObjectURL(compressed.compressed);
        return {
          ...img,
          url: blobUrl,
          preview: blobUrl,
          file: compressed.compressed,
          isCompressing: false,  // Compression done
        };
      });
      syncUpdate(updatedImages);

      // Upload compressed images
      const imagesToUpload = updatedImages.filter((img) => 
        compressedFiles.some((cf) => cf.id === img.id)
      );
      await uploadImages(imagesToUpload);
    } catch (error) {
      // Clear compression state on error
      console.error("Compression error:", error);
      updatedImages = imagesRef.current.map((img) => 
        placeholderImages.some((ph) => ph.id === img.id)
          ? { ...img, isCompressing: false }
          : img
      );
      syncUpdate(updatedImages);
      
      toast({
        title: "Processing failed",
        description: "Failed to process images. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    await processAndUploadFiles(e.target.files);
    e.target.value = ""; // allow re-selecting same file later
  };

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleFileDragLeave = () => setIsDragging(false);

  const handleFileDrop = async (e: React.DragEvent) => {
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
          try {
            URL.revokeObjectURL(img.preview);
          } catch {
            // Blob URLs may already have been revoked by a prior state update.
          }
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
          try {
            URL.revokeObjectURL(img.preview);
          } catch {
            // Blob URLs may already have been revoked by a prior state update.
          }
        }
        if (!img.isUploaded && img.url && img.url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(img.url);
          } catch {
            // Blob URLs may already have been revoked by a prior state update.
          }
        }
      });

    syncUpdate(remaining);
  };

  // Drag and drop reordering handlers
  const handleDragStart = (e: React.DragEvent, imageId: string) => {
    setDraggedImageId(imageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedImageId(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedImageId) return;
    
    const draggedIndex = images.findIndex(img => img.id === draggedImageId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedImageId(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...images];
    const [draggedImage] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, draggedImage);
    
    syncUpdate(reordered);
    setDraggedImageId(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className={`relative group ${dragOverIndex === index ? 'ring-2 ring-primary' : ''}`}
            draggable={!isDisabled && !image.isCompressing && !image.isUploading}
            onDragStart={(e) => handleDragStart(e, image.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
          >
            <AspectRatio 
              ratio={1} 
              className="bg-slate-100 rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-blue-400 group-hover:opacity-90 transition-all cursor-pointer"
              onClick={(e) => {
                // Only open preview if not dragging and not clicking delete button
                if (!image.isCompressing && !image.isUploading && !draggedImageId) {
                  e.stopPropagation();
                  console.log('Opening preview for index:', index, 'Image:', image.url || image.preview);
                  setPreviewIndex(index);
                  setPreviewOpen(true);
                }
              }}
            >
              {(image.url || image.preview) ? (
                <img
                  src={image.url || image.preview}
                  alt={copy.photoAlt(index + 1)}
                  className="w-full h-full object-cover pointer-events-none"
                  onError={() => console.error(`Failed to load image: ${image.url || image.preview}`)}
                />
              ) : (
                <div className="w-full h-full bg-slate-200" />
              )}
              {(image.isCompressing || image.isUploading || enhancingImageId === image.id) && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-xs">
                      {enhancingImageId === image.id
                        ? copy.enhancingPhoto
                        : image.isCompressing
                        ? copy.compressing
                        : typeof image.progress === 'number'
                          ? `${copy.uploading.replace('...', '')} ${image.progress}%`
                          : copy.uploading
                      }
                    </p>
                  </div>
                </div>
              )}
              {/* Enhanced image badge */}
              {image.enhanced && (
                <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-xs px-2 py-1 rounded">
                  {copy.enhanced}
                </div>
              )}
              {/* Image position indicator */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>
            </AspectRatio>
            {!isDisabled && !image.isCompressing && !image.isUploading && (
              <TooltipProvider delayDuration={150}>
                {onEnhanceImage && !image.enhanced && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-2 right-2 h-11 w-11 border border-cyan-400/40 bg-neutral-950/90 text-cyan-200 opacity-100 transition-opacity hover:bg-cyan-500/20 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                        aria-label={copy.enhancePhoto}
                        onClick={(event) => {
                          event.stopPropagation();
                          onEnhanceImage(image);
                        }}
                      >
                        <WandSparkles className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{copy.enhancePhoto}</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            )}
            {!isDisabled && !image.isCompressing && !image.isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-11 w-11 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                aria-label={copy.removePhoto}
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(image.id);
                }}
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
            onDragOver={handleFileDragOver}
            onDragLeave={handleFileDragLeave}
            onDrop={handleFileDrop}
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
            <p className="text-sm text-slate-600">
              {uploading ? copy.uploading : copy.upload}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {copy.limit}
            </p>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 flex items-center gap-1">
        <Image className="h-3 w-4" />
        {copy.count(images.length)}
      </div>

      {/* Image Preview Modal */}
      <ImagePreview
        images={images.map(img => img.url || img.preview || '')}
        initialIndex={previewIndex}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
};

export default ImageUploader;
