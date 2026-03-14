"use server";

import { auth } from "@/auth";

export async function uploadFile(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { error: "Unauthorized" };
        }

        const file = formData.get("file") as File;
        if (!file) {
            return { error: "No file uploaded" };
        }

        // Limit size for Data URL storage to avoid bloating MongoDB
        // 10 MB is a safe limit for Data URLs (approx 13.3 MB base64 string, below 16MB MongoDB document limit)
        const MAX_DATA_URL_SIZE = 10 * 1024 * 1024; 
        if (file.size > MAX_DATA_URL_SIZE) {
            return { error: `File too large for live persistence. Maximum 10 MB allowed for logos/documents in this version.` };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Convert to Base64 Data URL
        // This ensures the file is stored directly in the database (via the model using this URL)
        // and persists across server restarts on platforms like Render or Vercel.
        const base64String = buffer.toString('base64');
        const publicUrl = `data:${file.type};base64,${base64String}`;

        return { success: true, url: publicUrl, filename: file.name };
    } catch (error: any) {
        console.error("Upload error:", error);
        return { error: "Failed to upload file to live storage" };
    }
}
