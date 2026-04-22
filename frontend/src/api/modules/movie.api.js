import publicClient from "../clients/public.client";

const movieApi = {
    getMovies: (status, search) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (search) params.append("search", search);
        return publicClient.get(`movies?${params.toString()}`);
    },
    getById: (movieId) => publicClient.get(`movies/${movieId}`),
    getOngoing: () => publicClient.get("movies?status=ongoing"),
    getComingSoon: () => publicClient.get("movies?status=coming-soon"),
};

export default movieApi;
