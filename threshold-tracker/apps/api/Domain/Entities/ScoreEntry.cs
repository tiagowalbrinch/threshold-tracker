namespace ThresholdTracker.Domain.Entities;

public class ScoreEntry
{
    public Guid Id { get; set; }
    public Guid MapId { get; set; }
    public Map Map { get; set; } = null!;

    public int Score { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

