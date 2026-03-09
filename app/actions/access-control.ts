"use server";

import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Role from "@/models/Role";
import { revalidatePath } from "next/cache";

export async function getModuleAccessData() {
    await connectToDatabase();
    const [users, roles] = await Promise.all([
        User.find({}).select('name email role status dept image').lean(),
        Role.find({}).select('name permissions description').lean(),
    ]);
    return {
        users: JSON.parse(JSON.stringify(users)),
        roles: JSON.parse(JSON.stringify(roles)),
    };
}

export async function updateUserModuleAccess(userId: string, permissions: string[]) {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { permissions });
    revalidatePath("/admin/access-control");
    revalidatePath("/");
    return { success: true };
}

export async function assignUserRole(userId: string, role: string) {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { role });
    revalidatePath("/admin/access-control");
    return { success: true };
}
