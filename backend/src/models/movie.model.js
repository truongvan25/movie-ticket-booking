import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
    {
        movieName: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        genres: {
            type: [String],
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        releaseDate: {
            type: Date,
            required: true,
        },
        poster: {
            type: String,
            default: null,
        },
        // Phân loại độ tuổi: P=mọi lứa tuổi, K=dưới 13 có phụ huynh, T13/T16/T18=từ đủ tuổi
        ageRating: {
            type: String,
            enum: ["P", "K", "T13", "T16", "T18"],
            required: true,
        },
        status: {
            type: String,
            enum: ["ongoing", "coming-soon", "ended"],
            default: "coming-soon",
        },
        theaterManagerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Movie", movieSchema);
