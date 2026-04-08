using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
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

    public async Task<TaskCatalogItemResponse?> GetCatalogItemAsync(string aimlabsTaskId, CancellationToken ct = default)
    {
        return await db.AimTasks
            .Where(t => t.AimlabsTaskId == aimlabsTaskId)
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
            .FirstOrDefaultAsync(ct);
    }

    public async Task<UserTaskStatResponse> GetTaskAsync(string userId, string aimlabTaskId, CancellationToken ct = default)
    {
        var aimlabsUsername = await GetAimlabsUsernameAsync(userId, ct);

        var stat = await db.UserTaskStats
            .FirstOrDefaultAsync(s => s.AimlabsUsername == aimlabsUsername && s.AimlabsTaskId == aimlabTaskId, ct)
            ?? throw new KeyNotFoundException($"Task '{aimlabTaskId}' not found for this user.");

        // Fetch all scores ordered chronologically for threshold calculation
        var scoreValues = await db.PlayAttempts
            .Where(p => p.AimlabsUsername == aimlabsUsername && p.AimlabsTaskId == aimlabTaskId)
            .OrderBy(p => p.PlayedAt)
            .Select(p => p.Score)
            .ToListAsync(ct);

        var calculated = ThresholdCalculator.Calculate(scoreValues);

        var threshold = await db.UserThresholds
            .FirstOrDefaultAsync(t => t.UserId == userId && t.AimlabsTaskId == aimlabTaskId, ct);

        int? finalThresholdValue;
        int? suggestedThreshold = null;
        bool autosyncEnabled;
        DateTime? lastCalculatedAt;
        var now = DateTime.UtcNow;

        if (threshold is null)
        {
            // No threshold yet — persist the calculated value (or null if not enough data)
            finalThresholdValue = calculated;
            autosyncEnabled = true;
            lastCalculatedAt = calculated.HasValue ? now : null;

            if (calculated.HasValue)
            {
                db.UserThresholds.Add(new UserThreshold
                {
                    UserId = userId,
                    AimlabsTaskId = aimlabTaskId,
                    ThresholdValue = calculated.Value,
                    AutosyncEnabled = true,
                    LastCalculatedAt = now
                });
                try
                {
                    await db.SaveChangesAsync(ct);
                }
                catch (DbUpdateException ex)
                    when (ex.InnerException is PostgresException pg && pg.SqlState == "23505")
                {
                    // Concurrent request beat us — read the winner's value
                    db.ChangeTracker.Clear();
                    finalThresholdValue = await db.UserThresholds
                        .Where(t => t.UserId == userId && t.AimlabsTaskId == aimlabTaskId)
                        .Select(t => (int?)t.ThresholdValue)
                        .FirstOrDefaultAsync(ct);
                }
            }
        }
        else if (threshold.AutosyncEnabled)
        {
            autosyncEnabled = true;
            lastCalculatedAt = threshold.LastCalculatedAt;

            var alreadyCalculatedToday = threshold.LastCalculatedAt.HasValue
                && threshold.LastCalculatedAt.Value.Date == now.Date;

            if (!alreadyCalculatedToday && calculated.HasValue && calculated.Value > threshold.ThresholdValue)
            {
                // First open of the day — auto-apply
                await db.UserThresholds
                    .Where(t => t.UserId == userId && t.AimlabsTaskId == aimlabTaskId)
                    .ExecuteUpdateAsync(t => t
                        .SetProperty(x => x.ThresholdValue, calculated.Value)
                        .SetProperty(x => x.LastCalculatedAt, now), ct);
                finalThresholdValue = calculated.Value;
                lastCalculatedAt = now;
            }
            else
            {
                // Already calculated today or no improvement — show as suggestion
                finalThresholdValue = threshold.ThresholdValue;
                if (calculated.HasValue && calculated.Value > threshold.ThresholdValue)
                    suggestedThreshold = calculated.Value;
            }
        }
        else
        {
            // Autosync off — return suggestion but don't touch stored value
            finalThresholdValue = threshold.ThresholdValue;
            autosyncEnabled = false;
            lastCalculatedAt = threshold.LastCalculatedAt;

            if (calculated.HasValue && calculated.Value > threshold.ThresholdValue)
                suggestedThreshold = calculated.Value;
        }

        return ToResponse(stat, thresholdValue: finalThresholdValue,
            autosyncEnabled: autosyncEnabled,
            lastCalculatedAt: lastCalculatedAt,
            suggestedThreshold: suggestedThreshold);
    }

    public async Task<UserTaskStatResponse> SetThresholdAsync(string userId, string aimlabTaskId, int value, bool autosyncEnabled = false, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var existing = await db.UserThresholds
            .FirstOrDefaultAsync(t => t.UserId == userId && t.AimlabsTaskId == aimlabTaskId, ct);

        if (existing is null)
        {
            db.UserThresholds.Add(new UserThreshold
            {
                UserId = userId,
                AimlabsTaskId = aimlabTaskId,
                ThresholdValue = value,
                AutosyncEnabled = autosyncEnabled,
                LastCalculatedAt = now
            });
            await db.SaveChangesAsync(ct);
        }
        else
        {
            await db.UserThresholds
                .Where(t => t.UserId == userId && t.AimlabsTaskId == aimlabTaskId)
                .ExecuteUpdateAsync(t => t
                    .SetProperty(x => x.ThresholdValue, value)
                    .SetProperty(x => x.AutosyncEnabled, autosyncEnabled)
                    .SetProperty(x => x.LastCalculatedAt, now), ct);
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
            ? ToResponse(stat, thresholdValue: value, autosyncEnabled: autosyncEnabled, lastCalculatedAt: now)
            : new UserTaskStatResponse(aimlabTaskId, aimlabTaskId, "other", null, 0, null, null, value, DateTime.UtcNow, null, autosyncEnabled, now);
    }

    public async Task<IReadOnlyList<LeaderboardEntryResponse>> GetLeaderboardAsync(
        string aimlabTaskId, DateTime? from = null, DateTime? to = null, CancellationToken ct = default)
    {
        // When a date range is provided, rank by best score in that range; otherwise use all-time PB
        List<(string Username, int RankScore, int PlayCount, DateTime SyncedAt)> ranked;

        if (from.HasValue || to.HasValue)
        {
            var playsQuery = db.PlayAttempts.Where(p => p.AimlabsTaskId == aimlabTaskId);
            if (from.HasValue) playsQuery = playsQuery.Where(p => p.PlayedAt >= DateTime.SpecifyKind(from.Value, DateTimeKind.Utc));
            if (to.HasValue)   playsQuery = playsQuery.Where(p => p.PlayedAt <= DateTime.SpecifyKind(to.Value, DateTimeKind.Utc));

            ranked = await playsQuery
                .GroupBy(p => p.AimlabsUsername)
                .Select(g => new
                {
                    Username = g.Key,
                    RankScore = g.Max(p => p.Score),
                    PlayCount = g.Count()
                })
                .Join(db.UserTaskStats,
                    g => new { g.Username, AimlabsTaskId = aimlabTaskId },
                    s => new { Username = s.AimlabsUsername, s.AimlabsTaskId },
                    (g, s) => new { g.Username, g.RankScore, g.PlayCount, s.SyncedAt })
                .OrderByDescending(x => x.RankScore)
                .Select(x => new { x.Username, x.RankScore, x.PlayCount, x.SyncedAt })
                .ToListAsync(ct)
                .ContinueWith(t => t.Result.Select(x => (x.Username, x.RankScore, x.PlayCount, x.SyncedAt)).ToList(), ct);
        }
        else
        {
            ranked = await db.UserTaskStats
                .Where(s => s.AimlabsTaskId == aimlabTaskId && s.PersonalBest != null)
                .OrderByDescending(s => s.PersonalBest)
                .Select(s => new { s.AimlabsUsername, RankScore = s.PersonalBest!.Value, s.PlayCount, s.SyncedAt })
                .ToListAsync(ct)
                .ContinueWith(t => t.Result.Select(x => (x.AimlabsUsername, x.RankScore, x.PlayCount, x.SyncedAt)).ToList(), ct);
        }

        if (ranked.Count == 0) return [];

        var usernames = ranked.Select(r => r.Username).ToList();

        // Fetch last 10 plays per user for trend_delta (always all-time, not date-filtered)
        var allPlays = await db.PlayAttempts
            .Where(p => p.AimlabsTaskId == aimlabTaskId && usernames.Contains(p.AimlabsUsername))
            .OrderByDescending(p => p.PlayedAt)
            .Select(p => new { p.AimlabsUsername, p.Score })
            .ToListAsync(ct);

        var playsByUser = allPlays
            .GroupBy(p => p.AimlabsUsername)
            .ToDictionary(g => g.Key, g => g.Select(p => p.Score).ToList());

        // Fetch thresholds via user join
        var users = await db.Users
            .Where(u => u.AimlabsUsername != null && usernames.Contains(u.AimlabsUsername))
            .Select(u => new { u.Id, u.AimlabsUsername })
            .ToListAsync(ct);

        var userIdByUsername = users
            .Where(u => u.AimlabsUsername != null)
            .GroupBy(u => u.AimlabsUsername!)
            .ToDictionary(g => g.Key, g => g.First().Id);

        var userIds = users.Select(u => u.Id).ToList();
        var thresholds = await db.UserThresholds
            .Where(t => t.AimlabsTaskId == aimlabTaskId && userIds.Contains(t.UserId))
            .ToDictionaryAsync(t => t.UserId, t => t.ThresholdValue, ct);

        return ranked.Select(r =>
        {
            var plays = playsByUser.GetValueOrDefault(r.Username, []);
            var recent5 = plays.Take(5).ToList();
            var prior5 = plays.Skip(5).Take(5).ToList();

            int? trendDelta = null;
            if (recent5.Count >= 2 && prior5.Count >= 1)
            {
                var avgRecent = recent5.Average(s => (double)s);
                var avgPrior  = prior5.Average(s => (double)s);
                trendDelta = (int)Math.Round(avgRecent - avgPrior);
            }

            int? lastThreshold = null;
            if (userIdByUsername.TryGetValue(r.Username, out var uid) &&
                thresholds.TryGetValue(uid, out var tv))
                lastThreshold = tv;

            return new LeaderboardEntryResponse(r.Username, r.RankScore, r.PlayCount, r.SyncedAt, lastThreshold, trendDelta);
        }).ToList();
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
            .Select(p => new PlayAttemptResponse(p.AimlabsTaskId, p.Score, p.PlayedAt, p.ThresholdAtPlay, p.AboveThreshold))
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
            .Select(p => new PlayAttemptResponse(p.AimlabsTaskId, p.Score, p.PlayedAt, p.ThresholdAtPlay, p.AboveThreshold))
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

    private static UserTaskStatResponse ToResponse(UserTaskStat s, double? last5Avg = null, int? thresholdValue = null,
        bool autosyncEnabled = false, DateTime? lastCalculatedAt = null, int? suggestedThreshold = null) =>
        new(s.AimlabsTaskId, s.TaskName, s.Category, s.PersonalBest, s.PlayCount, s.AvgScore,
            s.LastPlayedAt, thresholdValue, s.SyncedAt, last5Avg, autosyncEnabled, lastCalculatedAt, suggestedThreshold);

}
