"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
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

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), "public", "uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return the public URL
        const publicUrl = `/uploads/${filename}`;

        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error("Upload error:", error);
        return { error: "Failed to upload file" };
    }
}
