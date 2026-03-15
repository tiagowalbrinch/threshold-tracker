using ThresholdTracker.Application.DTOs;

namespace ThresholdTracker.Application.Services;

public interface IMapService
{
    Task<MapResponse> CreateMapAsync(MapCreateRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MapResponse>> GetMapsAsync(CancellationToken cancellationToken = default);
    Task<MapResponse?> GetMapAsync(Guid id, CancellationToken cancellationToken = default);
    Task<MapResponse?> UpdateMapAsync(Guid id, MapUpdateRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteMapAsync(Guid id, CancellationToken cancellationToken = default);
}

