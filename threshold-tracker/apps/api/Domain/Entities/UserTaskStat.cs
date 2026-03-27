namespace ThresholdTracker.Domain.Entities;

public class UserTaskStat
{
    public string AimlabsUsername { get; set; } = string.Empty;
    public string AimlabsTaskId { get; set; } = string.Empty;
    public string TaskName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int? PersonalBest { get; set; }
    public int PlayCount { get; set; }
    public double? AvgScore { get; set; }
    public DateTime? LastPlayedAt { get; set; }
    public DateTime SyncedAt { get; set; }
}
