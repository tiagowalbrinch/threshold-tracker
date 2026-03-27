using ThresholdTracker.Application.DTOs;

namespace ThresholdTracker.Application.Services;

public interface ISyncService
{
    Task<IReadOnlyList<UserTaskStatResponse>> SyncAsync(string userId, CancellationToken ct = default);
    Task<int> SyncPlaysAsync(string userId, string aimlabsTaskId, CancellationToken ct = default);
    Task<UserTaskStatResponse> SyncTaskAsync(string userId, string aimlabsTaskId, CancellationToken ct = default);
}
