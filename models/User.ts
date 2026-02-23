import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    role: 'user' | 'admin' | 'vendor' | 'customer' | 'super-admin' | 'manager' | 'staff';
    provider: 'credentials' | 'google';
    customRole?: mongoose.Types.ObjectId; // Reference to Role model
    createdAt: Date;
    updatedAt: Date;
    salaryStructure?: {
        basic: number;
        hra: number;
        allowances: number;
        deductions: {
            pf: number;
            tax: number;
            other: number;
        }
    };
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false },
        image: { type: String },
        role: { type: String, enum: ['user', 'admin', 'vendor', 'customer', 'super-admin', 'manager', 'staff'], default: 'user' }, // Flexible role for UI
        dept: { type: String, default: 'General' },
        status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
        jobTitle: { type: String },
        customRole: { type: Schema.Types.ObjectId, ref: 'Role' },
        customPermissions: { type: [String], default: [] }, // User-specific permission overrides
        provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
        ipRestrictionEnabled: { type: Boolean, default: false },
        allowedIP: { type: String },
        ipRestrictionLiftedUntil: { type: Date },
        salaryStructure: {
            basic: { type: Number, default: 0 },
            hra: { type: Number, default: 0 },
            allowances: { type: Number, default: 0 },
            deductions: {
                pf: { type: Number, default: 0 },
                tax: { type: Number, default: 0 },
                other: { type: Number, default: 0 }
            }
        }
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
