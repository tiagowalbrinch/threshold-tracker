using ThresholdTracker.Application.DTOs;

namespace ThresholdTracker.Application.Services;

public interface IUserTaskStatService
{
    Task<IReadOnlyList<UserTaskStatResponse>> GetTasksAsync(
        string userId, string? name = null, string? category = null, string orderBy = "recently_played",
        DateTime? playedFrom = null, DateTime? playedTo = null, CancellationToken ct = default);
    Task<PagedResponse<TaskCatalogItemResponse>> GetCatalogAsync(
        string? name, string? category, string orderBy, int page, int pageSize, CancellationToken ct = default);
    Task<TaskCatalogItemResponse?> GetCatalogItemAsync(string aimlabsTaskId, CancellationToken ct = default);
    Task<UserTaskStatResponse> GetTaskAsync(string userId, string aimlabTaskId, CancellationToken ct = default);
    Task<UserTaskStatResponse> SetThresholdAsync(string userId, string aimlabTaskId, int value, bool autosyncEnabled = false, CancellationToken ct = default);
    Task<IReadOnlyList<LeaderboardEntryResponse>> GetLeaderboardAsync(string aimlabTaskId, DateTime? from = null, DateTime? to = null, CancellationToken ct = default);
    Task<IReadOnlyList<PlayAttemptResponse>> GetPlaysAsync(string userId, string aimlabsTaskId, DateTime? from, DateTime? to, CancellationToken ct = default);
    Task<PagedResponse<PlayAttemptResponse>> GetPlaysPagedAsync(string userId, string aimlabsTaskId, int page, int pageSize, CancellationToken ct = default);
}
