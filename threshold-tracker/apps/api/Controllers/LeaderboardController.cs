using Microsoft.AspNetCore.Mvc;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Api.Controllers;

[ApiController]
[Route("leaderboard")]
public class LeaderboardController(IUserTaskStatService taskStatService) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<LeaderboardEntryResponse>> Get(
        [FromQuery(Name = "task_id")] string taskId,
        CancellationToken ct,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null) =>
        await taskStatService.GetLeaderboardAsync(taskId, from, to, ct);
}
