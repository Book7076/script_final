"""Unit tests for the OOP SentimentAnalyzer service."""

from app.services.sentiment_analyzer import SentimentAnalyzer


def test_positive_text_analysis():
    """Verify that glowing movie reviews yield high positive sentiment."""
    analyzer = SentimentAnalyzer()
    text = (
        "This movie is a brilliant masterpiece! "
        "Truly extraordinary, heartwarming, and inspiring."
    )
    result = analyzer.analyze(text=text, movie_title="Test Movie")

    assert result["sentiment_label"] == "Positive"
    assert result["polarity"] > 0.3
    assert result["vibe_score"] > 65.0
    assert result["breakdown"]["positive"] > result["breakdown"]["negative"]
    assert any(
        m in result["mood_tags"]
        for m in ["Inspiring & Uplifting", "Heartwarming"]
    )


def test_negative_text_analysis():
    """Verify that highly critical reviews yield negative sentiment."""
    analyzer = SentimentAnalyzer()
    text = (
        "An atrocious, boring, and terrible disaster. "
        "A complete waste of time with awful dialogue."
    )
    result = analyzer.analyze(text=text)

    assert result["sentiment_label"] == "Negative"
    assert result["polarity"] < -0.3
    assert result["vibe_score"] < 40.0
    assert result["breakdown"]["negative"] > result["breakdown"]["positive"]


def test_neutral_and_empty_text():
    """Verify handling of empty or objective neutral text."""
    analyzer = SentimentAnalyzer()

    # Empty text
    empty_result = analyzer.analyze("")
    assert empty_result["sentiment_label"] == "Neutral"
    assert empty_result["vibe_score"] == 50.0

    # Objective neutral plot description
    neutral_text = "The committee convened at noon to review the proposed budget for the project."
    neutral_result = analyzer.analyze(neutral_text)
    assert neutral_result["sentiment_label"] == "Neutral"
    assert -0.25 <= neutral_result["polarity"] <= 0.25


def test_negation_handling():
    """Verify that negations invert the sentiment valence of following words."""
    analyzer = SentimentAnalyzer()

    # 'not good' should produce negative or neutral rather than strong positive
    positive_raw = analyzer.analyze("The acting was good and brilliant.")
    negated = analyzer.analyze("The acting was not good and never brilliant.")

    assert positive_raw["polarity"] > negated["polarity"]
    assert negated["polarity"] <= 0.0


def test_mood_tag_detection():
    """Verify atmospheric mood tag assignment based on keyword themes."""
    analyzer = SentimentAnalyzer()

    dark_crime = "A dark and gritty thriller in the corrupt criminal underworld filled with murder."
    dark_res = analyzer.analyze(dark_crime)
    assert "Dark & Gritty" in dark_res["mood_tags"]

    action = "An explosive adrenaline chase with high octane warriors in an intense mission battle."
    action_res = analyzer.analyze(action)
    assert "High Octane Action" in action_res["mood_tags"]

    mind_bending = (
        "A complex puzzle exploring dream layers, reality illusions, and subconscious twists."
    )
    mind_res = analyzer.analyze(mind_bending)
    assert "Mind-Bending & Complex" in mind_res["mood_tags"]
