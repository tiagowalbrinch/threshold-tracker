using Microsoft.EntityFrameworkCore;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Repositories;
using ThresholdTracker.Infrastructure.Persistence;

namespace ThresholdTracker.Infrastructure.Repositories;

public class ScoreEntryRepository : IScoreEntryRepository
{
    private readonly AppDbContext _db;

    public ScoreEntryRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ScoreEntry> AddAsync(ScoreEntry entry, CancellationToken cancellationToken = default)
    {
        _db.ScoreEntries.Add(entry);
        await _db.SaveChangesAsync(cancellationToken);
        return entry;
    }

    public async Task<IReadOnlyList<ScoreEntry>> GetByMapIdAsync(Guid mapId, CancellationToken cancellationToken = default)
    {
        return await _db.ScoreEntries
            .Where(s => s.MapId == mapId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}

