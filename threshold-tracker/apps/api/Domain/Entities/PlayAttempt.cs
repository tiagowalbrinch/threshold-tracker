namespace ThresholdTracker.Domain.Entities;

public class PlayAttempt
{
    public string AimlabsUsername { get; set; } = string.Empty;
    public string AimlabsTaskId { get; set; } = string.Empty;
    public int Score { get; set; }
    public DateTime PlayedAt { get; set; }
    public int? ThresholdAtPlay { get; set; }
    public bool? AboveThreshold { get; set; }
}
