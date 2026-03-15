namespace ThresholdTracker.Application.DTOs;

public record ScoreCreateRequest(int Score);

public record ScoreResponse(
    Guid Id,
    int Score,
    DateTime CreatedAt
);

