"use server";

import connectToDatabase from "@/lib/db";
import Document from "@/models/Document";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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

/**
 * Upload a new document.
 * - Only Admin / HR / Manager can upload documents (on behalf of anyone).
 */
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

        const userRole = session.user.role?.toLowerCase() || "";
        const isAdminOrHR =
            userRole.includes("admin") ||
            userRole.includes("manager") ||
            userRole.includes("hr");

        if (!isAdminOrHR) {
            throw new Error("Only HR Admin can upload documents.");
        }

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
            throw new Error("Only HR Admin can delete documents.");
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
