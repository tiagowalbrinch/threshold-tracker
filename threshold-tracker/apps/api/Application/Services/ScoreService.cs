using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Repositories;

namespace ThresholdTracker.Application.Services;

public class ScoreService : IScoreService
{
    private readonly IMapRepository _mapRepository;
    private readonly IScoreEntryRepository _scoreEntryRepository;

    public ScoreService(IMapRepository mapRepository, IScoreEntryRepository scoreEntryRepository)
    {
        _mapRepository = mapRepository;
        _scoreEntryRepository = scoreEntryRepository;
    }

    public async Task<ScoreResponse> AddScoreAsync(Guid mapId, ScoreCreateRequest request, CancellationToken cancellationToken = default)
    {
        var map = await _mapRepository.GetByIdAsync(mapId, cancellationToken)
                  ?? throw new KeyNotFoundException("Map not found.");

        var entry = new ScoreEntry
        {
            Id = Guid.NewGuid(),
            MapId = mapId,
            Score = request.Score,
            CreatedAt = DateTime.UtcNow
        };

        await _scoreEntryRepository.AddAsync(entry, cancellationToken);

        // Update map record/threshold-related info
        map.ApplyNewScore(request.Score);
        await _mapRepository.UpdateAsync(map, cancellationToken);

        return new ScoreResponse(entry.Id, entry.Score, entry.CreatedAt);
    }

    public async Task<IReadOnlyList<ScoreResponse>> GetScoresAsync(Guid mapId, CancellationToken cancellationToken = default)
    {
        var entries = await _scoreEntryRepository.GetByMapIdAsync(mapId, cancellationToken);
        return entries
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new ScoreResponse(e.Id, e.Score, e.CreatedAt))
            .ToList();
    }
}

