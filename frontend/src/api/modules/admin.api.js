import { configuredPrivateClient } from "../../main.jsx";

const adminApi = {
    getStats: () => configuredPrivateClient.get("admin/stats"),

    getUsers: (params = {}) => {
        const q = new URLSearchParams();
        if (params.role) q.append("role", params.role);
        if (params.search) q.append("search", params.search);
        return configuredPrivateClient.get(`admin/users?${q}`);
    },
    updateUser: (userId, data) => configuredPrivateClient.put(`admin/users/${userId}`, data),
    deleteUser: (userId) => configuredPrivateClient.delete(`admin/users/${userId}`),

    getMovies: (params = {}) => {
        const q = new URLSearchParams();
        if (params.status) q.append("status", params.status);
        if (params.search) q.append("search", params.search);
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
};

export default adminApi;
