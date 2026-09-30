import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Award,
  Search,
  Sparkles,
  Filter,
  Loader2,
  Film,
} from "lucide-react";
import Navbar from "./components/Navbar";
import MovieCard from "./components/MovieCard";
import MovieDetailModal from "./components/MovieDetailModal";
import WatchlistManager from "./components/WatchlistManager";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import SentimentStudio from "./components/SentimentStudio";
import ApiKeyModal from "./components/ApiKeyModal";
import { movieApi } from "./services/api";
import { translations, translateMood } from "./utils/translations";

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem("imdb_lang") || "th");
  const t = translations[lang] || translations.en;

  useEffect(() => {
    localStorage.setItem("imdb_lang", lang);
  }, [lang]);

  const [activeTab, setActiveTab] = useState("discover");
  const [discoverSubTab, setDiscoverSubTab] = useState("trending"); // "trending" | "top_rated" | "search"
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("all");

  // Data states
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistStats, setWatchlistStats] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);

  // Modal states
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedMovieDetail, setSelectedMovieDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load configuration and watchlist initially
  const loadInitialData = useCallback(async () => {
    try {
      const [cfg, wl, st] = await Promise.allSettled([
        movieApi.getConfigStatus(),
        movieApi.getWatchlist(),
        movieApi.getWatchlistStats(),
      ]);
      if (cfg.status === "fulfilled") setConfigStatus(cfg.value);
      if (wl.status === "fulfilled") setWatchlist(wl.value);
      if (st.status === "fulfilled") setWatchlistStats(st.value);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Fetch movies for discover tab
  const fetchDiscoverMovies = useCallback(
    async (tab, query = "") => {
      setLoadingMovies(true);
      try {
        let resp;
        if (tab === "search" && query.trim()) {
          resp = await movieApi.searchMovies(query);
        } else if (tab === "top_rated") {
          resp = await movieApi.getTopRated();
        } else {
          resp = await movieApi.getTrending("week");
        }
        setMovies(resp.results || []);
      } catch (err) {
        console.error("Error fetching movies:", err);
        showToast(t.toast.error_loading);
      } finally {
        setLoadingMovies(false);
      }
    },
    [t.toast.error_loading]
  );

  // Trigger movie fetch on subtab or search term change
  useEffect(() => {
    if (activeTab === "discover") {
      fetchDiscoverMovies(discoverSubTab, activeSearchTerm);
    }
  }, [activeTab, discoverSubTab, activeSearchTerm, fetchDiscoverMovies]);

  // Handle Search submit from navbar or search bar
  const handleSearchSubmit = (q) => {
    if (!q || !q.trim()) {
      setActiveSearchTerm("");
      setDiscoverSubTab("trending");
      return;
    }
    setActiveSearchTerm(q.trim());
    setDiscoverSubTab("search");
    setActiveTab("discover");
  };

  // Select a movie to view full detail profile (UC-03)
  const handleSelectMovie = async (movieId) => {
    setSelectedMovieId(movieId);
    setLoadingDetail(true);
    try {
      const details = await movieApi.getMovieDetails(movieId);
      setSelectedMovieDetail(details);
    } catch (err) {
      console.error("Failed to load movie details:", err);
      showToast(lang === "th" ? "ไม่สามารถโหลดข้อมูลภาพยนตร์ได้" : "Unable to load movie profile.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedMovieId(null);
    setSelectedMovieDetail(null);
  };

  // Quick toggle from card
  const handleQuickToggleWatchlist = async (movie) => {
    const existing = watchlist.find((w) => w.movie_id === movie.id);
    if (existing) {
      // Remove
      try {
        await movieApi.deleteWatchlistItem(existing.id);
        setWatchlist((prev) => prev.filter((w) => w.id !== existing.id));
        showToast(t.toast.removed(movie.title));
        const st = await movieApi.getWatchlistStats();
        setWatchlistStats(st);
      } catch (err) {
        showToast(t.toast.error_delete);
      }
    } else {
      // Add
      try {
        const sentiment = movie.sentiment || {};
        const added = await movieApi.addToWatchlist({
          movie_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          genres: movie.genres || [],
          tmdb_rating: movie.tmdb_rating || 0,
          overview: movie.overview || "",
          user_rating: 0,
          user_review: "",
          watch_status: "plan_to_watch",
          sentiment_label: sentiment.sentiment_label || "Neutral",
          sentiment_score: sentiment.vibe_score || 50,
          mood_tags: sentiment.mood_tags || [],
        });
        setWatchlist((prev) => [added, ...prev]);
        showToast(t.toast.added(movie.title));
        const st = await movieApi.getWatchlistStats();
        setWatchlistStats(st);
      } catch (err) {
        showToast(t.toast.error_save);
      }
    }
  };

  // Save/Update from Detail Modal
  const handleSaveToWatchlist = async (data) => {
    try {
      const saved = await movieApi.addToWatchlist(data);
      setWatchlist((prev) => {
        const filtered = prev.filter((w) => w.movie_id !== data.movie_id);
        return [saved, ...filtered];
      });
      showToast(t.toast.saved(data.title));
      const st = await movieApi.getWatchlistStats();
      setWatchlistStats(st);
      handleCloseDetail();
    } catch (err) {
      showToast(t.toast.error_save);
    }
  };

  // Delete from Watchlist
  const handleDeleteWatchlistItem = async (id) => {
    try {
      await movieApi.deleteWatchlistItem(id);
      setWatchlist((prev) => prev.filter((w) => w.id !== id));
      showToast(lang === "th" ? "นำออกจาก Watchlist เรียบร้อยแล้ว" : "Removed from watchlist.");
      const st = await movieApi.getWatchlistStats();
      setWatchlistStats(st);
    } catch (err) {
      showToast(t.toast.error_delete);
    }
  };

  // Update from inline Watchlist Manager
  const handleUpdateWatchlistItem = async (id, data) => {
    try {
      const updated = await movieApi.updateWatchlistItem(id, data);
      setWatchlist((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      showToast(t.toast.updated);
      const st = await movieApi.getWatchlistStats();
      setWatchlistStats(st);
    } catch (err) {
      showToast(t.toast.error_update);
    }
  };

  // Filter movies by mood in discover view
  const displayedMovies = movies.filter((movie) => {
    if (selectedMoodFilter === "all") return true;
    const moods = movie.sentiment?.mood_tags || [];
    return moods.some((m) =>
      m.toLowerCase().includes(selectedMoodFilter.toLowerCase())
    );
  });

  const moodFilterChips = [
    { id: "all", label: t.discover.all_vibes },
    { id: "Inspiring & Uplifting", label: translateMood("Inspiring & Uplifting", lang) },
    { id: "Heartwarming", label: translateMood("Heartwarming", lang) },
    { id: "Dark & Gritty", label: translateMood("Dark & Gritty", lang) },
    { id: "Tense & Suspenseful", label: translateMood("Tense & Suspenseful", lang) },
    { id: "Mind-Bending & Complex", label: translateMood("Mind-Bending & Complex", lang) },
    { id: "High Octane Action", label: translateMood("High Octane Action", lang) },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 py-2.5 px-4 rounded-xl bg-brand-gold text-black font-bold text-xs shadow-2xl animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        watchlistCount={watchlist.length}
        configStatus={configStatus}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "discover" && (
          <div className="space-y-6">
            {/* Discover Header & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-white/10 shadow-xl">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <Film className="w-6 h-6 text-brand-gold" /> {t.discover.title}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {t.discover.subtext}
                </p>
              </div>

              {/* Sub-tabs: Trending vs Top Rated */}
              <div className="flex items-center gap-2 bg-[#14171F] p-1.5 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    setDiscoverSubTab("trending");
                    setActiveSearchTerm("");
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    discoverSubTab === "trending"
                      ? "bg-brand-gold text-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> {t.discover.trending}
                </button>
                <button
                  onClick={() => {
                    setDiscoverSubTab("top_rated");
                    setActiveSearchTerm("");
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    discoverSubTab === "top_rated"
                      ? "bg-brand-gold text-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" /> {t.discover.top_rated}
                </button>
              </div>
            </div>

            {/* Mood Vibe Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 whitespace-nowrap pl-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-purple" /> {t.discover.mood_filter}
              </span>
              {moodFilterChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedMoodFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedMoodFilter === chip.id
                      ? "bg-brand-purple text-white font-bold shadow-md shadow-purple-500/20"
                      : "bg-[#14171F] text-slate-300 hover:text-white hover:bg-slate-800 border border-white/5"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Search result indicator */}
            {activeSearchTerm && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#14171F] border border-white/10 text-xs">
                <span className="text-slate-300">
                  {t.discover.search_results_for}{" "}
                  <strong className="text-brand-gold font-bold">
                    "{activeSearchTerm}"
                  </strong>
                </span>
                <button
                  onClick={() => {
                    setActiveSearchTerm("");
                    setSearchQuery("");
                    setDiscoverSubTab("trending");
                  }}
                  className="text-slate-400 hover:text-white underline"
                >
                  {t.discover.reset_trending}
                </button>
              </div>
            )}

            {/* Movies Grid */}
            {loadingMovies ? (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                <p className="text-xs text-slate-400 font-medium">
                  {t.discover.loading}
                </p>
              </div>
            ) : displayedMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl glass-panel border border-white/10 space-y-3">
                <Search className="w-10 h-10 text-slate-600" />
                <h3 className="text-base font-bold text-slate-300">
                  {t.discover.no_movies_title}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  {t.discover.no_movies_sub}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {displayedMovies.map((movie) => {
                  const isInWatchlist = watchlist.some(
                    (w) => w.movie_id === movie.id
                  );
                  return (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      isInWatchlist={isInWatchlist}
                      onSelectMovie={handleSelectMovie}
                      onQuickToggleWatchlist={handleQuickToggleWatchlist}
                      lang={lang}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Watchlist Manager Tab */}
        {activeTab === "watchlist" && (
          <WatchlistManager
            watchlist={watchlist}
            onSelectMovie={handleSelectMovie}
            onUpdateItem={handleUpdateWatchlistItem}
            onDeleteItem={handleDeleteWatchlistItem}
            onDiscoverClick={() => setActiveTab("discover")}
            lang={lang}
          />
        )}

        {/* Analytics Dashboard Tab */}
        {activeTab === "analytics" && (
          <AnalyticsDashboard
            stats={watchlistStats}
            onDiscoverClick={() => setActiveTab("discover")}
            lang={lang}
          />
        )}

        {/* Sentiment Studio Tab */}
        {activeTab === "studio" && <SentimentStudio lang={lang} />}
      </main>

      {/* Movie Profile Detail Modal (UC-03) */}
      <MovieDetailModal
        movie={selectedMovieDetail}
        watchlistItem={
          selectedMovieDetail
            ? watchlist.find((w) => w.movie_id === selectedMovieDetail.id)
            : null
        }
        isOpen={Boolean(selectedMovieId)}
        onClose={handleCloseDetail}
        onSaveToWatchlist={handleSaveToWatchlist}
        onRemoveFromWatchlist={handleDeleteWatchlistItem}
        lang={lang}
      />

      {/* TMDB API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        configStatus={configStatus}
        onKeyUpdated={() => {
          loadInitialData();
          fetchDiscoverMovies(discoverSubTab, activeSearchTerm);
        }}
        lang={lang}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-12 bg-[#0B0C10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="bg-brand-gold text-black font-black px-1.5 py-0.5 rounded text-[10px]">
              IMDb
            </span>
            <span>at home • {t.brand_sub}</span>
          </div>
          <p>
            Powered by TMDB API & Python FastAPI • Object-Oriented Architecture
          </p>
        </div>
      </footer>
    </div>
  );
}
