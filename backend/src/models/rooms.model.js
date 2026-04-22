import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    theaterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    roomNumber: {
        type: String,
        required: true,
    },
});

roomSchema.index({ theaterId: 1, roomNumber: 1 }, { unique: true });

export default mongoose.model("Room", roomSchema);