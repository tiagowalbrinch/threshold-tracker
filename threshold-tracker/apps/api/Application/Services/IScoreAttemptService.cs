using ThresholdTracker.Application.DTOs;

namespace ThresholdTracker.Application.Services;

public interface IScoreAttemptService
{
    Task<IReadOnlyList<ScoreResponse>> GetScoresAsync(Guid taskId, string? userId, CancellationToken ct = default);
    Task<ScoreResponse> AddScoreAsync(ScoreCreateRequest request, string userId, CancellationToken ct = default);
    Task DeleteScoreAsync(Guid id, string userId, CancellationToken ct = default);
}
