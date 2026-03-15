namespace ThresholdTracker.Domain.ValueObjects;

public record MapStats(
    Guid MapId,
    string Name,
    int? Record,
    int Threshold,
    int? CurrentScore,
    DateTime LastUpdated
);

