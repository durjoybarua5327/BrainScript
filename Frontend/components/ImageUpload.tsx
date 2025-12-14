import { useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Id } from '@/convex/_generated/dataModel';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/utils/cropImage';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
    onChange: (uploadId: string) => void;
    value?: string;
    className?: string;
    coverImageId?: string;
    onRemove?: () => void;
    withCrop?: boolean;
    aspect?: number;
}

export default function ImageUpload({ onChange, value, className, coverImageId, onRemove, withCrop = true, aspect = 1 }: ImageUploadProps) {
    const currentValue = value || coverImageId;
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const storageUrl = useQuery(api.files.getUrl, currentValue ? { storageId: currentValue as Id<"_storage"> } : "skip");

    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Cropper State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropOpen, setIsCropOpen] = useState(false);

    const displayImage = localPreview || storageUrl;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'File too large', description: 'Max file size is 5MB', variant: 'destructive' });
            return;
        }

        if (withCrop) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setCroppingImage(reader.result?.toString() || "");
                setIsCropOpen(true);
            });
            reader.readAsDataURL(file);
            e.target.value = ""; // Reset input
        } else {
            startUpload(file);
        }
    };

    const startUpload = async (file: Blob) => {
        setUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) throw new Error(`Upload failed: ${result.statusText}`);

            const { storageId } = await result.json();
            onChange(storageId);

            // Local preview
            const reader = new FileReader();
            reader.onloadend = () => setLocalPreview(reader.result as string);
            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Upload failed:', error);
            toast({ title: 'Upload failed', description: 'Could not upload image.', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropConfirm = async () => {
        if (!croppingImage || !croppedAreaPixels) return;
        try {
            const croppedBlob = await getCroppedImg(croppingImage, croppedAreaPixels);
            if (croppedBlob) {
                await startUpload(croppedBlob);
                setIsCropOpen(false);
                setCroppingImage(null);
                setZoom(1);
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Crop failed", variant: "destructive" });
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div
                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden bg-muted/5 min-h-[160px]"
                onClick={() => fileInputRef.current?.click()}
            >
                <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

                {displayImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img src={displayImage} alt="Preview" className="max-h-60 object-contain rounded-md" />
                        {onRemove && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                onClick={(e) => { e.stopPropagation(); onRemove(); setLocalPreview(null); }}
                            >
                                <Upload className="h-4 w-4 rotate-45" /> {/* Use X icon if imported, reusing Upload for now or just generic X */}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="text-center space-y-2">
                        {uploading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto" />
                        ) : (
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                        )}
                        <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-xs text-muted-foreground/75">PNG, JPG, GIF max 5MB</p>
                    </div>
                )}
            </div>

            <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full h-80 bg-black rounded-md overflow-hidden">
                        {croppingImage && (
                            <Cropper
                                image={croppingImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onCropComplete={handleCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-4 py-2">
                        <Label>Zoom</Label>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsCropOpen(false)}>Cancel</Button>
                        <Button onClick={handleCropConfirm}>Crop & Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
