namespace ThresholdTracker.Infrastructure.Services;

public interface IExternalScoreProvider
{
    Task<IReadOnlyList<int>> FetchScoresAsync(Guid mapId, CancellationToken cancellationToken = default);
}

public interface IScoreImportService
{
    Task ImportScoresForMapAsync(Guid mapId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Placeholder implementation until a real provider (e.g. Aimlabs) is integrated.
/// </summary>
public class DummyExternalScoreProvider : IExternalScoreProvider
{
    public Task<IReadOnlyList<int>> FetchScoresAsync(Guid mapId, CancellationToken cancellationToken = default)
    {
        // No external integration yet.
        return Task.FromResult<IReadOnlyList<int>>(Array.Empty<int>());
    }
}

public class ScoreImportService : IScoreImportService
{
    private readonly IExternalScoreProvider _provider;

    public ScoreImportService(IExternalScoreProvider provider)
    {
        _provider = provider;
    }

    public async Task ImportScoresForMapAsync(Guid mapId, CancellationToken cancellationToken = default)
    {
        // In the future, this will fetch scores from an external service and
        // push them through the existing ScoreService / repositories.
        _ = await _provider.FetchScoresAsync(mapId, cancellationToken);
    }
}

