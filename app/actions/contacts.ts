"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { contactService } from "@/services/ContactService";
import { revalidatePath } from "next/cache";

// Actions
export const getContacts = async (filters: any = {}) => {
    try {
        const data = await contactService.getContacts(filters);
        // Serialize nested objects like _id and dates to simple strings/types
        const serializedData = JSON.parse(JSON.stringify(data));
        return { success: true, data: serializedData };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const getContactStats = async () => {
    try {
        const data = await contactService.getStats();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

const ContactSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    company: z.string().optional(),
    type: z.enum(['Client', 'Vendor', 'Partner', 'Lead', 'Consultant']),
    status: z.enum(['Active', 'Inactive']).optional(),
    address: z.string().optional(),
    category: z.string().optional(),
    notes: z.string().optional(),
});

export const createContact = createJSONAction(ContactSchema, async (data) => {
    try {
        // Cast type to match model
        await contactService.createContact(data as any);
        revalidatePath("/contacts");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to create contact" };
    }
});

export const updateContact = createJSONAction(ContactSchema.extend({ id: z.string() }), async (data) => {
    try {
        const { id, ...updateData } = data;
        await contactService.updateContact(id, updateData as any);
        revalidatePath("/contacts");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to update contact" };
    }
});

export const deleteContact = async (id: string) => {
    try {
        await contactService.deleteContact(id);
        revalidatePath("/contacts");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to delete contact" };
    }
};
