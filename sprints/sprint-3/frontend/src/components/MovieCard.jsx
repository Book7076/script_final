import React from "react";
import { Star, Bookmark, Check, Sparkles } from "lucide-react";
import { translations, translateMood } from "../utils/translations";

export default function MovieCard({
  movie,
  isInWatchlist,
  onSelectMovie,
  onQuickToggleWatchlist,
  lang = "th",
}) {
  const t = translations[lang] || translations.en;

  const posterUrl = movie.poster_path
    ? movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const releaseYear = movie.release_date
    ? movie.release_date.split("-")[0]
    : "N/A";

  // Sentiment vibe visual color mapping
  const sentiment = movie.sentiment || {};
  const vibeScore = sentiment.vibe_score ?? 50;
  const moodTags = sentiment.mood_tags || [];
  const primaryMood = moodTags[0] || (vibeScore >= 60 ? "Inspiring & Uplifting" : vibeScore <= 40 ? "Dark & Gritty" : "Thought-Provoking");
  const translatedPrimaryMood = translateMood(primaryMood, lang);

  let vibeBadgeBg = "bg-slate-700/60 text-slate-300 border-slate-600";
  if (vibeScore >= 65) {
    vibeBadgeBg = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  } else if (vibeScore <= 38) {
    vibeBadgeBg = "bg-rose-500/20 text-rose-300 border-rose-500/40";
  } else if (primaryMood.includes("Mind-Bending") || primaryMood.includes("Complex")) {
    vibeBadgeBg = "bg-purple-500/20 text-purple-300 border-purple-500/40";
  } else {
    vibeBadgeBg = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
  }

  return (
    <div
      onClick={() => onSelectMovie(movie.id)}
      className="group relative flex flex-col bg-[#14171F] rounded-xl overflow-hidden border border-white/5 hover:border-brand-gold/50 shadow-lg hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400">
            <span className="font-bold text-lg text-slate-200">{movie.title}</span>
            <span className="text-xs text-slate-500 mt-2">{t.movie_card.no_poster}</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14171F] via-transparent to-black/40 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          {/* TMDB Rating Badge */}
          <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.8 rounded-md border border-white/10 text-xs font-bold text-brand-gold">
            <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
            <span>{movie.tmdb_rating ? movie.tmdb_rating.toFixed(1) : "N/A"}</span>
          </div>

          {/* Quick Watchlist Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickToggleWatchlist(movie);
            }}
            title={isInWatchlist ? t.movie_card.remove_tooltip : t.movie_card.add_tooltip}
            className={`p-1.5 rounded-md backdrop-blur-md border transition-all ${
              isInWatchlist
                ? "bg-brand-gold text-black border-brand-gold font-bold scale-105"
                : "bg-black/65 text-slate-300 border-white/10 hover:bg-brand-gold hover:text-black hover:scale-110"
            }`}
          >
            {isInWatchlist ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Sentiment Vibe Badge over poster bottom */}
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <div
            className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium backdrop-blur-md border ${vibeBadgeBg}`}
          >
            <div className="flex items-center gap-1 truncate">
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{translatedPrimaryMood}</span>
            </div>
            <span className="font-bold ml-1">{vibeScore}%</span>
          </div>
        </div>
      </div>

      {/* Metadata Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{releaseYear}</span>
            <span className="truncate max-w-[120px]">
              {movie.genres && movie.genres.length > 0
                ? movie.genres.slice(0, 2).join(" • ")
                : t.movie_card.film}
            </span>
          </div>
          <h3 className="font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-brand-gold transition-colors">
            {movie.title}
          </h3>
        </div>

        {/* Plot preview */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {movie.overview || t.movie_card.no_synopsis}
        </p>
      </div>
    </div>
  );
}
