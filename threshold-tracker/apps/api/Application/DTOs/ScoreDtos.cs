namespace ThresholdTracker.Application.DTOs;

public record ScoreCreateRequest(Guid TaskId, int Value, string? Sensitivity, float? Fov, int? Dpi, string? Notes);
public record ScoreResponse(Guid Id, Guid TaskId, int Value, bool IsPb, string? Sensitivity, float? Fov, int? Dpi, string? Notes, DateTime CreatedDate, string UserId);

