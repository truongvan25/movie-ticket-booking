import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
    {
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true,
        },
        theaterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Theater",
            required: true,
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        // Giá vé cơ bản cho suất chiếu này (VND)
        price: {
            type: Number,
            required: true,
            default: 90000,
        },
        status: {
            type: String,
            enum: ["planned", "ongoing", "finished", "cancelled"],
            default: "planned",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Show", showSchema);
