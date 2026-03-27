using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Api.Controllers;

[ApiController]
[Route("sync")]
[Authorize]
public class SyncController(ISyncService syncService) : ControllerBase
{
    [HttpPost]
    public async Task<IReadOnlyList<UserTaskStatResponse>> Sync(CancellationToken ct) =>
        await syncService.SyncAsync(UserId, ct);

    [HttpPost("plays")]
    public async Task<IActionResult> SyncPlays(
        [FromQuery(Name = "task_id")] string taskId,
        CancellationToken ct)
    {
        var count = await syncService.SyncPlaysAsync(UserId, taskId, ct);
        return Ok(new { synced = count });
    }

    [HttpPost("task/{taskId}")]
    public async Task<UserTaskStatResponse> SyncTask(string taskId, CancellationToken ct) =>
        await syncService.SyncTaskAsync(UserId, taskId, ct);

    private string UserId => User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
}
