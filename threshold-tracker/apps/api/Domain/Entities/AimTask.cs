using ThresholdTracker.Domain.Enums;

namespace ThresholdTracker.Domain.Entities;

public class AimTask
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TaskCategory Category { get; set; } = TaskCategory.Other;
    public int? Threshold { get; set; }
    public int? PersonalBest { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedDate { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public ICollection<ScoreAttempt> Scores { get; set; } = [];
}
