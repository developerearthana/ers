import mongoose from "mongoose";

const ExpenseCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    type: {
        type: String,
        enum: ["Expense", "Income"],
        default: "Expense"
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.ExpenseCategory || mongoose.model("ExpenseCategory", ExpenseCategorySchema);
