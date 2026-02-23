import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    conversationId: string;
    sender: string; // User ID
    content: string;
    attachments: string[];
    readBy: string[]; // User IDs who have read the message
}

const MessageSchema: Schema = new Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
        sender: { type: String, required: true },
        content: { type: String, required: true },
        attachments: [{ type: String }],
        readBy: [{ type: String }]
    },
    { timestamps: true }
);

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
