namespace ThresholdTracker.Domain.Entities;

public class ScoreAttempt
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public AimTask Task { get; set; } = null!;
    public int Value { get; set; }
    public bool IsPb { get; set; }
    public string? Sensitivity { get; set; }
    public float? Fov { get; set; }
    public int? Dpi { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedDate { get; set; }
    public string UserId { get; set; } = string.Empty;
}
