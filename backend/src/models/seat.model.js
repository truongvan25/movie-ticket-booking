import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
        seatNumber: {
            type: String,
            required: true,
        },
        seatType: {
            type: String,
            enum: ["standard", "vip", "couple"],
            required: true,
            default: "standard",
        },
        isDisabled: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Seat", seatSchema);
