using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Api.Controllers;

[ApiController]
[Route("scores")]
public class ScoresController(IScoreAttemptService scoreService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetScores(
        [FromQuery(Name = "task_id")] Guid taskId,
        [FromQuery] bool mine = false,
        CancellationToken ct = default)
    {
        string? userId = null;
        if (mine)
        {
            userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (userId is null)
                return Unauthorized();
        }

        var scores = await scoreService.GetScoresAsync(taskId, userId, ct);
        return Ok(scores);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddScore([FromBody] ScoreCreateRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var score = await scoreService.AddScoreAsync(request, userId, ct);
        return Created(string.Empty, score);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteScore(Guid id, CancellationToken ct)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        await scoreService.DeleteScoreAsync(id, userId, ct);
        return NoContent();
    }
}
