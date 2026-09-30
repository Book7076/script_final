"""OOP Service for sentiment analysis and movie atmosphere/vibe evaluation."""

import math
import re
from typing import Any, Dict, List, Optional, Set, Tuple


class SentimentAnalyzer:
    """Evaluates movie synopses and user reviews to produce sentiment and mood vibes."""

    # Core sentiment lexicons with intensity weights
    POSITIVE_WORDS: Dict[str, float] = {
        "masterpiece": 3.0,
        "brilliant": 2.8,
        "extraordinary": 2.7,
        "superb": 2.6,
        "outstanding": 2.5,
        "phenomenal": 2.6,
        "breathtaking": 2.5,
        "fantastic": 2.4,
        "wonderful": 2.3,
        "excellent": 2.4,
        "amazing": 2.2,
        "magnificent": 2.4,
        "captivating": 2.2,
        "stunning": 2.3,
        "compelling": 2.0,
        "great": 1.8,
        "love": 2.0,
        "loved": 2.0,
        "favorite": 2.1,
        "uplifting": 2.2,
        "heartwarming": 2.4,
        "inspiring": 2.3,
        "charming": 2.0,
        "enjoyable": 1.8,
        "delightful": 2.0,
        "funny": 1.9,
        "hilarious": 2.3,
        "touching": 2.0,
        "exciting": 2.1,
        "thrilling": 2.2,
        "triumph": 2.3,
        "triumphant": 2.3,
        "heroic": 2.0,
        "good": 1.3,
        "clever": 1.7,
        "vibrant": 1.8,
        "beautiful": 2.0,
        "joy": 2.0,
        "hope": 1.9,
        "hopeful": 2.0,
        "impressive": 2.0,
        "solid": 1.4,
        "entertaining": 1.8,
        "fun": 1.6,
        "pleasant": 1.5,
        "sweet": 1.7,
    }

    NEGATIVE_WORDS: Dict[str, float] = {
        "disaster": 3.0,
        "terrible": 2.8,
        "horrible": 2.8,
        "awful": 2.7,
        "atrocious": 2.9,
        "garbage": 2.8,
        "dreadful": 2.6,
        "boring": 2.4,
        "dull": 2.2,
        "waste": 2.5,
        "pathetic": 2.5,
        "ridiculous": 2.2,
        "disappointing": 2.4,
        "disappointment": 2.5,
        "shallow": 1.9,
        "cliche": 2.0,
        "cliched": 2.0,
        "mess": 2.2,
        "uninspired": 2.1,
        "poor": 2.0,
        "bad": 1.8,
        "hate": 2.5,
        "hated": 2.5,
        "depressing": 2.1,
        "bleak": 1.8,
        "painful": 2.3,
        "annoying": 2.0,
        "tedious": 2.2,
        "pointless": 2.3,
        "ugly": 2.0,
        "confusing": 1.6,
        "slow": 1.3,
        "mediocre": 1.9,
        "weak": 1.8,
        "tragic": 1.7,
        "tragedy": 1.8,
        "brutal": 1.8,
        "violent": 1.7,
        "corrupt": 1.8,
        "evil": 2.2,
        "sinister": 2.0,
        "nightmare": 2.3,
        "failure": 2.4,
    }

    NEGATIONS: Set[str] = {
        "not",
        "never",
        "no",
        "hardly",
        "barely",
        "scarcely",
        "neither",
        "nor",
        "cannot",
        "cant",
        "can't",
        "dont",
        "don't",
        "wont",
        "won't",
        "isnt",
        "isn't",
    }

    BOOSTERS: Dict[str, float] = {
        "very": 1.5,
        "extremely": 1.8,
        "incredibly": 1.7,
        "truly": 1.4,
        "absolutely": 1.6,
        "completely": 1.5,
        "so": 1.3,
        "really": 1.4,
        "exceptionally": 1.6,
        "deeply": 1.5,
        "somewhat": 0.7,
        "slightly": 0.6,
        "little": 0.5,
        "barely": 0.3,
    }

    MOOD_PATTERNS: Dict[str, List[str]] = {
        "Inspiring & Uplifting": [
            "inspire", "inspiring", "uplifting", "hope", "dream", "triumph",
            "victory", "courage", "overcome", "hero", "destiny", "empower"
        ],
        "Heartwarming": [
            "heartwarming", "love", "family", "friend", "friendship", "bond",
            "sweet", "charming", "gentle", "touching", "affection", "kindness"
        ],
        "Dark & Gritty": [
            "dark", "gritty", "crime", "corrupt", "underworld", "ruthless",
            "brutal", "murder", "noir", "vengeance", "gang", "decay"
        ],
        "Tense & Suspenseful": [
            "tense", "suspense", "thriller", "danger", "trapped", "mystery",
            "paranoia", "survival", "ticking", "escape", "terror", "threat"
        ],
        "Melancholic & Emotional": [
            "sad", "tear", "loss", "grief", "mourn", "melancholy", "tragic",
            "heartbreak", "farewell", "solitude", "lonely", "sorrow"
        ],
        "Mind-Bending & Complex": [
            "mind-bending", "complex", "reality", "dream", "illusion", "time",
            "puzzle", "subconscious", "dimension", "twist", "paradox", "psychological"
        ],
        "High Octane Action": [
            "explosion", "chase", "battle", "fight", "warrior", "agent",
            "mission", "strike", "combat", "adrenaline", "assassin", "survival"
        ],
        "Lighthearted & Fun": [
            "comedy", "funny", "laugh", "hilarious", "humor", "adventure",
            "playful", "witty", "quirky", "cheerful", "amusing", "whimsical"
        ],
    }

    def analyze(self, text: str, movie_title: Optional[str] = None) -> Dict[str, Any]:
        """วิเคราะห์อารมณ์และบรรยากาศ (Sentiment & Atmosphere Vibe Analysis).

        [Data Flow การทำงาน]:
        1. รับข้อความ (text) มาจาก movies.py (overview หรือ review) หรือ sentiment.py
        2. Tokenization: ตัดคำออกเป็นคำย่อยและแปลงเป็นพิมพ์เล็ก (_tokenize)
        3. คำนวณคะแนนเชิงบวก/ลบ (_compute_scores) โดยคำนึงถึงคำปฏิเสธ (Negations เช่น 'not good')
           และคำขยายน้ำหนัก (Boosters เช่น 'extremely brilliant')
        4. ปรับช่วงคะแนน Polarity ให้อยู่ในช่วง [-1.0, 1.0] ด้วยฟังก์ชัน Hyperbolic Tangent
        5. แปลงเป็น Vibe Score ในสเกลร้อยละ 0% - 100%
        6. จำแนกประเภทอารมณ์หลัก (Positive / Neutral / Negative)
        7. ตรวจจับ Mood Tags ตามกลุ่มคำที่ปรากฏ (_detect_mood_tags)
        8. คำนวณสัดส่วนความน่าจะเป็น (breakdown: positive, neutral, negative)
        9. สรุปผลลัพธ์เป็นประโยคคำอธิบาย (_generate_summary) แล้วส่งกลับไปให้ Route
        """
        if not text or not text.strip():
            return self._default_result("No text provided for analysis.")

        clean_text = text.strip()
        tokens = self._tokenize(clean_text)

        if not tokens:
            return self._default_result("Text contains no recognizable words.")

        # คำนวณคะแนนบวก/ลบ และเก็บคำคีย์เวิร์ดบอกอารมณ์
        pos_score, neg_score, keywords = self._compute_scores(tokens)

        # คำนวณค่าความเป็นขั้วอารมณ์ (Polarity: -1.0 คือลบสุด, +1.0 คือบวกสุด)
        total_valence = pos_score - neg_score
        polarity = self._normalize_polarity(total_valence, len(tokens))

        # สเกลค่า Vibe Score ให้อยู่ระหว่าง 0% ถึง 100% สำหรับแสดงผลใน UI
        vibe_score = round(((polarity + 1.0) / 2.0) * 100.0, 1)

        # จำแนกประเภทอารมณ์ (Sentiment Label)
        if polarity >= 0.15:
            sentiment_label = "Positive"
        elif polarity <= -0.15:
            sentiment_label = "Negative"
        else:
            sentiment_label = "Neutral"

        # คำนวณค่าความเป็นอัตวิสัย (Subjectivity: 0.0 ข้อเท็จจริงล้วน - 1.0 อารมณ์ความรู้สึกล้วน)
        subjective_words_count = len(keywords)
        subjectivity = min(1.0, round(subjective_words_count / max(1, len(tokens) * 0.4), 2))

        # ตรวจจับ Mood Tags เฉพาะกลุ่ม เช่น 'Inspiring & Uplifting', 'Dark & Gritty'
        mood_tags = self._detect_mood_tags(clean_text, tokens, polarity)

        # คำนวณอัตราส่วนการกระจายตัว (Positive %, Neutral %, Negative %)
        breakdown = self._calculate_breakdown(polarity, pos_score, neg_score)

        # สร้างประโยคสรุปบรรยากาศแบบอ่านเข้าใจง่าย
        summary = self._generate_summary(
            sentiment_label=sentiment_label,
            vibe_score=vibe_score,
            mood_tags=mood_tags,
            movie_title=movie_title,
        )

        return {
            "polarity": round(polarity, 3),
            "vibe_score": vibe_score,
            "sentiment_label": sentiment_label,
            "subjectivity": subjectivity,
            "mood_tags": mood_tags,
            "keywords": keywords[:10],
            "summary": summary,
            "breakdown": breakdown,
        }

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into lowercase words."""
        return re.findall(r"\b[a-zA-Z']+\b", text.lower())

    def _compute_scores(self, tokens: List[str]) -> Tuple[float, float, List[str]]:
        """Calculate positive and negative valence scores considering negations and boosters."""
        pos_total = 0.0
        neg_total = 0.0
        found_keywords: List[str] = []

        for i, token in enumerate(tokens):
            # Check window of 2 words prior for negation or boosters
            window = tokens[max(0, i - 2): i]
            is_negated = any(w in self.NEGATIONS for w in window)
            booster_multiplier = 1.0
            for w in window:
                if w in self.BOOSTERS:
                    booster_multiplier *= self.BOOSTERS[w]

            if token in self.POSITIVE_WORDS:
                weight = self.POSITIVE_WORDS[token] * booster_multiplier
                if is_negated:
                    neg_total += weight * 0.8
                    found_keywords.append(f"not {token}")
                else:
                    pos_total += weight
                    found_keywords.append(token)

            elif token in self.NEGATIVE_WORDS:
                weight = self.NEGATIVE_WORDS[token] * booster_multiplier
                if is_negated:
                    pos_total += weight * 0.8
                    found_keywords.append(f"not {token}")
                else:
                    neg_total += weight
                    found_keywords.append(token)

        return pos_total, neg_total, list(dict.fromkeys(found_keywords))

    def _normalize_polarity(self, valence: float, token_count: int) -> float:
        """Apply hyperbolic tangent normalization for bounded polarity [-1, 1]."""
        if token_count == 0:
            return 0.0
        # Normalization factor scaled by text length
        alpha = 3.0 + math.log1p(token_count)
        return float(math.tanh(valence / alpha))

    def _calculate_breakdown(
        self, polarity: float, pos_score: float, neg_score: float
    ) -> Dict[str, float]:
        """Compute relative percentage breakdown between positive, neutral, negative."""
        total = pos_score + neg_score
        if total == 0:
            return {"positive": 0.2, "neutral": 0.6, "negative": 0.2}

        pos_ratio = pos_score / total
        neg_ratio = neg_score / total
        neutral_ratio = max(0.1, 1.0 - (pos_ratio + neg_ratio) * 0.7)

        # Re-normalize to sum to 1.0
        denom = pos_ratio + neg_ratio + neutral_ratio
        return {
            "positive": round(pos_ratio / denom, 3),
            "neutral": round(neutral_ratio / denom, 3),
            "negative": round(neg_ratio / denom, 3),
        }

    def _detect_mood_tags(
        self, text: str, tokens: List[str], polarity: float
    ) -> List[str]:
        """Identify matching atmospheric mood tags from content and polarity."""
        text_lower = text.lower()
        matched_moods: List[Tuple[str, int]] = []

        for mood, patterns in self.MOOD_PATTERNS.items():
            count = 0
            for pattern in patterns:
                if " " in pattern:
                    if pattern in text_lower:
                        count += 2
                else:
                    if pattern in tokens:
                        count += 1
            if count > 0:
                matched_moods.append((mood, count))

        # Sort moods by match frequency
        matched_moods.sort(key=lambda x: x[1], reverse=True)
        selected_moods = [m[0] for m in matched_moods[:3]]

        # If no explicit mood keywords found, provide default based on polarity
        if not selected_moods:
            if polarity >= 0.25:
                selected_moods = ["Inspiring & Uplifting", "Lighthearted & Fun"]
            elif polarity <= -0.25:
                selected_moods = ["Dark & Gritty", "Tense & Suspenseful"]
            else:
                selected_moods = ["Thought-Provoking", "Neutral Drama"]

        return selected_moods

    def _generate_summary(
        self,
        sentiment_label: str,
        vibe_score: float,
        mood_tags: List[str],
        movie_title: Optional[str] = None,
    ) -> str:
        """Create a human-readable summary sentence of the atmosphere."""
        prefix = f"For '{movie_title}', " if movie_title else ""
        lead = "the" if prefix else "The"
        mood_str = " & ".join(mood_tags[:2]) if mood_tags else "intriguing"

        if sentiment_label == "Positive":
            return (
                f"{prefix}{lead} narrative evokes an uplifting and vibrant vibe "
                f"({vibe_score}%), highlighted by {mood_str} themes."
            )
        elif sentiment_label == "Negative":
            return (
                f"{prefix}{lead} atmosphere leans dark, gritty, or melancholic "
                f"({vibe_score}%), characterized by {mood_str} tones."
            )
        else:
            return (
                f"{prefix}{lead} mood maintains a balanced, contemplative tone "
                f"({vibe_score}%), emphasizing {mood_str} elements."
            )

    def _default_result(self, reason: str) -> Dict[str, Any]:
        """Return neutral fallback when text is invalid."""
        return {
            "polarity": 0.0,
            "vibe_score": 50.0,
            "sentiment_label": "Neutral",
            "subjectivity": 0.0,
            "mood_tags": ["Neutral"],
            "keywords": [],
            "summary": reason,
            "breakdown": {"positive": 0.2, "neutral": 0.6, "negative": 0.2},
        }
