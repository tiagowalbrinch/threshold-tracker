using Microsoft.EntityFrameworkCore;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Repositories;
using ThresholdTracker.Infrastructure.Persistence;

namespace ThresholdTracker.Infrastructure.Repositories;

public class ScoreAttemptRepository(AppDbContext db) : IScoreAttemptRepository
{
    public async Task<IReadOnlyList<ScoreAttempt>> GetByTaskIdAsync(Guid taskId, CancellationToken ct = default) =>
        await db.ScoreAttempts.Where(s => s.TaskId == taskId).OrderByDescending(s => s.CreatedDate).ToListAsync(ct);

    public async Task<IReadOnlyList<ScoreAttempt>> GetByTaskAndUserAsync(Guid taskId, string userId, CancellationToken ct = default) =>
        await db.ScoreAttempts.Where(s => s.TaskId == taskId && s.UserId == userId).OrderByDescending(s => s.CreatedDate).ToListAsync(ct);

    public Task<ScoreAttempt?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.ScoreAttempts.FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<ScoreAttempt> AddAsync(ScoreAttempt entry, CancellationToken ct = default)
    {
        db.ScoreAttempts.Add(entry);
        await db.SaveChangesAsync(ct);
        return entry;
    }

    public async Task DeleteAsync(ScoreAttempt entry, CancellationToken ct = default)
    {
        await db.ScoreAttempts.Where(s => s.Id == entry.Id).ExecuteDeleteAsync(ct);
    }
}
