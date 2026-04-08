namespace ThresholdTracker.Application.DTOs;

public record UserTaskStatResponse(
    string AimlabsTaskId,
    string TaskName,
    string Category,
    int? PersonalBest,
    int PlayCount,
    double? AvgScore,
    DateTime? LastPlayedAt,
    int? ThresholdValue,
    DateTime SyncedAt,
    double? Last5Avg = null,
    bool AutosyncEnabled = false,
    DateTime? LastCalculatedAt = null,
    int? SuggestedThreshold = null);

public record ThresholdUpdateRequest(int Value, bool AutosyncEnabled = false);

public record TaskCatalogItemResponse(
    string AimlabsTaskId,
    string TaskName,
    string Category,
    string? BestPlayerNick,
    double? AvgScore,
    int? BestScore,
    int PlayerCount,
    int TotalPlays,
    DateTime? LastPlayedAt);

public record LeaderboardEntryResponse(
    string DisplayName,
    int PersonalBest,
    int PlayCount,
    DateTime SyncedAt,
    int? LastThreshold = null,
    int? TrendDelta = null);
