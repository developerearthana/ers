"use server";

import connectToDatabase from "@/lib/db";
import Document from "@/models/Document";
import User from "@/models/User";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const ADMIN_ROLES = ["admin", "super-admin", "hr"];

function isAdmin(role: string) {
    return ADMIN_ROLES.some(r => role.toLowerCase().includes(r));
}

export async function getVaultUsers() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        if (!isAdmin(session.user.role || "")) return { success: true, data: [] };

        await connectToDatabase();
        const users = await User.find({}).select('name email role').sort({ name: 1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(users)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Admin/HR  → all documents (all statuses)
 * Staff/etc → only their own documents (all statuses so they see pending/approved/rejected)
 */
export async function getHRMDocuments() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        await connectToDatabase();

        const role = session.user.role || "";
        const filter = isAdmin(role) ? {} : { uploadedBy: session.user.id };

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

        await connectToDatabase();

        const newDoc = await Document.create({
            name: data.name,
            url: data.url,
            type: data.category || data.type || "Other",
            size: data.size,
            uploadedBy: session.user.id,
            uploadedByName: session.user.name || session.user.email || "Unknown",
            status: "pending",
        });

        revalidatePath("/hrm/documents");
        return { success: true, data: JSON.parse(JSON.stringify(newDoc)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Only super-admin / admin / hr can approve.
 */
export async function approveHRMDocument(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        if (!isAdmin(session.user.role || "")) throw new Error("Forbidden");

        await connectToDatabase();
        await Document.findByIdAndUpdate(id, { status: "approved", rejectionReason: undefined });

        revalidatePath("/hrm/documents");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Only super-admin / admin / hr can reject.
 */
export async function rejectHRMDocument(id: string, reason?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        if (!isAdmin(session.user.role || "")) throw new Error("Forbidden");

        await connectToDatabase();
        await Document.findByIdAndUpdate(id, { status: "rejected", rejectionReason: reason || "" });

        revalidatePath("/hrm/documents");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Only admin/hr can delete. Staff/users cannot delete any document.
 */
export async function deleteHRMDocument(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        if (!isAdmin(session.user.role || "")) throw new Error("Only admins can delete documents.");

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
