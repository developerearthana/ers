import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalSettings extends Document {
    systemName: string;
    timeZone: string;
    security: {
        twoFactorAuth: boolean;
        ipRestriction: boolean;
    };
    backup: {
        frequency: string;
        retention: string;
    };
    updatedBy?: string;
    updatedAt: Date;
}

const GlobalSettingsSchema: Schema = new Schema(
    {
        systemName: { type: String, default: 'PlanRite ERP' },
        timeZone: { type: String, default: 'UTC' },
        security: {
            twoFactorAuth: { type: Boolean, default: false },
            ipRestriction: { type: Boolean, default: false },
        },
        backup: {
            frequency: { type: String, default: 'Daily' },
            retention: { type: String, default: '1 Year' },
        },
        updatedBy: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.GlobalSettings || mongoose.model<IGlobalSettings>('GlobalSettings', GlobalSettingsSchema);
