using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Api.Controllers;

[ApiController]
[Route("tasks")]
[Authorize]
public class TasksController(IUserTaskStatService taskStatService) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<UserTaskStatResponse>> GetAll(
        CancellationToken ct,
        [FromQuery] string? name = null,
        [FromQuery] string? category = null,
        [FromQuery] string order_by = "recently_played",
        [FromQuery] DateTime? played_from = null,
        [FromQuery] DateTime? played_to = null) =>
        await taskStatService.GetTasksAsync(UserId, name, category, order_by, played_from, played_to, ct);

    [HttpGet("{taskId}")]
    public async Task<UserTaskStatResponse> Get(string taskId, CancellationToken ct) =>
        await taskStatService.GetTaskAsync(UserId, taskId, ct);

    [HttpPatch("{taskId}/threshold")]
    public async Task<UserTaskStatResponse> SetThreshold(
        string taskId, [FromBody] ThresholdUpdateRequest request, CancellationToken ct) =>
        await taskStatService.SetThresholdAsync(UserId, taskId, request.Value, ct);

    private string UserId => User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
}
