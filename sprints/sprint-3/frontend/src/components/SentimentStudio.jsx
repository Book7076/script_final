import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Zap,
  Tag,
  Activity,
  Smile,
  Meh,
  Frown,
  RotateCcw,
} from "lucide-react";
import { movieApi } from "../services/api";
import { translations, translateMood } from "../utils/translations";

export default function SentimentStudio({ lang = "th" }) {
  const t = translations[lang] || translations.en;

  const [text, setText] = useState(
    lang === "th"
      ? "ภาพยนตร์เรื่องนี้เป็นผลงานชิ้นเอกที่ยอดเยี่ยมอย่างแท้จริง ผสมผสานความลึกซึ้งทางอารมณ์เข้ากับแนวคิดที่หักมุมชวนขบคิด อบอุ่นหัวใจและสร้างแรงบันดาลใจได้อย่างงดงาม"
      : "A breathtaking, brilliant masterpiece that blends emotional depth with mind-bending concepts. Truly extraordinary filmmaking with an inspiring climax."
  );
  const [movieTitle, setMovieTitle] = useState(lang === "th" ? "ตัวอย่างภาพยนตร์" : "Sample Film Review");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    polarity: 0.85,
    vibe_score: 92.5,
    sentiment_label: "Positive",
    subjectivity: 0.65,
    mood_tags: ["Inspiring & Uplifting", "Mind-Bending & Complex"],
    keywords: ["masterpiece", "brilliant", "inspiring", "extraordinary"],
    summary: lang === "th"
      ? "ภาพยนตร์ถ่ายทอดบรรยากาศที่เปี่ยมด้วยแรงบันดาลใจและสดใสเบิกบาน (92.5%) โดดเด่นด้วยโทนอารมณ์ที่สร้างแรงบันดาลใจ"
      : "For 'Sample Film Review', the narrative evokes an uplifting and vibrant vibe (92.5%), highlighted by Inspiring & Uplifting themes.",
    breakdown: { positive: 0.85, neutral: 0.1, negative: 0.05 },
  });

  const presets = lang === "th" ? [
    {
      title: "ผลงานชิ้นเอกสร้างแรงบันดาลใจ",
      text: "A breathtaking, brilliant masterpiece that blends emotional depth with mind-bending concepts. Truly extraordinary filmmaking with an inspiring climax.",
    },
    {
      title: "อาชญากรรมหม่นมืดตึงเครียด",
      text: "A dark and gritty psychological descent into corrupt urban decay. Violent, tense, and brutal from start to finish.",
    },
    {
      title: "เรื่องราวอบอุ่นหัวใจ",
      text: "An enchanting and heartwarming journey about family, friendship, and unconditional love. Full of charming humor and delightful moments.",
    },
    {
      title: "บทวิจารณ์เชิงลบ/น่าผิดหวัง",
      text: "A completely boring, awful, and atrocious disaster. The plot is a shallow mess with terrible dialogue and uninspired acting.",
    },
  ] : [
    {
      title: "Masterpiece Praise",
      text: "A breathtaking, brilliant masterpiece that blends emotional depth with mind-bending concepts. Truly extraordinary filmmaking with an inspiring climax.",
    },
    {
      title: "Dark Crime Noir",
      text: "A dark and gritty psychological descent into corrupt urban decay. Violent, tense, and brutal from start to finish.",
    },
    {
      title: "Heartwarming Tale",
      text: "An enchanting and heartwarming journey about family, friendship, and unconditional love. Full of charming humor and delightful moments.",
    },
    {
      title: "Critical Pan / Flop",
      text: "A completely boring, awful, and atrocious disaster. The plot is a shallow mess with terrible dialogue and uninspired acting.",
    },
  ];

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const data = await movieApi.analyzeSentiment(text, movieTitle || null);
      setResult(data);
    } catch (err) {
      console.error("Sentiment analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (p) => {
    setMovieTitle(p.title);
    setText(p.text);
  };

  const getSentimentIcon = (label) => {
    if (label === "Positive") return <Smile className="w-6 h-6 text-emerald-400" />;
    if (label === "Negative") return <Frown className="w-6 h-6 text-rose-400" />;
    return <Meh className="w-6 h-6 text-slate-300" />;
  };

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
          <Sparkles className="w-6 h-6 text-brand-purple" /> {t.studio.title}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t.studio.subtext}
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#14171F] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-gold" /> {t.studio.text_input}
            </h3>
            <button
              onClick={() => {
                setText("");
                setMovieTitle("");
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> {t.studio.clear}
            </button>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5 font-semibold">
              {t.studio.try_preset}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadPreset(p)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-brand-gold hover:text-black text-slate-300 border border-slate-700 transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.studio.movie_title_label}
              </label>
              <input
                type="text"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                placeholder={t.studio.movie_title_placeholder}
                className="w-full bg-[#1A1D27] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.studio.text_label}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder={t.studio.text_placeholder}
                className="w-full bg-[#1A1D27] border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-gold hover:bg-brand-yellow text-black shadow-lg shadow-brand-gold/20 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              {loading ? t.studio.analyzing : t.studio.run_btn}
            </button>
          </form>
        </div>

        {/* Live Results Panel */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#14171F] border border-white/10 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> {t.studio.outcome}
            </h3>
            {result && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {t.studio.polarity} {result.polarity}
              </span>
            )}
          </div>

          {result ? (
            <div className="space-y-5">
              {/* Vibe Score Card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#1E222D] to-[#171A24] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getSentimentIcon(result.sentiment_label)}
                  <div>
                    <div className="text-base font-bold text-white">
                      {translatedSentimentLabel(result.sentiment_label)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {t.studio.subjectivity} {Math.round(result.subjectivity * 100)}%
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">{t.studio.vibe_score}</div>
                  <div className="text-3xl font-black text-brand-gold">
                    {result.vibe_score}%
                  </div>
                </div>
              </div>

              {/* Natural language summary */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 italic leading-relaxed">
                "{result.summary}"
              </div>

              {/* Mood Tags */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-purple" /> {t.studio.extracted_moods}
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.mood_tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-purple/20 text-purple-300 border border-brand-purple/40"
                    >
                      {translateMood(tag, lang)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Polarity Breakdown */}
              {result.breakdown && (
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                    {t.studio.polarity_prob}
                  </span>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>{t.detail_modal.positive}: {Math.round(result.breakdown.positive * 100)}%</span>
                    <span>{t.detail_modal.neutral}: {Math.round(result.breakdown.neutral * 100)}%</span>
                    <span>{t.detail_modal.negative}: {Math.round(result.breakdown.negative * 100)}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800">
                    <div
                      style={{ width: `${result.breakdown.positive * 100}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                    />
                    <div
                      style={{ width: `${result.breakdown.neutral * 100}%` }}
                      className="bg-slate-500 transition-all duration-500"
                    />
                    <div
                      style={{ width: `${result.breakdown.negative * 100}%` }}
                      className="bg-rose-500 transition-all duration-500"
                    />
                  </div>
                </div>
              )}

              {/* Keywords Found */}
              {result.keywords?.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                    {t.studio.trigger_terms}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              {t.studio.empty_prompt}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
