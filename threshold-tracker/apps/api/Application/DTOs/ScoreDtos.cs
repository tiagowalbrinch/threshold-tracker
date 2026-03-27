namespace ThresholdTracker.Application.DTOs;

public record PlayAttemptResponse(string TaskId, int Score, DateTime PlayedAt);

public record PagedResponse<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
