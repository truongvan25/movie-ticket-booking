import { configuredPrivateClient } from "../../main.jsx";
import publicClient from "../clients/public.client.js";

const customerApi = {
    // Public
    getShows: (params = {}) => publicClient.get("shows", { params }),
    getShowById: (showId) => publicClient.get(`shows/${showId}`),
    getShowSeats: (showId) => publicClient.get(`shows/${showId}/seats`),
    getMovieReviews: (movieId) => publicClient.get(`movies/${movieId}/reviews`),

    // Protected
    createBooking: (data) => configuredPrivateClient.post("customer/bookings", data),
    getMyBookings: () => configuredPrivateClient.get("customer/bookings"),
    cancelBooking: (id) => configuredPrivateClient.put(`customer/bookings/${id}/cancel`),
    getMyTickets: () => configuredPrivateClient.get("customer/tickets"),
    addReview: (data) => configuredPrivateClient.post("customer/reviews", data),
};

export default customerApi;
