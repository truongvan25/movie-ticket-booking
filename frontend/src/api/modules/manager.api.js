import { configuredPrivateClient } from "../../main.jsx";

const managerApi = {
    getStats: () => configuredPrivateClient.get("theater-manager/stats"),
    getTheaters: () => configuredPrivateClient.get("theater-manager/theaters"),

    getMovies: (params = {}) => {
        const q = new URLSearchParams();
        if (params.status) q.append("status", params.status);
        if (params.search) q.append("search", params.search);
        return configuredPrivateClient.get(`theater-manager/movies?${q}`);
    },
    addMovie: (data) => configuredPrivateClient.post("theater-manager/movies", data),
    updateMovie: (id, data) => configuredPrivateClient.put(`theater-manager/movies/${id}`, data),
    deleteMovie: (id) => configuredPrivateClient.delete(`theater-manager/movies/${id}`),

    getRooms: () => configuredPrivateClient.get("theater-manager/rooms"),
    addRoom: (data) => configuredPrivateClient.post("theater-manager/rooms", data),
    deleteRoom: (id) => configuredPrivateClient.delete(`theater-manager/rooms/${id}`),

    getShows: () => configuredPrivateClient.get("theater-manager/shows"),
    addShow: (data) => configuredPrivateClient.post("theater-manager/shows", data),
    updateShow: (id, data) => configuredPrivateClient.put(`theater-manager/shows/${id}`, data),
    deleteShow: (id) => configuredPrivateClient.delete(`theater-manager/shows/${id}`),

    getBookings: (status) => {
        const q = status ? `?status=${status}` : "";
        return configuredPrivateClient.get(`theater-manager/bookings${q}`);
    },

    getReviews: (params = {}) => {
        const q = new URLSearchParams();
        if (params.page) q.append("page", params.page);
        if (params.limit) q.append("limit", params.limit);
        return configuredPrivateClient.get(`theater-manager/reviews?${q}`);
    },
};

export default managerApi;
