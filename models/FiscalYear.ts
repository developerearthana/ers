import mongoose from "mongoose";

const FiscalYearSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // e.g., "FY 2024-25"
        unique: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["Open", "Closed"],
        default: "Open",
    },
    isCurrent: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure only one year is current
FiscalYearSchema.pre('save', async function () {
    if (this.isCurrent) {
        await mongoose.models.FiscalYear.updateMany(
            { _id: { $ne: this._id } },
            { $set: { isCurrent: false } }
        );
    }
});

export default mongoose.models.FiscalYear || mongoose.model("FiscalYear", FiscalYearSchema);
