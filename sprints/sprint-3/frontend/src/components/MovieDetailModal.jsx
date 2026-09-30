import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Bookmark,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2,
  Quote,
  Activity,
  Users,
} from "lucide-react";
import { translations, translateMood } from "../utils/translations";

export default function MovieDetailModal({
  movie,
  watchlistItem,
  isOpen,
  onClose,
  onSaveToWatchlist,
  onRemoveFromWatchlist,
  lang = "th",
}) {
  if (!isOpen || !movie) return null;

  const t = translations[lang] || translations.en;

  const [status, setStatus] = useState("plan_to_watch");
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (watchlistItem) {
      setStatus(watchlistItem.watch_status || "plan_to_watch");
      setUserRating(watchlistItem.user_rating || 0);
      setUserReview(watchlistItem.user_review || "");
    } else {
      setStatus("plan_to_watch");
      setUserRating(0);
      setUserReview("");
    }
  }, [watchlistItem, movie]);

  const backdropUrl = movie.backdrop_path
    ? movie.backdrop_path.startsWith("http")
      ? movie.backdrop_path
      : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const sentiment = movie.sentiment || {};
  const vibeScore = sentiment.vibe_score ?? 50;
  const moodTags = sentiment.mood_tags || [];
  const breakdown = sentiment.breakdown || { positive: 0.33, neutral: 0.34, negative: 0.33 };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveToWatchlist({
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        genres: movie.genres || [],
        tmdb_rating: movie.tmdb_rating || 0,
        overview: movie.overview || "",
        user_rating: Number(userRating),
        user_review: userReview,
        watch_status: status,
        sentiment_label: sentiment.sentiment_label || "Neutral",
        sentiment_score: vibeScore,
        mood_tags: moodTags,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#14171F] border border-white/15 rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-black text-slate-300 hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Backdrop Banner Header */}
        <div className="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover object-top opacity-50"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#14171F] via-[#14171F]/50 to-transparent" />

          {/* Quick Header Details inside backdrop */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6">
            {posterUrl && (
              <img
                src={posterUrl}
                alt={movie.title}
                className="hidden sm:block w-28 aspect-[2/3] object-cover rounded-lg border-2 border-white/20 shadow-2xl"
              />
            )}
            <div className="flex-1">
              {movie.tagline && (
                <p className="text-xs italic text-brand-gold/90 mb-1">
                  "{movie.tagline}"
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                {movie.release_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {movie.release_date}
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {movie.runtime} min
                  </span>
                )}
                <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-brand-gold font-bold">
                  <Star className="w-3.5 h-3.5 fill-brand-gold" />
                  {movie.tmdb_rating ? movie.tmdb_rating.toFixed(1) : "N/A"} / 10
                  {movie.vote_count > 0 && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({movie.vote_count.toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">
              {t.detail_modal.synopsis}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {movie.overview || t.detail_modal.no_synopsis}
            </p>
          </div>

          {/* AI Sentiment Analysis Card */}
          <div className="p-5 rounded-xl bg-[#1A1D27] border border-white/10 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                <h3 className="text-base font-bold text-white">
                  {t.detail_modal.sentiment_vibe}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{t.detail_modal.atmosphere_score}</span>
                <span className="text-lg font-black text-brand-gold px-2 py-0.5 bg-black/40 rounded border border-brand-gold/30">
                  {vibeScore}%
                </span>
              </div>
            </div>

            {/* AI Summary sentence */}
            <p className="text-xs text-slate-300 italic bg-black/30 p-3 rounded-lg border border-white/5">
              {sentiment.summary || "Atmospheric evaluation processed."}
            </p>

            {/* Mood Tags */}
            {moodTags.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {t.detail_modal.detected_moods}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {moodTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-purple/20 text-purple-300 border border-brand-purple/30"
                    >
                      {translateMood(tag, lang)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sentiment Breakdown Gauge */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>{t.detail_modal.positive}: {Math.round(breakdown.positive * 100)}%</span>
                <span>{t.detail_modal.neutral}: {Math.round(breakdown.neutral * 100)}%</span>
                <span>{t.detail_modal.negative}: {Math.round(breakdown.negative * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-800">
                <div
                  style={{ width: `${breakdown.positive * 100}%` }}
                  className="bg-emerald-500 transition-all"
                  title="Positive"
                />
                <div
                  style={{ width: `${breakdown.neutral * 100}%` }}
                  className="bg-slate-500 transition-all"
                  title="Neutral"
                />
                <div
                  style={{ width: `${breakdown.negative * 100}%` }}
                  className="bg-rose-500 transition-all"
                  title="Negative"
                />
              </div>
            </div>

            {/* Keywords */}
            {sentiment.keywords && sentiment.keywords.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-400">{t.detail_modal.tone_cues}</span>
                {sentiment.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cast Members */}
          {movie.cast && movie.cast.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-gold" /> {t.detail_modal.key_cast}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {movie.cast.map((actor) => (
                  <div
                    key={actor.id || actor.name}
                    className="p-2 rounded-lg bg-slate-900/80 border border-white/5 flex items-center gap-2.5"
                  >
                    {actor.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                        {actor.name.charAt(0)}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {actor.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {actor.character || "Cast"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews with Sentiment */}
          {movie.reviews && movie.reviews.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Quote className="w-4 h-4 text-brand-gold" /> {t.detail_modal.featured_reviews}
              </h3>
              <div className="space-y-3">
                {movie.reviews.map((r, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-lg bg-slate-900/70 border border-white/5 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">
                        {r.author || "Critic"}
                      </span>
                      {r.rating && (
                        <span className="text-brand-gold font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-brand-gold" /> {r.rating}/10
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 italic">"{r.content}"</p>
                    {r.sentiment && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-white/5">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        <span>{t.detail_modal.review_sentiment}</span>
                        <span
                          className={`font-semibold ${
                            r.sentiment.sentiment_label === "Positive"
                              ? "text-emerald-400"
                              : r.sentiment.sentiment_label === "Negative"
                              ? "text-rose-400"
                              : "text-slate-300"
                          }`}
                        >
                          {r.sentiment.sentiment_label} ({r.sentiment.vibe_score}%)
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Watchlist Management Form */}
          <form
            onSubmit={handleSave}
            className="p-5 rounded-xl bg-gradient-to-br from-[#1E222D] to-[#161822] border border-brand-gold/30 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-gold flex items-center gap-2">
                <Bookmark className="w-4 h-4" /> {t.detail_modal.personal_journal}
              </h3>
              {watchlistItem && (
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {t.detail_modal.saved_badge}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Watch Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.detail_modal.watch_status}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#12141A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                >
                  <option value="plan_to_watch">{t.detail_modal.plan_to_watch}</option>
                  <option value="watching">{t.detail_modal.watching}</option>
                  <option value="completed">{t.detail_modal.completed}</option>
                  <option value="dropped">{t.detail_modal.dropped}</option>
                </select>
              </div>

              {/* Personal Rating (1-10) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.detail_modal.personal_rating}{" "}
                  <span className="text-brand-gold font-bold">
                    {userRating > 0 ? `${userRating} / 10` : t.detail_modal.unrated}
                  </span>
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= userRating
                            ? "fill-brand-gold text-brand-gold"
                            : "text-slate-600 hover:text-slate-400"
                        }`}
                      />
                    </button>
                  ))}
                  {userRating > 0 && (
                    <button
                      type="button"
                      onClick={() => setUserRating(0)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 ml-1 underline"
                    >
                      {t.detail_modal.clear_rating}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Review Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.detail_modal.personal_review_label}
              </label>
              <textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder={t.detail_modal.personal_review_placeholder}
                rows={3}
                className="w-full bg-[#12141A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              {watchlistItem ? (
                <button
                  type="button"
                  onClick={() => onRemoveFromWatchlist(watchlistItem.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t.detail_modal.remove_from_watchlist}
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  {t.detail_modal.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold bg-brand-gold hover:bg-brand-yellow text-black shadow-lg shadow-brand-gold/20 transition-all hover:scale-105"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isSaving
                    ? t.detail_modal.saving
                    : watchlistItem
                    ? t.detail_modal.update_watchlist
                    : t.detail_modal.add_watchlist}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
