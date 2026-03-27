namespace ThresholdTracker.Application.Services;

public record TaskStat(
    string TaskId,
    string TaskName,
    string Category,
    int? PersonalBest,
    int PlayCount,
    double? AvgScore,
    DateTime? LastPlayedAt);

public record PlayAttempt(string TaskId, int Score, DateTime PlayedAt);

public interface IAimTrainerClient
{
    string TrainerName { get; }
    Task<string?> ResolveUserIdAsync(string username, CancellationToken ct = default);
    Task<IReadOnlyList<TaskStat>> GetTaskStatsAsync(string aimlabUserId, CancellationToken ct = default);
    Task<IReadOnlyList<PlayAttempt>> GetPlaysAsync(string aimlabUsername, string taskId, DateTime? from, DateTime? to, CancellationToken ct = default);
}
