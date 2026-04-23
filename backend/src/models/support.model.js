import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ["open", "in-progress", "resolved", "closed"],
            default: "open",
        },
        adminReply: { type: String, default: null },
        repliedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export default mongoose.model("Support", supportSchema);
