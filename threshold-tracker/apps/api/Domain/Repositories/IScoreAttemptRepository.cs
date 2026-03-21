using ThresholdTracker.Domain.Entities;

namespace ThresholdTracker.Domain.Repositories;

public interface IScoreAttemptRepository
{
    Task<IReadOnlyList<ScoreAttempt>> GetByTaskIdAsync(Guid taskId, CancellationToken ct = default);
    Task<IReadOnlyList<ScoreAttempt>> GetByTaskAndUserAsync(Guid taskId, string userId, CancellationToken ct = default);
    Task<ScoreAttempt?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ScoreAttempt> AddAsync(ScoreAttempt entry, CancellationToken ct = default);
    Task DeleteAsync(ScoreAttempt entry, CancellationToken ct = default);
}
