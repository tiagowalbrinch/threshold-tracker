using ThresholdTracker.Domain.ValueObjects;

namespace ThresholdTracker.Domain.Entities;

public class Map
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? Record { get; set; }
    public int Threshold { get; set; }
    public int? CurrentScore { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public ICollection<ScoreEntry> Scores { get; set; } = new List<ScoreEntry>();

    public MapStats ToStats() =>
        new(
            MapId: Id,
            Name: Name,
            Record: Record,
            Threshold: Threshold,
            CurrentScore: CurrentScore,
            LastUpdated: LastUpdated
        );

    public void ApplyNewScore(int score)
    {
        CurrentScore = score;
        if (!Record.HasValue || score > Record.Value)
        {
            Record = score;
        }

        LastUpdated = DateTime.UtcNow;
    }
}

