namespace ThresholdTracker.Domain.Entities;

public class AimTask
{
    public string AimlabsTaskId { get; set; } = default!;
    public string TaskName { get; set; } = default!;
    public string Category { get; set; } = default!;
    public DateTime FirstSeenAt { get; set; }
}
