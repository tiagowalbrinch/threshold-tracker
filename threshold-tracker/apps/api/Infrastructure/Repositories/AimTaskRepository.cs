using Microsoft.EntityFrameworkCore;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Repositories;
using ThresholdTracker.Infrastructure.Persistence;

namespace ThresholdTracker.Infrastructure.Repositories;

public class AimTaskRepository(AppDbContext db) : IAimTaskRepository
{
    public async Task<(IReadOnlyList<AimTask> Items, int TotalCount)> GetAllAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var query = db.Tasks.OrderByDescending(t => t.CreatedDate);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public Task<AimTask?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Tasks.FirstOrDefaultAsync(t => t.Id == id, ct);

    public Task<AimTask?> GetByNameAsync(string name, CancellationToken ct = default) =>
        db.Tasks.FirstOrDefaultAsync(t => t.Name == name, ct);

    public async Task<AimTask> AddAsync(AimTask task, CancellationToken ct = default)
    {
        db.Tasks.Add(task);
        await db.SaveChangesAsync(ct);
        return task;
    }

    public async Task UpdateAsync(AimTask task, CancellationToken ct = default)
    {
        await db.Tasks
            .Where(t => t.Id == task.Id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.Category, task.Category)
                .SetProperty(t => t.Threshold, task.Threshold)
                .SetProperty(t => t.PersonalBest, task.PersonalBest)
                .SetProperty(t => t.Notes, task.Notes), ct);
    }

    public async Task DeleteAsync(AimTask task, CancellationToken ct = default)
    {
        await db.Tasks.Where(t => t.Id == task.Id).ExecuteDeleteAsync(ct);
    }
}
