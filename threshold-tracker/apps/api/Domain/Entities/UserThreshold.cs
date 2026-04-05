namespace ThresholdTracker.Domain.Entities;

public class UserThreshold
{
    public string UserId { get; set; } = default!;
    public string AimlabsTaskId { get; set; } = default!;
    public int ThresholdValue { get; set; }
    public bool AutosyncEnabled { get; set; } = false;
    public DateTime? LastCalculatedAt { get; set; }
}
