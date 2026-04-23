import { configuredPrivateClient } from "../../main.jsx";
import publicClient from "../clients/public.client.js";

const customerApi = {
    // Public
    getShows: (params = {}) => publicClient.get("shows", { params }),
    getShowById: (showId) => publicClient.get(`shows/${showId}`),
    getShowSeats: (showId) => publicClient.get(`shows/${showId}/seats`),
    getMovieReviews: (movieId) => publicClient.get(`movies/${movieId}/reviews`),

    // Protected
    getProfile: () => configuredPrivateClient.get("customer/profile"),
    updateProfile: (data) => configuredPrivateClient.put("customer/profile", data),
    changePassword: (data) => configuredPrivateClient.put("customer/change-password", data),

    createBooking: (data) => configuredPrivateClient.post("customer/bookings", data),
    getMyBookings: () => configuredPrivateClient.get("customer/bookings"),
    cancelBooking: (id) => configuredPrivateClient.put(`customer/bookings/${id}/cancel`),
    getMyTickets: () => configuredPrivateClient.get("customer/tickets"),
    addReview: (data) => configuredPrivateClient.post("customer/reviews", data),

    createSupport: (data) => configuredPrivateClient.post("customer/support", data),
    getMySupport: () => configuredPrivateClient.get("customer/support"),

    getMyFavorites: () => configuredPrivateClient.get("customer/favorites"),
    toggleFavorite: (movieId) => configuredPrivateClient.post(`customer/favorites/${movieId}`),

    validatePromo: (data) => configuredPrivateClient.post("customer/validate-promo", data),
};

export default customerApi;
