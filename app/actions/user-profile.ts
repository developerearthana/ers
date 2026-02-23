"use server";

import { z } from "zod";
import { createJSONAction } from "@/lib/safe-action";
import { auth } from "@/auth";
import User from "@/models/User";
import connectToDatabase from "@/lib/db";
import { revalidatePath } from "next/cache";

const UpdateProfileSchema = z.object({
    image: z.string().optional(),
    name: z.string().optional(),
});

export const updateProfile = createJSONAction(UpdateProfileSchema, async (data) => {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            throw new Error("Not authenticated");
        }

        await connectToDatabase();

        const updateData: any = {};
        if (data.image) updateData.image = data.image; // Base64 string
        if (data.name) updateData.name = data.name;

        await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData },
            { new: true }
        );

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to update profile" };
    }
});
const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const changePassword = createJSONAction(ChangePasswordSchema, async (data) => {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            throw new Error("Not authenticated");
        }

        await connectToDatabase();

        const user = await User.findOne({ email: session.user.email }).select('+password');
        if (!user) {
            throw new Error("User not found");
        }

        const passwordsMatch = await import('bcryptjs').then(bcrypt => bcrypt.compare(data.currentPassword, user.password));
        if (!passwordsMatch) {
            return { error: "Incorrect current password" };
        }

        const hashedPassword = await import('bcryptjs').then(bcrypt => bcrypt.hash(data.newPassword, 10));

        user.password = hashedPassword;
        await user.save();

        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to update password" };
    }
});
