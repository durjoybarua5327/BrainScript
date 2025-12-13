import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploadProps {
    onChange: (uploadId: string) => void;
    value?: string;
    className?: string;
}

export default function ImageUpload({ onChange, value, className }: ImageUploadProps) {
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const [preview, setPreview] = useState<string | null>(value || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload an image file (jpg, png, etc.)',
                variant: 'destructive',
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({
                title: 'File too large',
                description: 'Max file size is 5MB',
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);
        try {
            // 1. Get upload URL
            const postUrl = await generateUploadUrl();

            // 2. POST the file to the URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!result.ok) {
                throw new Error(`Upload failed: ${result.statusText}`);
            }

            const { storageId } = await result.json();

            // 3. Set the storage ID
            onChange(storageId);

            // Create local preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Upload failed:', error);
            toast({
                title: 'Upload failed',
                description: 'Could not upload image. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div
                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors h-60 relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
            >
                <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {preview ? (
                    // Since we don't have the full URL logic here for storage ID unless we fetch it, 
                    // for the initial upload preview we use the base64 data. 
                    // If 'value' is passed initially (edit mode), it might be a storage ID which we can't easily display without a query.
                    // For now, we assume 'preview' state holds valid image source (base64 or public URL if refined).
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center">
                            {uploading ? (
                                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                            ) : (
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </div>
                        <div className="flex text-sm text-gray-600">
                            <span className="relative cursor-pointer rounded-md bg-white font-medium text-emerald-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 hover:text-emerald-500">
                                <span>Upload a file</span>
                            </span>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                )}
            </div>
            {uploading && <p className="text-sm text-muted-foreground text-center">Uploading...</p>}
        </div>
    );
}
