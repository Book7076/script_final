/**
 * API service layer communicating with the FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const movieApi = {
  // Movies & Discovery
  getTrending: (timeWindow = "week", page = 1) =>
    request(`/api/movies/trending?time_window=${timeWindow}&page=${page}`),

  getTopRated: (page = 1) =>
    request(`/api/movies/top-rated?page=${page}`),

  searchMovies: (query, page = 1) =>
    request(`/api/movies/search?query=${encodeURIComponent(query)}&page=${page}`),

  getMovieDetails: (id) =>
    request(`/api/movies/${id}`),

  // Watchlist CRUD
  getWatchlist: ({ status, mood, search, sortBy = "added_at", order = "desc" } = {}) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    if (mood && mood !== "all") params.append("mood", mood);
    if (search) params.append("search", search);
    if (sortBy) params.append("sort_by", sortBy);
    if (order) params.append("order", order);
    return request(`/api/watchlist?${params.toString()}`);
  },

  addToWatchlist: (data) =>
    request("/api/watchlist", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateWatchlistItem: (id, data) =>
    request(`/api/watchlist/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteWatchlistItem: (id) =>
    request(`/api/watchlist/${id}`, {
      method: "DELETE",
    }),

  getWatchlistStats: () =>
    request("/api/watchlist/stats"),

  getExportCsvUrl: () => `${API_BASE_URL}/api/watchlist/export/csv`,
  getExportJsonUrl: () => `${API_BASE_URL}/api/watchlist/export/json`,

  // Sentiment Studio
  analyzeSentiment: (text, movieTitle = null) =>
    request("/api/sentiment/analyze", {
      method: "POST",
      body: JSON.stringify({ text, movie_title: movieTitle }),
    }),

  // System & TMDB Key Configuration
  getConfigStatus: () =>
    request("/api/config/status"),

  updateTmdbKey: (apiKey) =>
    request("/api/config/tmdb-key", {
      method: "POST",
      body: JSON.stringify({ api_key: apiKey }),
    }),
};
