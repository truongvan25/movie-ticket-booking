import mongoose from "mongoose";

const theaterSystemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    logo: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        default: null,
    },
});

export default mongoose.model("TheaterSystem", theaterSystemSchema);
