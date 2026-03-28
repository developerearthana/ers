import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStage {
    id: string;
    name: string;
    order: number;
    modules: string[];
}

export interface IProjectTemplate extends Document {
    name: string;
    description: string;
    stages: IStage[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StageSchema = new Schema<IStage>({
    id: { type: String, required: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    modules: { type: [String], default: [] },
}, { _id: false });

const ProjectTemplateSchema = new Schema<IProjectTemplate>({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    stages: { type: [StageSchema], default: [] },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ProjectTemplate: Model<IProjectTemplate> =
    mongoose.models.ProjectTemplate ||
    mongoose.model<IProjectTemplate>("ProjectTemplate", ProjectTemplateSchema);

export default ProjectTemplate;
