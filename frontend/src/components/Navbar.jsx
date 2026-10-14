import React from "react";
import {
  Film,
  Bookmark,
  BarChart3,
  Sparkles,
  Key,
  Search,
  CheckCircle2,
  AlertCircle,
  Languages,
} from "lucide-react";
import { translations } from "../utils/translations";

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  watchlistCount,
  configStatus,
  onOpenKeyModal,
  lang,
  setLang,
}) {
  const t = translations[lang] || translations.en;

  const navTabs = [
    { id: "discover", label: t.nav.discover, icon: Film },
    {
      id: "watchlist",
      label: t.nav.watchlist,
      icon: Bookmark,
      badge: watchlistCount,
    },
    { id: "analytics", label: t.nav.analytics, icon: BarChart3 },
    { id: "studio", label: t.nav.studio, icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab("discover")}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group flex-shrink-0"
          >
            <div className="bg-brand-gold text-black font-black text-lg sm:text-xl px-2 sm:px-2.5 py-1 rounded-md tracking-tighter group-hover:scale-105 transition-transform duration-200">
              IMDb
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                at home
                <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                  AI Vibe
                </span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 hidden 2xl:inline whitespace-nowrap">
                {t.brand_sub}
              </span>
            </div>
          </div>

          {/* Search Bar - Responsive, clear, and never collapses into a dot */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit(searchQuery);
            }}
            className="flex flex-1 min-w-[150px] sm:min-w-[220px] md:min-w-[280px] max-w-md relative items-center mx-1 sm:mx-3"
          >
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.nav.search_placeholder}
              className="w-full bg-[#1E222D]/90 border border-slate-700/60 rounded-full pl-10 pr-8 py-1.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  onSearchSubmit("");
                }}
                className="absolute right-3 text-xs text-slate-400 hover:text-white"
                title={t.nav.clear}
              >
                ✕
              </button>
            )}
          </form>

          {/* Right Navigation, Language Switch & TMDB Status */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Nav Tabs (Desktop) */}
            <nav className="hidden xl:flex items-center gap-1 bg-[#14171F] p-1 rounded-xl border border-white/5 flex-shrink-0">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-brand-gold text-black font-semibold shadow-md"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-black" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (
                      <span
                        className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? "bg-black text-brand-gold"
                            : "bg-brand-gold/20 text-brand-gold"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Language Switch Toggle (TH / EN) */}
            <div className="flex items-center bg-[#14171F] p-1 rounded-lg border border-white/10 text-xs flex-shrink-0">
              <button
                type="button"
                onClick={() => setLang("th")}
                className={`px-2 py-1 rounded font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                  lang === "th"
                    ? "bg-brand-gold text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="เปลี่ยนเป็นภาษาไทย"
              >
                🇹🇭 TH
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-1 rounded font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                  lang === "en"
                    ? "bg-brand-gold text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Switch to English"
              >
                🇺🇸 EN
              </button>
            </div>

            {/* TMDB API Key Status Trigger */}
            <button
              onClick={onOpenKeyModal}
              title="Configure TMDB API Key"
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Key className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span className="hidden sm:inline">TMDB:</span>
              {configStatus?.has_tmdb_key ? (
                <span className="flex items-center gap-1 text-emerald-400 whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> {t.nav.tmdb_live}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 whitespace-nowrap">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" /> {t.nav.tmdb_demo}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Tabs */}
        <div className="xl:hidden flex items-center justify-around py-2 border-t border-white/5 overflow-x-auto scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-brand-gold bg-brand-gold/10 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-brand-gold text-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
