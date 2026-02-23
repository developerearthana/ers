'use server';

import { auth } from '@/auth';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import connectToDatabase from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function sendMessage(conversationId: string, content: string, attachments: string[] = []) {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        const senderId = session.user.id;

        const newMessage = new Message({
            conversationId,
            sender: senderId,
            content,
            attachments,
            readBy: [senderId]
        });

        await newMessage.save();

        // Update conversation: Set last message, update time, and UN-ARCHIVE for all participants
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: newMessage._id,
            lastMessageAt: new Date(),
            $pull: { archivedBy: { $exists: true } } // Un-archive for everyone when a new message comes
        });

        // Unread count logic would go here (increment for others)

        return { success: true, data: JSON.parse(JSON.stringify(newMessage)) };
    } catch (error: any) {
        console.error("Send Message Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getMessages(conversationId: string, limit = 50) {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 })
            .limit(limit);

        return { success: true, data: JSON.parse(JSON.stringify(messages)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getConversations() {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        const conversations = await Conversation.find({
            participants: session.user.id,
            archivedBy: { $ne: session.user.id } // Filter out archived
        }).sort({ lastMessageAt: -1 }).populate('lastMessage');

        return { success: true, data: JSON.parse(JSON.stringify(conversations)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createConversation(participantIds: string[], type: 'Individual' | 'Group' = 'Individual', name?: string) {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        const allParticipants = [...new Set([session.user.id, ...participantIds])];

        // Check if exists
        if (type === 'Individual') {
            const existing = await Conversation.findOne({
                type: 'Individual',
                participants: { $all: allParticipants, $size: allParticipants.length }
            });

            if (existing) {
                // Un-archive if hidden
                if (existing.archivedBy && existing.archivedBy.includes(session.user.id)) {
                    await Conversation.findByIdAndUpdate(existing._id, {
                        $pull: { archivedBy: session.user.id }
                    });
                }
                return { success: true, data: JSON.parse(JSON.stringify(existing)) };
            }
        }

        const newConv = new Conversation({
            participants: allParticipants,
            type,
            name
        });

        await newConv.save();
        return { success: true, data: JSON.parse(JSON.stringify(newConv)) };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

import User from '@/models/User';

export async function getUsersForChat() {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        const users = await User.find({ _id: { $ne: session.user.id } })
            .select('name email image role')
            .sort({ name: 1 });

        return { success: true, data: JSON.parse(JSON.stringify(users)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function clearChatHistory(conversationId: string, beforeDate?: string) {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        // This is a DESTRUCTIVE clear for everyone?
        // Usually "Clear Chat" means "Clear for ME".
        // But implementing true "Clear for Me" requires "deletedFor: [{userId, timestamp}]" in every message or a "clearTime" in Conversation-User-Meta.
        // Given complexity, and user request "cleared not chat data", 
        // the user likely means "Remove from Recent List" which is achieved by "deleteConversation" (Archive).
        // If they explicitly click "Clear History" inside the chat, they probably mean DELETE ALL.
        // So I will keep this destructive for now as per original code, but "Board Area" text likely referred to the list.

        const query: any = { conversationId };
        if (beforeDate) {
            query.createdAt = { $lt: new Date(beforeDate) };
        }

        await Message.deleteMany(query);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Rename this conceptually to "Archive" but keep name to match frontend call
export async function deleteConversation(conversationId: string) {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        // Soft Delete (Archive) for this user
        await Conversation.findByIdAndUpdate(conversationId, {
            $addToSet: { archivedBy: session.user.id }
        });

        // DO NOT delete messages
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAllConversations() {
    try {
        await connectToDatabase();
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        const conversations = await Conversation.find({ participants: session.user.id });

        // Archive all
        await Conversation.updateMany(
            { _id: { $in: conversations.map(c => c._id) } },
            { $addToSet: { archivedBy: session.user.id } }
        );

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
