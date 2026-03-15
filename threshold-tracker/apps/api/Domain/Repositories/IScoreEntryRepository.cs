using ThresholdTracker.Domain.Entities;

namespace ThresholdTracker.Domain.Repositories;

public interface IScoreEntryRepository
{
    Task<ScoreEntry> AddAsync(ScoreEntry entry, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ScoreEntry>> GetByMapIdAsync(Guid mapId, CancellationToken cancellationToken = default);
}

