import React, { useState } from "react";
import {
  Download,
  Filter,
  Search,
  Star,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  Film,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import { movieApi } from "../services/api";
import { translations, translateMood } from "../utils/translations";

export default function WatchlistManager({
  watchlist,
  onSelectMovie,
  onUpdateItem,
  onDeleteItem,
  onDiscoverClick,
  lang = "th",
}) {
  const t = translations[lang] || translations.en;

  const [statusFilter, setStatusFilter] = useState("all");
  const [moodFilter, setMoodFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("added_at");
  const [editingItemId, setEditingItemId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editReview, setEditReview] = useState("");
  const [editStatus, setEditStatus] = useState("plan_to_watch");

  const statusTabs = [
    { id: "all", label: t.watchlist.all_items, count: watchlist.length },
    {
      id: "plan_to_watch",
      label: t.watchlist.plan_to_watch,
      count: watchlist.filter((i) => i.watch_status === "plan_to_watch").length,
    },
    {
      id: "watching",
      label: t.watchlist.watching,
      count: watchlist.filter((i) => i.watch_status === "watching").length,
    },
    {
      id: "completed",
      label: t.watchlist.completed,
      count: watchlist.filter((i) => i.watch_status === "completed").length,
    },
    {
      id: "dropped",
      label: t.watchlist.dropped,
      count: watchlist.filter((i) => i.watch_status === "dropped").length,
    },
  ];

  const moodOptions = [
    { id: "all", label: t.watchlist.all_mood_vibes },
    { id: "Inspiring & Uplifting", label: translateMood("Inspiring & Uplifting", lang) },
    { id: "Heartwarming", label: translateMood("Heartwarming", lang) },
    { id: "Dark & Gritty", label: translateMood("Dark & Gritty", lang) },
    { id: "Tense & Suspenseful", label: translateMood("Tense & Suspenseful", lang) },
    { id: "Melancholic & Emotional", label: translateMood("Melancholic & Emotional", lang) },
    { id: "Mind-Bending & Complex", label: translateMood("Mind-Bending & Complex", lang) },
    { id: "High Octane Action", label: translateMood("High Octane Action", lang) },
    { id: "Lighthearted & Fun", label: translateMood("Lighthearted & Fun", lang) },
  ];

  // Filtering logic
  const filteredList = watchlist.filter((item) => {
    if (statusFilter !== "all" && item.watch_status !== statusFilter) return false;
    if (moodFilter !== "all") {
      const itemMoods = item.mood_tags || [];
      const match = itemMoods.some((m) =>
        m.toLowerCase().includes(moodFilter.toLowerCase())
      );
      if (!match) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(q);
      const reviewMatch = (item.user_review || "").toLowerCase().includes(q);
      if (!titleMatch && !reviewMatch) return false;
    }
    return true;
  });

  // Sorting logic
  const sortedList = [...filteredList].sort((a, b) => {
    if (sortBy === "user_rating") return (b.user_rating || 0) - (a.user_rating || 0);
    if (sortBy === "tmdb_rating") return (b.tmdb_rating || 0) - (a.tmdb_rating || 0);
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return new Date(b.added_at || 0) - new Date(a.added_at || 0);
  });

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditRating(item.user_rating || 0);
    setEditReview(item.user_review || "");
    setEditStatus(item.watch_status || "plan_to_watch");
  };

  const handleSaveEdit = async (itemId) => {
    await onUpdateItem(itemId, {
      user_rating: Number(editRating),
      user_review: editReview,
      watch_status: editStatus,
    });
    setEditingItemId(null);
  };

  const downloadFile = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Action Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-white/10 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-brand-gold" /> {t.watchlist.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.watchlist.subtext}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => downloadFile(movieApi.getExportCsvUrl())}
            title="Download full collection as CSV"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all hover:scale-105"
          >
            <FileSpreadsheet className="w-4 h-4" /> {t.watchlist.export_csv}
          </button>
          <button
            onClick={() => downloadFile(movieApi.getExportJsonUrl())}
            title="Download full collection as JSON"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all hover:scale-105"
          >
            <FileCode className="w-4 h-4" /> {t.watchlist.export_json}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl bg-[#14171F] border border-white/5">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-brand-gold text-black font-bold shadow"
                  : "bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id
                    ? "bg-black text-brand-gold font-bold"
                    : "bg-black/30 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right Search & Mood Filter Dropdown */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Mood Filter */}
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="bg-[#1E222D] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-gold"
          >
            {moodOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#1E222D] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-gold"
          >
            <option value="added_at">{t.watchlist.sort_added}</option>
            <option value="user_rating">{t.watchlist.sort_my_rating}</option>
            <option value="tmdb_rating">{t.watchlist.sort_tmdb_rating}</option>
            <option value="title">{t.watchlist.sort_title}</option>
          </select>

          {/* Search inside Watchlist */}
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.watchlist.search_placeholder}
              className="w-full bg-[#1E222D] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>
      </div>

      {/* Watchlist Items Display */}
      {sortedList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-4">
          <Film className="w-12 h-12 text-slate-600 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-300">
            {watchlist.length === 0
              ? t.watchlist.empty_title
              : t.watchlist.empty_filter_title}
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            {watchlist.length === 0
              ? t.watchlist.empty_sub
              : t.watchlist.empty_filter_sub}
          </p>
          {watchlist.length === 0 && (
            <button
              onClick={onDiscoverClick}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-gold hover:bg-brand-yellow text-black shadow-lg shadow-brand-gold/20 transition-all hover:scale-105"
            >
              {t.watchlist.browse_movies}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedList.map((item) => {
            const posterUrl = item.poster_path
              ? item.poster_path.startsWith("http")
                ? item.poster_path
                : `https://image.tmdb.org/t/p/w300${item.poster_path}`
              : null;

            const isEditing = editingItemId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#14171F] border border-white/10 hover:border-slate-700 transition-all shadow-lg flex gap-4"
              >
                {/* Poster Thumbnail */}
                <div
                  onClick={() => onSelectMovie(item.movie_id)}
                  className="w-24 aspect-[2/3] flex-shrink-0 rounded-lg overflow-hidden bg-slate-800 cursor-pointer group relative"
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-slate-400 bg-slate-800">
                      {item.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Details & Review */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4
                          onClick={() => onSelectMovie(item.movie_id)}
                          className="font-bold text-sm text-slate-100 hover:text-brand-gold cursor-pointer transition-colors line-clamp-1"
                        >
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{item.release_date || "N/A"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-brand-gold font-semibold">
                            <Star className="w-3 h-3 fill-brand-gold" />
                            {item.tmdb_rating ? item.tmdb_rating.toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Watch Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          item.watch_status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : item.watch_status === "watching"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : item.watch_status === "dropped"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-slate-700/60 text-slate-300 border border-slate-600"
                        }`}
                      >
                        {item.watch_status === "completed"
                          ? t.watchlist.completed
                          : item.watch_status === "watching"
                          ? t.watchlist.watching
                          : item.watch_status === "dropped"
                          ? t.watchlist.dropped
                          : t.watchlist.plan_to_watch}
                      </span>
                    </div>

                    {/* Sentiment Vibe pill */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-purple/20 text-purple-300 border border-brand-purple/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {item.mood_tags && item.mood_tags.length > 0
                          ? translateMood(item.mood_tags[0], lang)
                          : item.sentiment_label}
                      </span>
                      {item.sentiment_score && (
                        <span className="text-[10px] text-slate-400">
                          Vibe: {Math.round(item.sentiment_score)}%
                        </span>
                      )}
                    </div>

                    {/* Inline Editor or Display of Rating and Review */}
                    {isEditing ? (
                      <div className="mt-3 space-y-2 p-2.5 bg-[#1E222D] rounded-lg border border-brand-gold/40">
                        <div className="flex items-center justify-between">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="bg-[#14171F] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="plan_to_watch">{t.watchlist.plan_to_watch}</option>
                            <option value="watching">{t.watchlist.watching}</option>
                            <option value="completed">{t.watchlist.completed}</option>
                            <option value="dropped">{t.watchlist.dropped}</option>
                          </select>

                          {/* Star rating selector */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="p-0.5"
                              >
                                <Star
                                  className={`w-3 h-3 ${
                                    star <= editRating
                                      ? "fill-brand-gold text-brand-gold"
                                      : "text-slate-600"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          value={editReview}
                          onChange={(e) => setEditReview(e.target.value)}
                          placeholder={t.watchlist.notes_placeholder}
                          rows={2}
                          className="w-full bg-[#14171F] border border-slate-700 rounded p-1.5 text-xs text-white"
                        />

                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="text-[10px] px-2 py-1 rounded text-slate-400 hover:text-white"
                          >
                            {t.detail_modal.cancel}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="text-[10px] px-3 py-1 rounded bg-brand-gold font-bold text-black hover:bg-brand-yellow"
                          >
                            {t.watchlist.save}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-brand-gold">
                          <Star className="w-3.5 h-3.5 fill-brand-gold" />
                          <span>
                            {t.watchlist.my_rating}{" "}
                            {item.user_rating > 0
                              ? `${item.user_rating}/10`
                              : t.detail_modal.unrated}
                          </span>
                        </div>
                        {item.user_review ? (
                          <p className="mt-1 text-slate-300 italic text-[11px] line-clamp-2 bg-black/20 p-1.5 rounded">
                            "{item.user_review}"
                          </p>
                        ) : (
                          <p className="mt-1 text-slate-500 text-[10px]">
                            {t.watchlist.no_review_yet}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  {!isEditing && (
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-[11px] text-slate-400">
                      <span className="text-[10px]">
                        {t.watchlist.added}{" "}
                        {item.added_at
                          ? item.added_at.split("T")[0]
                          : t.watchlist.recently}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="flex items-center gap-1 hover:text-brand-gold transition-colors"
                        >
                          <Edit3 className="w-3 h-3" /> {t.watchlist.edit}
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> {t.watchlist.delete}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
