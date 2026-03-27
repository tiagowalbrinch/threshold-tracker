using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Identity;
using ThresholdTracker.Infrastructure.Persistence;

namespace ThresholdTracker.Application.Services;

public class UserTaskStatService(AppDbContext db, UserManager<ApplicationUser> userManager) : IUserTaskStatService
{
    public async Task<IReadOnlyList<UserTaskStatResponse>> GetTasksAsync(
        string userId, string? name = null, string? category = null, string orderBy = "recently_played",
        DateTime? playedFrom = null, DateTime? playedTo = null, CancellationToken ct = default)
    {
        var aimlabsUsername = await GetAimlabsUsernameAsync(userId, ct);

        var query = db.UserTaskStats.Where(s => s.AimlabsUsername == aimlabsUsername);

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(s => s.TaskName.ToLower().Contains(name.ToLower()));
        if (!string.IsNullOrWhiteSpace(category) && category != "all")
            query = query.Where(s => s.Category == category);
        if (playedFrom.HasValue)
            query = query.Where(s => s.LastPlayedAt >= DateTime.SpecifyKind(playedFrom.Value, DateTimeKind.Utc));
        if (playedTo.HasValue)
            query = query.Where(s => s.LastPlayedAt <= DateTime.SpecifyKind(playedTo.Value, DateTimeKind.Utc));

        query = orderBy switch
        {
            "most_played" => query.OrderByDescending(s => s.PlayCount),
            "position_in_rank" => query.OrderBy(s =>
                db.UserTaskStats.Count(s2 => s2.AimlabsTaskId == s.AimlabsTaskId
                    && s2.PersonalBest > s.PersonalBest)),
            _ => query.OrderByDescending(s => s.LastPlayedAt)
        };

        var stats = await query.ToListAsync(ct);

        var taskIds = stats.Select(s => s.AimlabsTaskId).ToList();

        var last5Avgs = await db.PlayAttempts
            .Where(p => p.AimlabsUsername == aimlabsUsername)
            .GroupBy(p => p.AimlabsTaskId)
            .Select(g => new
            {
                TaskId = g.Key,
                Last5Avg = (double?)g.OrderByDescending(p => p.PlayedAt).Take(5).Average(p => (double)p.Score)
            })
            .ToDictionaryAsync(x => x.TaskId, x => x.Last5Avg, ct);

        var thresholds = await db.UserThresholds
            .Where(t => t.UserId == userId && taskIds.Contains(t.AimlabsTaskId))
            .ToDictionaryAsync(t => t.AimlabsTaskId, t => t.ThresholdValue, ct);

        return stats.Select(s => ToResponse(s, last5Avgs.GetValueOrDefault(s.AimlabsTaskId),
            thresholds.TryGetValue(s.AimlabsTaskId, out var tv) ? tv : (int?)null)).ToList();
    }

    public async Task<PagedResponse<TaskCatalogItemResponse>> GetCatalogAsync(
        string? name, string? category, string orderBy,
        int page, int pageSize, CancellationToken ct = default)
    {
        pageSize = Math.Clamp(pageSize, 1, 50);
        page = Math.Max(1, page);

        var query = db.AimTasks.AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(t => t.TaskName.ToLower().Contains(name.ToLower()));
        if (!string.IsNullOrWhiteSpace(category) && category != "all")
            query = query.Where(t => t.Category == category);

        query = orderBy switch
        {
            "most_played" => query.OrderByDescending(t =>
                db.UserTaskStats.Where(s => s.AimlabsTaskId == t.AimlabsTaskId).Sum(s => (long?)s.PlayCount)),
            _ => query.OrderByDescending(t =>
                db.UserTaskStats.Where(s => s.AimlabsTaskId == t.AimlabsTaskId).Max(s => (DateTime?)s.LastPlayedAt))
        };

        var total = await query.CountAsync(ct);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TaskCatalogItemResponse(
                t.AimlabsTaskId,
                t.TaskName,
                t.Category,
                db.UserTaskStats
                    .Where(s => s.AimlabsTaskId == t.AimlabsTaskId && s.PersonalBest != null)
                    .OrderByDescending(s => s.PersonalBest)
                    .Select(s => s.AimlabsUsername)
                    .FirstOrDefault(),
                db.UserTaskStats
                    .Where(s => s.AimlabsTaskId == t.AimlabsTaskId && s.AvgScore != null)
                    .Average(s => (double?)s.AvgScore),
                db.UserTaskStats
                    .Where(s => s.AimlabsTaskId == t.AimlabsTaskId)
                    .Max(s => (int?)s.PersonalBest),
                db.UserTaskStats.Count(s => s.AimlabsTaskId == t.AimlabsTaskId),
                (int)(db.UserTaskStats
                    .Where(s => s.AimlabsTaskId == t.AimlabsTaskId)
                    .Sum(s => (long?)s.PlayCount) ?? 0),
                db.UserTaskStats
                    .Where(s => s.AimlabsTaskId == t.AimlabsTaskId)
                    .Max(s => (DateTime?)s.LastPlayedAt)
            ))
            .ToListAsync(ct);

