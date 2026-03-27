using Microsoft.AspNetCore.Mvc;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Api.Controllers;

[ApiController]
[Route("catalog")]
public class CatalogController(IUserTaskStatService taskStatService) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResponse<TaskCatalogItemResponse>> GetCatalog(
        [FromQuery] string? name,
        [FromQuery] string? category,
        [FromQuery] string order_by = "recently_played",
        [FromQuery] int page = 1,
        [FromQuery] int page_size = 24,
        CancellationToken ct = default) =>
        await taskStatService.GetCatalogAsync(name, category, order_by, page, page_size, ct);
}
