"use server";

import connectToDatabase from "@/lib/db";
import Document from "@/models/Document";
import User from "@/models/User";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Get users for document vault filtering
 */
export async function getVaultUsers() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const userRole = session.user.role?.toLowerCase() || "";
        const isAdminOrHR =
            userRole.includes("admin") ||
            userRole.includes("manager") ||
            userRole.includes("hr");

        if (!isAdminOrHR) {
            return { success: true, data: [] };
        }

        await connectToDatabase();
        const users = await User.find({})
            .select('name email role')
            .sort({ name: 1 })
            .lean();
            
        return { success: true, data: JSON.parse(JSON.stringify(users)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get HRM documents.
 * - Admin / HR / Manager → see ALL documents
 * - All other roles → see only their own
 */
export async function getHRMDocuments() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        await connectToDatabase();

        const userRole = session.user.role?.toLowerCase() || "";
        const isAdminOrHR =
            userRole.includes("admin") ||
            userRole.includes("manager") ||
            userRole.includes("hr");

        const filter = isAdminOrHR ? {} : { uploadedBy: session.user.id };

        const docs = await Document.find(filter).sort({ createdAt: -1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(docs)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function uploadHRMDocument(data: {
    name: string;
    url: string;
    type: string;
    size: number;
    category: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        // Anyone can upload their own documents

        await connectToDatabase();

        const newDoc = await Document.create({
            name: data.name,
            url: data.url,
            type: data.category || data.type || "Other",
            size: data.size,
            uploadedBy: session.user.id,
        });

        revalidatePath("/hrm/documents");
        return { success: true, data: JSON.parse(JSON.stringify(newDoc)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Delete a document.
 * - Admin / HR / Manager can delete any document.
 * - Staff cannot delete documents.
 */
export async function deleteHRMDocument(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const userRole = session.user.role?.toLowerCase() || "";
        const isAdminOrHR =
            userRole.includes("admin") ||
            userRole.includes("manager") ||
            userRole.includes("hr");

        if (!isAdminOrHR) {
            const doc = await Document.findById(id);
            if (!doc) throw new Error("Document not found");
            if (doc.uploadedBy !== session.user.id) {
                throw new Error("You can only delete your own documents.");
            }
        }

        await connectToDatabase();

        const doc = await Document.findById(id);
        if (!doc) throw new Error("Document not found");

        await Document.findByIdAndDelete(id);

        revalidatePath("/hrm/documents");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
