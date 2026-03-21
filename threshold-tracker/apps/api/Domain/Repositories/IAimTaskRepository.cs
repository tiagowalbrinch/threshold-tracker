using ThresholdTracker.Domain.Entities;

namespace ThresholdTracker.Domain.Repositories;

public interface IAimTaskRepository
{
    Task<(IReadOnlyList<AimTask> Items, int TotalCount)> GetAllAsync(int page, int pageSize, CancellationToken ct = default);
    Task<AimTask?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AimTask?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<AimTask> AddAsync(AimTask task, CancellationToken ct = default);
    Task UpdateAsync(AimTask task, CancellationToken ct = default);
    Task DeleteAsync(AimTask task, CancellationToken ct = default);
}
