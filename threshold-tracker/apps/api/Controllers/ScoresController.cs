using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Api.Controllers;

[ApiController]
[Route("scores")]
[Authorize]
public class ScoresController(IUserTaskStatService taskStatService) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<PlayAttemptResponse>> Get(
        [FromQuery(Name = "task_id")] string taskId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct) =>
        await taskStatService.GetPlaysAsync(UserId, taskId, from, to, ct);

    [HttpGet("paged")]
    public async Task<PagedResponse<PlayAttemptResponse>> GetPaged(
        [FromQuery(Name = "task_id")] string taskId,
        [FromQuery] int page = 1,
        [FromQuery(Name = "page_size")] int pageSize = 25,
        CancellationToken ct = default) =>
        await taskStatService.GetPlaysPagedAsync(UserId, taskId, page, pageSize, ct);

    private string UserId => User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
}
