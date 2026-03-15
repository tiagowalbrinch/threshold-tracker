using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Validation;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Repositories;

namespace ThresholdTracker.Application.Services;

public class MapService : IMapService
{
    private readonly IMapRepository _mapRepository;
    private readonly IMapValidator _validator;

    public MapService(IMapRepository mapRepository, IMapValidator validator)
    {
        _mapRepository = mapRepository;
        _validator = validator;
    }

    public async Task<MapResponse> CreateMapAsync(MapCreateRequest request, CancellationToken cancellationToken = default)
    {
        _validator.ValidateForCreate(request);

        var map = new Map
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Threshold = request.Threshold,
            Record = request.Record,
            CurrentScore = request.CurrentScore,
            CreatedAt = DateTime.UtcNow,
            LastUpdated = DateTime.UtcNow
        };

        if (request.CurrentScore.HasValue)
        {
            map.ApplyNewScore(request.CurrentScore.Value);
        }

        var created = await _mapRepository.AddAsync(map, cancellationToken);
        return ToResponse(created);
    }

    public async Task<IReadOnlyList<MapResponse>> GetMapsAsync(CancellationToken cancellationToken = default)
    {
        var maps = await _mapRepository.GetAllAsync(cancellationToken);
        return maps.Select(ToResponse).ToList();
    }

    public async Task<MapResponse?> GetMapAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var map = await _mapRepository.GetByIdAsync(id, cancellationToken);
        return map is null ? null : ToResponse(map);
    }

    public async Task<MapResponse?> UpdateMapAsync(Guid id, MapUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var map = await _mapRepository.GetByIdAsync(id, cancellationToken);
        if (map is null) return null;

        _validator.ValidateForUpdate(request, map.Record);

        if (request.Record.HasValue)
        {
            map.Record = request.Record.Value;
        }

        if (request.Threshold.HasValue)
        {
            map.Threshold = request.Threshold.Value;
        }

        if (request.CurrentScore.HasValue)
        {
            map.ApplyNewScore(request.CurrentScore.Value);
        }
        else
        {
            map.LastUpdated = DateTime.UtcNow;
        }

        await _mapRepository.UpdateAsync(map, cancellationToken);
        return ToResponse(map);
    }

    public async Task<bool> DeleteMapAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var map = await _mapRepository.GetByIdAsync(id, cancellationToken);
        if (map is null) return false;

        await _mapRepository.DeleteAsync(map, cancellationToken);
        return true;
    }

    private static MapResponse ToResponse(Map map) =>
        new(
            Id: map.Id,
            Name: map.Name,
            Record: map.Record,
            Threshold: map.Threshold,
            CurrentScore: map.CurrentScore,
            CreatedAt: map.CreatedAt,
            LastUpdated: map.LastUpdated
        );
}

