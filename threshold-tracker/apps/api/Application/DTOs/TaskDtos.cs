namespace ThresholdTracker.Application.DTOs;

public record TaskCreateRequest(string Name, string Category, int? Threshold, int? PersonalBest, string? Notes);
public record TaskUpdateRequest(string? Category, int? Threshold, int? PersonalBest, string? Notes);
public record TaskResponse(Guid Id, string Name, string Category, int? Threshold, int? PersonalBest, string? Notes, DateTime CreatedDate, string CreatedByUserId);
public record PagedResponse<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize, bool HasNextPage);