        return new PagedResponse<TaskCatalogItemResponse>(items, total, page, pageSize);
    }

    public async Task<UserTaskStatResponse> GetTaskAsync(string userId, string aimlabTaskId, CancellationToken ct = default)
    {
        var aimlabsUsername = await GetAimlabsUsernameAsync(userId, ct);

        var stat = await db.UserTaskStats
            .FirstOrDefaultAsync(s => s.AimlabsUsername == aimlabsUsername && s.AimlabsTaskId == aimlabTaskId, ct)
            ?? throw new KeyNotFoundException($"Task '{aimlabTaskId}' not found for this user.");

        var threshold = await db.UserThresholds
            .Where(t => t.UserId == userId && t.AimlabsTaskId == aimlabTaskId)
            .Select(t => (int?)t.ThresholdValue)
            .FirstOrDefaultAsync(ct);

        return ToResponse(stat, thresholdValue: threshold);
    }

    public async Task<UserTaskStatResponse> SetThresholdAsync(string userId, string aimlabTaskId, int value, CancellationToken ct = default)
    {
        var existing = await db.UserThresholds
            .FirstOrDefaultAsync(t => t.UserId == userId && t.AimlabsTaskId == aimlabTaskId, ct);

        if (existing is null)
        {
            db.UserThresholds.Add(new UserThreshold
            {
                UserId = userId,
                AimlabsTaskId = aimlabTaskId,
                ThresholdValue = value
            });
            await db.SaveChangesAsync(ct);
        }
        else
        {
            await db.UserThresholds
                .Where(t => t.UserId == userId && t.AimlabsTaskId == aimlabTaskId)
                .ExecuteUpdateAsync(t => t.SetProperty(x => x.ThresholdValue, value), ct);
        }

        // Try to load the stat to build a full response
        var aimlabsUsername = (await userManager.FindByIdAsync(userId))?.AimlabsUsername;
        UserTaskStat? stat = null;
        if (!string.IsNullOrWhiteSpace(aimlabsUsername))
        {
            stat = await db.UserTaskStats
                .FirstOrDefaultAsync(s => s.AimlabsUsername == aimlabsUsername && s.AimlabsTaskId == aimlabTaskId, ct);
        }

        return stat is not null
            ? ToResponse(stat, thresholdValue: value)
            : new UserTaskStatResponse(aimlabTaskId, aimlabTaskId, "other", null, 0, null, null, value, DateTime.UtcNow, null);
    }

    public async Task<IReadOnlyList<LeaderboardEntryResponse>> GetLeaderboardAsync(string aimlabTaskId, CancellationToken ct = default)
    {
        return await db.UserTaskStats
            .Where(s => s.AimlabsTaskId == aimlabTaskId && s.PersonalBest != null)
            .OrderByDescending(s => s.PersonalBest)
            .Select(s => new LeaderboardEntryResponse(s.AimlabsUsername, s.PersonalBest!.Value, s.PlayCount, s.SyncedAt))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<PlayAttemptResponse>> GetPlaysAsync(
        string userId, string aimlabsTaskId,
        DateTime? from, DateTime? to,
        CancellationToken ct = default)
    {
        var aimlabsUsername = await GetAimlabsUsernameAsync(userId, ct);

        var query = db.PlayAttempts
            .Where(p => p.AimlabsUsername == aimlabsUsername && p.AimlabsTaskId == aimlabsTaskId);

        if (from.HasValue) query = query.Where(p => p.PlayedAt >= DateTime.SpecifyKind(from.Value, DateTimeKind.Utc));
        if (to.HasValue)   query = query.Where(p => p.PlayedAt <= DateTime.SpecifyKind(to.Value, DateTimeKind.Utc));

        return await query
            .OrderBy(p => p.PlayedAt)
            .Select(p => new PlayAttemptResponse(p.AimlabsTaskId, p.Score, p.PlayedAt))
            .ToListAsync(ct);
    }

    public async Task<PagedResponse<PlayAttemptResponse>> GetPlaysPagedAsync(
        string userId, string aimlabsTaskId,
        int page, int pageSize,
        CancellationToken ct = default)
    {
        var aimlabsUsername = await GetAimlabsUsernameAsync(userId, ct);

        pageSize = Math.Clamp(pageSize, 1, 100);
        page     = Math.Max(1, page);

        var baseQuery = db.PlayAttempts
            .Where(p => p.AimlabsUsername == aimlabsUsername && p.AimlabsTaskId == aimlabsTaskId);

        var total = await baseQuery.CountAsync(ct);

        var items = await baseQuery
            .OrderByDescending(p => p.PlayedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PlayAttemptResponse(p.AimlabsTaskId, p.Score, p.PlayedAt))
            .ToListAsync(ct);

        return new PagedResponse<PlayAttemptResponse>(items, total, page, pageSize);
    }

    private async Task<string> GetAimlabsUsernameAsync(string userId, CancellationToken ct)
    {
        var user = await userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");
        if (string.IsNullOrWhiteSpace(user.AimlabsUsername))
            throw new ArgumentException("No Aimlabs username linked. Update your profile first.");
        return user.AimlabsUsername;
    }

    private static UserTaskStatResponse ToResponse(UserTaskStat s, double? last5Avg = null, int? thresholdValue = null) =>
        new(s.AimlabsTaskId, s.TaskName, s.Category, s.PersonalBest, s.PlayCount, s.AvgScore,
            s.LastPlayedAt, thresholdValue, s.SyncedAt, last5Avg);
}
