using Microsoft.EntityFrameworkCore;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Repositories;
using ThresholdTracker.Infrastructure.Persistence;

namespace ThresholdTracker.Infrastructure.Repositories;

public class MapRepository : IMapRepository
{
    private readonly AppDbContext _db;

    public MapRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Map> AddAsync(Map map, CancellationToken cancellationToken = default)
    {
        _db.Maps.Add(map);
        await _db.SaveChangesAsync(cancellationToken);
        return map;
    }

    public async Task<Map?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _db.Maps
            .Include(m => m.Scores.OrderByDescending(s => s.CreatedAt).Take(1))
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Map>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Maps
            .OrderBy(m => m.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(Map map, CancellationToken cancellationToken = default)
    {
        _db.Maps.Update(map);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Map map, CancellationToken cancellationToken = default)
    {
        _db.Maps.Remove(map);
        await _db.SaveChangesAsync(cancellationToken);
    }
}

