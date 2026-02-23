"use client";

import { useState } from 'react';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile } from '@/app/actions/upload';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
    className?: string;
    variant?: 'circle' | 'square';
    label?: string;
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    className,
    variant = 'circle',
    label = "Upload Image"
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', e.target.files[0]);

            const res = await uploadFile(formData);

            if (res.success && res.url) {
                onChange(res.url);
                toast.success("Image uploaded");
            } else {
                toast.error("Upload failed");
            }
        } catch (error) {
            toast.error("Error uploading image");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={cn("flex flex-col items-center justify-center", className)}>
            <label
                className={cn(
                    "relative flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors border-2 border-dashed border-gray-300 overflow-hidden group",
                    variant === 'circle' ? "rounded-full w-40 h-40" : "rounded-lg w-full h-40",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={disabled || isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <span className="text-xs text-gray-500">Uploading...</span>
                    </div>
                ) : value ? (
                    <>
                        <img src={value} alt="Upload" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold">Change</span>
                        </div>
                    </>
                ) : (
                    <>
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2 group-hover:text-primary transition-colors" />
                        <span className="text-xs text-gray-500 font-medium">{label}</span>
                    </>
                )}
            </label>
        </div>
    );
}
