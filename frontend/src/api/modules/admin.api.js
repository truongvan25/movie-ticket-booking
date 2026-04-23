import { configuredPrivateClient } from "../../main.jsx";

const adminApi = {
    getStats: () => configuredPrivateClient.get("admin/stats"),

    getUsers: (params = {}) => {
        const q = new URLSearchParams();
        if (params.role) q.append("role", params.role);
        if (params.search) q.append("search", params.search);
        if (params.page) q.append("page", params.page);
        if (params.limit) q.append("limit", params.limit);
        return configuredPrivateClient.get(`admin/users?${q}`);
    },
    updateUser: (userId, data) => configuredPrivateClient.put(`admin/users/${userId}`, data),
    deleteUser: (userId) => configuredPrivateClient.delete(`admin/users/${userId}`),

    getMovies: (params = {}) => {
        const q = new URLSearchParams();
        if (params.status) q.append("status", params.status);
        if (params.search) q.append("search", params.search);
        if (params.page) q.append("page", params.page);
        if (params.limit) q.append("limit", params.limit);
        return configuredPrivateClient.get(`admin/movies?${q}`);
    },
    updateMovie: (movieId, data) => configuredPrivateClient.put(`admin/movies/${movieId}`, data),
    deleteMovie: (movieId) => configuredPrivateClient.delete(`admin/movies/${movieId}`),

    getTheaters: () => configuredPrivateClient.get("admin/theaters"),

    getBookings: (status) => {
        const q = status ? `?status=${status}` : "";
        return configuredPrivateClient.get(`admin/bookings${q}`);
    },

    getRevenue: () => configuredPrivateClient.get("admin/revenue"),

    getReviews: (params = {}) => {
        const q = new URLSearchParams();
        if (params.movieId) q.append("movieId", params.movieId);
        if (params.page) q.append("page", params.page);
        if (params.limit) q.append("limit", params.limit);
        return configuredPrivateClient.get(`admin/reviews?${q}`);
    },
    deleteReview: (reviewId) => configuredPrivateClient.delete(`admin/reviews/${reviewId}`),

    getSupport: (params = {}) => {
        const q = new URLSearchParams();
        if (params.status) q.append("status", params.status);
        if (params.page) q.append("page", params.page);
        return configuredPrivateClient.get(`admin/support?${q}`);
    },
    replySupport: (ticketId, data) => configuredPrivateClient.put(`admin/support/${ticketId}`, data),

    getPromoCodes: () => configuredPrivateClient.get("admin/promo-codes"),
    createPromoCode: (data) => configuredPrivateClient.post("admin/promo-codes", data),
    updatePromoCode: (id, data) => configuredPrivateClient.put(`admin/promo-codes/${id}`, data),
    deletePromoCode: (id) => configuredPrivateClient.delete(`admin/promo-codes/${id}`),
};

export default adminApi;
