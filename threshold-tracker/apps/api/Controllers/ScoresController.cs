using Microsoft.AspNetCore.Mvc;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Api.Controllers;

[ApiController]
[Route("maps/{mapId:guid}/scores")]
public class ScoresController : ControllerBase
{
    private readonly IScoreService _scoreService;

    public ScoresController(IScoreService scoreService)
    {
        _scoreService = scoreService;
    }

    [HttpPost]
    public async Task<ActionResult<ScoreResponse>> AddScore(Guid mapId, [FromBody] ScoreCreateRequest request, CancellationToken cancellationToken)
    {
        var score = await _scoreService.AddScoreAsync(mapId, request, cancellationToken);
        return CreatedAtAction(nameof(GetScores), new { mapId }, score);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ScoreResponse>>> GetScores(Guid mapId, CancellationToken cancellationToken)
    {
        var scores = await _scoreService.GetScoresAsync(mapId, cancellationToken);
        return Ok(scores);
    }
}

