namespace ThresholdTracker.Application.DTOs;

public record MapCreateRequest(
    string Name,
    int? Record,
    int Threshold,
    int? CurrentScore
);

public record MapUpdateRequest(
    int? Record,
    int? Threshold,
    int? CurrentScore
);

public record MapResponse(
    Guid Id,
    string Name,
    int? Record,
    int Threshold,
    int? CurrentScore,
    DateTime CreatedAt,
    DateTime LastUpdated
);

