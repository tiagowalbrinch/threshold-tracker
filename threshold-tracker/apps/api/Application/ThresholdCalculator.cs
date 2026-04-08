namespace ThresholdTracker.Application;

public static class ThresholdCalculator
{
    // How many of the most recent plays to consider.
    // Older sessions are ignored — we only care about current form.
    private const int WindowSize = 10;

    // Minimum number of plays required to produce a threshold.
    // Below this we don't have enough data to make a meaningful calculation.
    private const int MinScores = 5;

    // The lowest stdDev we allow after filtering.
    // If all scores are nearly identical, stdDev would be ~0 and the threshold
    // would equal the mean — no challenge at all. This floor guarantees at least
    // a 5% nudge above the mean even for a perfectly consistent player.
    private const double MinStdDev = 0.05;

    // The threshold is capped at 95% of the best score in the filtered window.
    // This prevents a single exceptional run from setting an unreachable target.
    private const double BestScoreCap = 0.95;

    // Dynamic sigma cutoff range.
    // When the player is consistent (low spread), the cutoff is tight (1.5σ) —
    // even a "nearly outlier" exceptional run gets removed so it doesn't inflate
    // the mean and make the threshold unreachable.
    // When the player is naturally inconsistent (high spread), the cutoff is
    // looser (2.5σ) — their wide variance is real, not noise.
    private const double SigmaMin = 1.5;
    private const double SigmaMax = 2.5;

    // The CV (coefficient of variation = σ/mean) value at which the cutoff
    // reaches SigmaMax. Players with CV >= this are considered "high spread".
    private const double CvAtSigmaMax = 0.15;

    public static int? Calculate(IList<int> allScores)
    {
        if (allScores.Count < MinScores) return null;

        // ── Step 1: Take the most recent window ──────────────────────────────
        // We only look at the last N plays so the threshold reflects current
        // form, not ancient history.
        var scores = allScores.TakeLast(WindowSize).Select(s => (double)s).ToList();

        // ── Step 2: Normalize scores around 1.0 ──────────────────────────────
        // Dividing each score by the mean maps every score to a value near 1.0.
        // This makes the spread measurement scale-independent: a task scored in
        // the hundreds and one scored in the thousands are treated the same way.
        var mean = scores.Average();
        var normalized = scores.Select(s => s / mean).ToList();

        // ── Step 3: Measure the spread of the normalized window ───────────────
        // normSd is the standard deviation of the normalized scores.
        // Because the scores are normalized, normSd == CV (σ / mean):
        //   low normSd (~0.05) → very consistent player
        //   high normSd (~0.15+) → naturally inconsistent player
        var normSd = CalculateStandardDeviation(normalized);

        // ── Step 4: Compute the dynamic sigma cutoff ─────────────────────────
        // The cutoff scales linearly with the player's natural spread:
        //   normSd = 0.00  →  cutoff = 1.5  (tight: removes nearly-outlier peaks)
        //   normSd = 0.075 →  cutoff = 2.0  (moderate)
        //   normSd ≥ 0.15  →  cutoff = 2.5  (loose: respects wide natural variance)
        // This prevents a lucky exceptional run from inflating the mean and
        // making the threshold feel unreachable on a consistent player.
        var sigmaCutoff = normSd > 0
            ? Math.Clamp(SigmaMin + normSd / CvAtSigmaMax, SigmaMin, SigmaMax)
            : SigmaMin;

        // ── Step 5: Remove outliers ───────────────────────────────────────────
        // A score is an outlier if its z-score on the normalized scale exceeds
        // the cutoff. The z-score measures "how many σ away from 1.0 is this
        // normalized score?" — same as how many σ from the mean on the raw scale.
        // Math.Abs covers both directions: bad runs (below) and lucky peaks (above).
        var filtered = normSd > 0
            ? scores.Where((s, i) => Math.Abs(normalized[i] - 1.0) / normSd <= sigmaCutoff).ToList()
            : scores;

        // ── Step 6: Recalculate mean and stdDev on the clean set ──────────────
        // Now that outliers are gone, the mean and spread reflect the player's
        // honest, repeatable performance level.
        mean = filtered.Average();
        var filteredNormalized = filtered.Select(s => s / mean).ToList();
        var stdDev = CalculateStandardDeviation(filteredNormalized);

        // ── Step 7: Apply the minimum stdDev floor ────────────────────────────
        // Prevents a zero-challenge threshold for perfectly consistent players.
        if (stdDev < MinStdDev) stdDev = MinStdDev;

        // ── Step 8: Calculate the target ──────────────────────────────────────
        // The target is the mean scaled up by the player's spread.
        // A consistent player (low stdDev) gets a small nudge above their mean.
        // An inconsistent player (high stdDev) gets a bigger push — they've
        // already shown they can hit higher, just not reliably yet.
        var threshold = mean * (1 + stdDev);

        // ── Step 9: Cap at 95% of the best score in the filtered window ───────
        // Even after outlier removal, the target should never exceed a value
        // the player has demonstrably reached in recent clean sessions.
        var cap = filtered.Max() * BestScoreCap;
        threshold = Math.Min(threshold, cap);

        return (int)Math.Round(threshold);
    }

    private static double CalculateStandardDeviation(IList<double> values)
    {
        var mean = values.Average();
        var variance = values.Average(v => Math.Pow(v - mean, 2));
        return Math.Sqrt(variance);
    }
}
