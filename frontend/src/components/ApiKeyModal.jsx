import React, { useState } from "react";
import { X, Key, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { movieApi } from "../services/api";
import { translations } from "../utils/translations";

export default function ApiKeyModal({ isOpen, onClose, configStatus, onKeyUpdated, lang = "th" }) {
  if (!isOpen) return null;

  const t = translations[lang] || translations.en;

  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await movieApi.updateTmdbKey(apiKey.trim());
      setStatusMessage({
        type: "success",
        text: t.key_modal.success_msg,
      });
      if (onKeyUpdated) onKeyUpdated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update API key.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#14171F] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-brand-gold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.key_modal.title}</h3>
            <p className="text-xs text-slate-400">
              {t.key_modal.subtext}
            </p>
          </div>
        </div>

        {/* Current status banner */}
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
            configStatus?.has_tmdb_key
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}
        >
          {configStatus?.has_tmdb_key ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )}
          <div>
            <p className="font-semibold">
              {configStatus?.has_tmdb_key
                ? t.key_modal.live_active
                : t.key_modal.demo_mode}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {configStatus?.has_tmdb_key
                ? t.key_modal.live_desc
                : t.key_modal.demo_desc}
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.key_modal.key_label}
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t.key_modal.key_placeholder}
              className="w-full bg-[#1A1D27] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold font-mono"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-2.5 rounded-lg text-xs font-medium ${
                statusMessage.type === "success"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-gold flex items-center gap-1 underline underline-offset-2"
            >
              {t.key_modal.get_key_link} <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              {t.key_modal.close}
            </button>
            <button
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-gold hover:bg-brand-yellow text-black shadow-lg shadow-brand-gold/20 transition-all hover:scale-105"
            >
              {saving ? t.key_modal.saving : t.key_modal.save_key}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
