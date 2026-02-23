'use server';

import connectToDatabase from '@/lib/db';
import Role from '@/models/Role';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createRole(formData: FormData) {
    try {
        await connectToDatabase();

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;

        // Extract permissions (checkboxes)
        // FormData doesn't natively support arrays well for repeated keys unless we parse it.
        // We assume permissions are passed as 'permissions' keys.
        const permissions: string[] = [];
        // Iterate entries to find permissions
        for (const [key, value] of Array.from(formData.entries())) {
            if (key === 'permissions') {
                permissions.push(value as string);
            }
        }

        if (!name) {
            return { error: 'Name is required' };
        }

        await Role.create({
            name,
            description,
            permissions
        });

        revalidatePath('/admin/roles');
    } catch (error) {
        console.error('Failed to create role:', error);
        return { error: 'Failed to create role' };
    }

    redirect('/admin/roles');
}

export async function updateRole(id: string, formData: FormData) {
    try {
        await connectToDatabase();

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;

        const permissions: string[] = [];
        for (const [key, value] of Array.from(formData.entries())) {
            if (key === 'permissions') {
                permissions.push(value as string);
            }
        }

        if (!name) {
            return { error: 'Name is required' };
        }

        await Role.findByIdAndUpdate(id, {
            name,
            description,
            permissions
        });

        revalidatePath('/admin/roles');
    } catch (error) {
        console.error('Failed to update role:', error);
        return { error: 'Failed to update role' };
    }

    redirect('/admin/roles');
}

export async function deleteRole(id: string) {
    try {
        await connectToDatabase();
        await Role.findByIdAndDelete(id);
        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete role:', error);
        return { error: 'Failed to delete role' };
    }
}

export async function getRole(id: string) {
    await connectToDatabase();
    const role = await Role.findById(id).lean();
    if (!role) return null;
    return JSON.parse(JSON.stringify(role));
}

export async function getRoles() {
    await connectToDatabase();
    const roles = await Role.find({}).lean();
    return JSON.parse(JSON.stringify(roles)); // Serialize for client
}

export async function seedRoles() {
    try {
        await connectToDatabase();

        // 1. Delete all existing roles
        await Role.deleteMany({});

        // 2. Prepare new roles from templates (checking for ROLE_TEMPLATES import)
        // We need to import ROLE_TEMPLATES inside the function or file if not already
        const { ROLE_TEMPLATES } = await import('@/lib/permissions');

        const newRoles = Object.entries(ROLE_TEMPLATES).map(([key, tpl]) => ({
            name: tpl.label,         // Use full label as name (e.g. "Administrator")
            description: tpl.description,
            permissions: tpl.permissions,
            isSystem: true           // Optional flag for UI polish later
        }));

        // 3. Bulk insert
        await Role.insertMany(newRoles);

        revalidatePath('/admin/roles');
        return { success: true, count: newRoles.length };
    } catch (error: any) {
        console.error('Failed to seed roles:', error);
        return { success: false, error: error.message };
    }
}
