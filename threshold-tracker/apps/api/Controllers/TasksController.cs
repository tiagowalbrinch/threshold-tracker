using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Api.Controllers;

[ApiController]
[Route("tasks")]
public class TasksController(IAimTaskService taskService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var result = await taskService.GetTasksAsync(page, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTask(Guid id, CancellationToken ct)
    {
        var task = await taskService.GetTaskAsync(id, ct);
        return Ok(task);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateTask([FromBody] TaskCreateRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var task = await taskService.CreateTaskAsync(request, userId, ct);
        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    [HttpPatch("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] TaskUpdateRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var task = await taskService.UpdateTaskAsync(id, request, userId, ct);
        return Ok(task);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteTask(Guid id, CancellationToken ct)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        await taskService.DeleteTaskAsync(id, userId, ct);
        return NoContent();
    }
}
