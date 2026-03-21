using ThresholdTracker.Application.DTOs;

namespace ThresholdTracker.Application.Services;

public interface IAimTaskService
{
    Task<PagedResponse<TaskResponse>> GetTasksAsync(int page, int pageSize, CancellationToken ct = default);
    Task<TaskResponse> GetTaskAsync(Guid id, CancellationToken ct = default);
    Task<TaskResponse> CreateTaskAsync(TaskCreateRequest request, string userId, CancellationToken ct = default);
    Task<TaskResponse> UpdateTaskAsync(Guid id, TaskUpdateRequest request, string userId, CancellationToken ct = default);
    Task DeleteTaskAsync(Guid id, string userId, CancellationToken ct = default);
}
