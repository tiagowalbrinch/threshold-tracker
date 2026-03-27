using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Identity;
using ThresholdTracker.Infrastructure.Persistence;

namespace ThresholdTracker.Application.Services;

public class SyncService(
    IAimTrainerClient aimlabsClient,
    UserManager<ApplicationUser> userManager,
    AppDbContext db) : ISyncService
{
    public async Task<IReadOnlyList<UserTaskStatResponse>> SyncAsync(string userId, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (string.IsNullOrWhiteSpace(user.AimlabsUsername))
            throw new ArgumentException("No Aimlabs username linked. Update your profile first.");

        // Resolve and cache aimlabs user ID if needed
        if (string.IsNullOrWhiteSpace(user.AimlabsUserId))
        {
            var aimlabsId = await aimlabsClient.ResolveUserIdAsync(user.AimlabsUsername, ct)
                ?? throw new KeyNotFoundException($"Aimlabs user '{user.AimlabsUsername}' not found.");
            user.AimlabsUserId = aimlabsId;
            await userManager.UpdateAsync(user);
        }

        var aimlabsUsername = user.AimlabsUsername;

        var rawStats = await aimlabsClient.GetTaskStatsAsync(user.AimlabsUserId, ct);

        // Aimlabs groups by (task_id, task_mode) so the same task_id can appear multiple times.
        // Deduplicate by task_id, keeping the entry with the highest play count.
        var taskStats = rawStats
            .GroupBy(t => t.TaskId)
            .Select(g => g.OrderByDescending(t => t.PlayCount).First())
            .ToList();

        // Load existing stats for this aimlabs username
        var existing = await db.UserTaskStats
            .Where(s => s.AimlabsUsername == aimlabsUsername)
            .ToDictionaryAsync(s => s.AimlabsTaskId, ct);

        var now = DateTime.UtcNow;
        var toAdd = new List<UserTaskStat>();

        foreach (var stat in taskStats)
        {
            if (existing.ContainsKey(stat.TaskId))
            {
                await db.UserTaskStats
                    .Where(s => s.AimlabsUsername == aimlabsUsername && s.AimlabsTaskId == stat.TaskId)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(x => x.TaskName, stat.TaskName)
                        .SetProperty(x => x.Category, stat.Category)
                        .SetProperty(x => x.PersonalBest, stat.PersonalBest)
                        .SetProperty(x => x.PlayCount, stat.PlayCount)
                        .SetProperty(x => x.AvgScore, stat.AvgScore)
                        .SetProperty(x => x.LastPlayedAt, stat.LastPlayedAt)
                        .SetProperty(x => x.SyncedAt, now), ct);
            }
            else
            {
                toAdd.Add(new UserTaskStat
                {
                    AimlabsUsername = aimlabsUsername,
                    AimlabsTaskId = stat.TaskId,
                    TaskName = stat.TaskName,
                    Category = stat.Category,
                    PersonalBest = stat.PersonalBest,
                    PlayCount = stat.PlayCount,
                    AvgScore = stat.AvgScore,
                    LastPlayedAt = stat.LastPlayedAt,
                    SyncedAt = now
                });
            }
        }

        if (toAdd.Count > 0)
            db.UserTaskStats.AddRange(toAdd);

        // Upsert global task catalog
        var allTaskIds = taskStats.Select(s => s.TaskId).ToList();
        var existingCatalogIds = (await db.AimTasks
            .Where(t => allTaskIds.Contains(t.AimlabsTaskId))
            .Select(t => t.AimlabsTaskId)
            .ToListAsync(ct))
            .ToHashSet();

        var newCatalogTasks = taskStats
            .Where(s => !existingCatalogIds.Contains(s.TaskId))
            .Select(s => new AimTask
            {
                AimlabsTaskId = s.TaskId,
                TaskName = s.TaskName,
                Category = s.Category,
                FirstSeenAt = now
            });
        db.AimTasks.AddRange(newCatalogTasks);

        await db.SaveChangesAsync(ct);

        var updated = await db.UserTaskStats
            .Where(s => s.AimlabsUsername == aimlabsUsername)
            .OrderByDescending(s => s.LastPlayedAt)
            .ToListAsync(ct);

        return updated.Select(s => new UserTaskStatResponse(
            s.AimlabsTaskId, s.TaskName, s.Category, s.PersonalBest,
            s.PlayCount, s.AvgScore, s.LastPlayedAt, null, s.SyncedAt, null)).ToList();
    }

    public async Task<int> SyncPlaysAsync(string userId, string aimlabsTaskId, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (string.IsNullOrWhiteSpace(user.AimlabsUsername))
            throw new ArgumentException("No Aimlabs username linked. Update your profile first.");

        var aimlabsUsername = user.AimlabsUsername;

        // Incremental fetch: start just before the latest stored play to guard edge cases
        var latestStored = await db.PlayAttempts
            .Where(p => p.AimlabsUsername == aimlabsUsername && p.AimlabsTaskId == aimlabsTaskId)
            .MaxAsync(p => (DateTime?)p.PlayedAt, ct);

        var from = latestStored.HasValue ? latestStored.Value.AddSeconds(-5) : (DateTime?)null;

        var plays = await aimlabsClient.GetPlaysAsync(aimlabsUsername, aimlabsTaskId, from, null, ct);

        if (plays.Count == 0) return 0;

        // Load existing timestamps in the fetch window to deduplicate without relying on exceptions
        var existingTimestamps = (await db.PlayAttempts
            .Where(p => p.AimlabsUsername == aimlabsUsername
                     && p.AimlabsTaskId == aimlabsTaskId
                     && (from == null || p.PlayedAt >= from))
            .Select(p => p.PlayedAt)
            .ToListAsync(ct))
            .ToHashSet();

        var toAdd = plays
            .Where(p => !existingTimestamps.Contains(p.PlayedAt))
            .Select(p => new Domain.Entities.PlayAttempt
            {
                AimlabsUsername = aimlabsUsername,
                AimlabsTaskId = aimlabsTaskId,
                Score = p.Score,
                PlayedAt = p.PlayedAt
            })
            .ToList();

        if (toAdd.Count > 0)
        {
            db.PlayAttempts.AddRange(toAdd);
            await db.SaveChangesAsync(ct);
        }

        return toAdd.Count;
    }

    public async Task<UserTaskStatResponse> SyncTaskAsync(string userId, string aimlabsTaskId, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (string.IsNullOrWhiteSpace(user.AimlabsUsername))
            throw new ArgumentException("No Aimlabs username linked. Update your profile first.");

        // Resolve and cache aimlabs user ID if needed
        if (string.IsNullOrWhiteSpace(user.AimlabsUserId))
        {
            var aimlabsId = await aimlabsClient.ResolveUserIdAsync(user.AimlabsUsername, ct)
                ?? throw new KeyNotFoundException($"Aimlabs user '{user.AimlabsUsername}' not found.");
            user.AimlabsUserId = aimlabsId;
            await userManager.UpdateAsync(user);
        }

        var aimlabsUsername = user.AimlabsUsername;

        var rawStats = await aimlabsClient.GetTaskStatsAsync(user.AimlabsUserId, ct);

        var taskStat = rawStats
            .Where(s => s.TaskId == aimlabsTaskId)
            .OrderByDescending(s => s.PlayCount)
            .FirstOrDefault()
            ?? throw new KeyNotFoundException($"Task '{aimlabsTaskId}' not found in Aimlabs stats.");

        var now = DateTime.UtcNow;
        var exists = await db.UserTaskStats
            .AnyAsync(s => s.AimlabsUsername == aimlabsUsername && s.AimlabsTaskId == aimlabsTaskId, ct);

        if (exists)
        {
            await db.UserTaskStats
                .Where(s => s.AimlabsUsername == aimlabsUsername && s.AimlabsTaskId == aimlabsTaskId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.TaskName, taskStat.TaskName)
                    .SetProperty(x => x.Category, taskStat.Category)
                    .SetProperty(x => x.PersonalBest, taskStat.PersonalBest)
                    .SetProperty(x => x.PlayCount, taskStat.PlayCount)
                    .SetProperty(x => x.AvgScore, taskStat.AvgScore)
                    .SetProperty(x => x.LastPlayedAt, taskStat.LastPlayedAt)
                    .SetProperty(x => x.SyncedAt, now), ct);
        }
        else
        {
            db.UserTaskStats.Add(new UserTaskStat
            {
                AimlabsUsername = aimlabsUsername,
                AimlabsTaskId = aimlabsTaskId,
                TaskName = taskStat.TaskName,
                Category = taskStat.Category,
                PersonalBest = taskStat.PersonalBest,
                PlayCount = taskStat.PlayCount,
                AvgScore = taskStat.AvgScore,
                LastPlayedAt = taskStat.LastPlayedAt,
                SyncedAt = now
            });

            // Also upsert into global catalog if needed
            if (!await db.AimTasks.AnyAsync(t => t.AimlabsTaskId == aimlabsTaskId, ct))
            {
                db.AimTasks.Add(new AimTask
                {
                    AimlabsTaskId = aimlabsTaskId,
                    TaskName = taskStat.TaskName,
                    Category = taskStat.Category,
                    FirstSeenAt = now
                });
            }

            await db.SaveChangesAsync(ct);
        }

        var threshold = await db.UserThresholds
            .Where(t => t.UserId == userId && t.AimlabsTaskId == aimlabsTaskId)
            .Select(t => (int?)t.ThresholdValue)
            .FirstOrDefaultAsync(ct);

        var updated = await db.UserTaskStats
            .FirstAsync(s => s.AimlabsUsername == aimlabsUsername && s.AimlabsTaskId == aimlabsTaskId, ct);

        return new UserTaskStatResponse(
            updated.AimlabsTaskId, updated.TaskName, updated.Category, updated.PersonalBest,
            updated.PlayCount, updated.AvgScore, updated.LastPlayedAt, threshold, updated.SyncedAt, null);
    }
}
