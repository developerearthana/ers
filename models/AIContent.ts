import mongoose, { Schema, Document } from 'mongoose';

export interface IAIContent extends Document {
    userId: string; // Ideally ObjectId if user system is strict, keeping string for flexibility based on current auth
    type: 'Post' | 'Reply' | 'Email' | 'Strategy';
    inputData: any; // Flexible object for different tool inputs
    generatedContent: string;
    metadata?: {
        model?: string;
        tokens?: number;
    };
    isSaved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AIContentSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        type: {
            type: String,
            enum: ['Post', 'Reply', 'Email', 'Strategy'],
            required: true
        },
        inputData: { type: Schema.Types.Mixed, required: true },
        generatedContent: { type: String, required: true },
        metadata: {
            model: { type: String },
            tokens: { type: Number }
        },
        isSaved: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.models.AIContent || mongoose.model<IAIContent>('AIContent', AIContentSchema);
