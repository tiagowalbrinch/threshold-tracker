namespace ThresholdTracker.Application.DTOs;

public record PlayAttemptResponse(
    string TaskId,
    int Score,
    DateTime PlayedAt,
    int? ThresholdAtPlay = null,
    bool? AboveThreshold = null);

public record PagedResponse<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
