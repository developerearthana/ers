import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    participants: string[]; // User IDs
    type: 'Individual' | 'Group';
    name?: string; // For group chats
    lastMessage?: string; // Message ID
    lastMessageAt?: Date;
    unreadCounts: Map<string, number>; // UserID -> Count
}

const ConversationSchema: Schema = new Schema(
    {
        participants: [{ type: String, required: true }],
        type: { type: String, enum: ['Individual', 'Group'], default: 'Individual' },
        name: { type: String },
        lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
        lastMessageAt: { type: Date },
        unreadCounts: { type: Map, of: Number, default: new Map() },
        archivedBy: [{ type: String }] // User IDs who have hidden this chat
    },
    { timestamps: true }
);

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
