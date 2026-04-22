import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        showId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Show",
            required: true,
        },
        seatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seat",
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
