using ThresholdTracker.Domain.Entities;

namespace ThresholdTracker.Domain.Repositories;

public interface IMapRepository
{
    Task<Map> AddAsync(Map map, CancellationToken cancellationToken = default);
    Task<Map?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Map>> GetAllAsync(CancellationToken cancellationToken = default);
    Task UpdateAsync(Map map, CancellationToken cancellationToken = default);
    Task DeleteAsync(Map map, CancellationToken cancellationToken = default);
}

