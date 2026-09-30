import React from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Star,
  Film,
  Sparkles,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { translations, translateMood } from "../utils/translations";

export default function AnalyticsDashboard({ stats, onDiscoverClick, lang = "th" }) {
  const t = translations[lang] || translations.en;

  if (!stats || stats.total_movies === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-panel border border-white/10 space-y-4">
        <BarChart3 className="w-12 h-12 text-slate-600 animate-pulse" />
        <h3 className="text-xl font-bold text-white">
          {t.analytics.no_stats_title}
        </h3>
        <p className="text-xs text-slate-400 max-w-md">
          {t.analytics.no_stats_sub}
        </p>
        <button
          onClick={onDiscoverClick}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-gold hover:bg-brand-yellow text-black shadow-lg shadow-brand-gold/20 transition-all hover:scale-105"
        >
          {t.analytics.explore_btn}
        </button>
      </div>
    );
  }

  const completionRate =
    stats.total_movies > 0
      ? Math.round((stats.completed_count / stats.total_movies) * 100)
      : 0;

  const genres = Object.entries(stats.genre_distribution || {});
  const maxGenreCount = genres.length > 0 ? Math.max(...genres.map(([, c]) => c)) : 1;

  const moods = Object.entries(stats.mood_distribution || {});
  const sentiments = Object.entries(stats.sentiment_distribution || {});

  const translatedSentimentLabel = (label) => {
    if (lang === "th") {
      if (label === "Positive") return "เชิงบวก (Positive)";
      if (label === "Negative") return "เชิงลบ/หม่น (Negative)";
      if (label === "Neutral") return "เป็นกลาง (Neutral)";
    }
    return label;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-xl">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-gold" /> {t.analytics.title}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t.analytics.subtext}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Movies */}
        <div className="p-5 rounded-xl bg-[#14171F] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t.analytics.total_tracked}</span>
            <Film className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="text-3xl font-black text-white">{stats.total_movies}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.plan_to_watch_count} {t.analytics.planned_to_watch}
          </div>
        </div>

        {/* Completed */}
        <div className="p-5 rounded-xl bg-[#14171F] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t.analytics.watched}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {stats.completed_count}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {completionRate}% {t.analytics.completion_rate}
          </div>
        </div>

        {/* My Average Rating */}
        <div className="p-5 rounded-xl bg-[#14171F] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t.analytics.my_avg_rating}</span>
            <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
          </div>
          <div className="text-3xl font-black text-brand-gold">
            {stats.avg_user_rating > 0 ? stats.avg_user_rating : "—"}
            {stats.avg_user_rating > 0 && <span className="text-sm font-normal text-slate-400">/10</span>}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t.analytics.tmdb_avg} {stats.avg_tmdb_rating}/10
          </div>
        </div>

        {/* Currently Watching */}
        <div className="p-5 rounded-xl bg-[#14171F] border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{t.analytics.in_progress}</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400">
            {stats.watching_count}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {t.analytics.currently_watching}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Breakdown */}
        <div className="p-6 rounded-xl bg-[#14171F] border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-brand-gold" /> {t.analytics.genre_distribution}
          </h3>
          {genres.length === 0 ? (
            <p className="text-xs text-slate-400">{t.analytics.no_genre}</p>
          ) : (
            <div className="space-y-3">
              {genres.map(([name, count]) => {
                const percent = Math.round((count / stats.total_movies) * 100);
                const barWidth = Math.round((count / maxGenreCount) * 100);
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{name}</span>
                      <span className="text-slate-400 font-mono">
                        {count} {t.analytics.films} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${barWidth}%` }}
                        className="h-full bg-gradient-to-r from-brand-gold to-brand-yellow rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sentiment Vibe Profile */}
        <div className="p-6 rounded-xl bg-[#14171F] border border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-purple" /> {t.analytics.sentiment_profile}
          </h3>

          {/* Primary Sentiment Labels */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              {t.analytics.polarity_dist}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {["Positive", "Neutral", "Negative"].map((label) => {
                const count = stats.sentiment_distribution?.[label] || 0;
                const pct =
                  stats.total_movies > 0
                    ? Math.round((count / stats.total_movies) * 100)
                    : 0;
                const color =
                  label === "Positive"
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    : label === "Negative"
                    ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
                    : "text-slate-300 border-slate-600 bg-slate-800/40";

                return (
                  <div
                    key={label}
                    className={`p-3 rounded-lg border text-center ${color}`}
                  >
                    <div className="text-xs font-bold">{translatedSentimentLabel(label)}</div>
                    <div className="text-lg font-black mt-1">{count}</div>
                    <div className="text-[10px] opacity-70">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Atmospheric Mood Tags Cloud */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              {t.analytics.dominant_moods}
            </span>
            {moods.length === 0 ? (
              <p className="text-xs text-slate-400">{t.analytics.no_moods}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {moods.map(([moodName, moodCount]) => (
                  <div
                    key={moodName}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#1E222D] border border-purple-500/30 text-purple-200"
                  >
                    <span>{translateMood(moodName, lang)}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                      {moodCount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
