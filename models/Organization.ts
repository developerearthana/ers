import mongoose, { Schema, Document } from 'mongoose';
// Force Rebuild

// Interface for Company
export interface ICompany extends Document {
    name: string;
    address: string;
    contactNumber?: string;
    registrationNumber: string;
    website?: string;
    logo?: string; // Standard/Full Logo
    fullLogo?: string; // Explicit Full Logo
    iconLogo?: string; // Icon-based Logo
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Subsidiary
export interface ISubsidiary extends Document {
    companyId: mongoose.Types.ObjectId;
    name: string;
    location: string;
    address?: string;
    contactNumber?: string;
    headOfOperation?: string;
    description?: string;
    logo?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Department
export interface IDepartment extends Document {
    subsidiaryId: mongoose.Types.ObjectId;
    name: string;
    code: string;
    headOfDepartment?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Team
export interface ITeam extends Document {
    name: string;
    teamLead?: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
// Schemas
const CompanySchema = new Schema({
    name: { type: String, required: true },
    address: { type: String },
    contactNumber: { type: String },
    registrationNumber: { type: String },
    website: { type: String },
    logo: { type: String },
    fullLogo: { type: String },
    iconLogo: { type: String },
}, { timestamps: true });

const SubsidiarySchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    location: { type: String },
    address: { type: String },
    contactNumber: { type: String },
    headOfOperation: { type: String },
    description: { type: String },
    logo: { type: String },
}, { timestamps: true });

const DepartmentSchema = new Schema({
    subsidiaryId: { type: Schema.Types.ObjectId, ref: 'Subsidiary', required: true },
    name: { type: String, required: true },
    code: { type: String },
    headOfDepartment: { type: String },
}, { timestamps: true });
const TeamSchema = new Schema({
    name: { type: String, required: true },
    teamLead: { type: Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Export Models
// Prevent Mongoose OverwriteModelError in development
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Company;
    delete mongoose.models.Subsidiary;
    delete mongoose.models.Department;
    delete mongoose.models.Team;
}

export const Company = mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
export const Subsidiary = mongoose.models.Subsidiary || mongoose.model<ISubsidiary>('Subsidiary', SubsidiarySchema);
export const Department = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);
export const Team = mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
