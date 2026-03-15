using ThresholdTracker.Application.DTOs;

namespace ThresholdTracker.Application.Services;

public interface IScoreService
{
    Task<ScoreResponse> AddScoreAsync(Guid mapId, ScoreCreateRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ScoreResponse>> GetScoresAsync(Guid mapId, CancellationToken cancellationToken = default);
}

