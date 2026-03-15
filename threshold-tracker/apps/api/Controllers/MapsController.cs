using Microsoft.AspNetCore.Mvc;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Api.Controllers;

[ApiController]
[Route("maps")]
public class MapsController : ControllerBase
{
    private readonly IMapService _mapService;

    public MapsController(IMapService mapService)
    {
        _mapService = mapService;
    }

    [HttpPost]
    public async Task<ActionResult<MapResponse>> CreateMap([FromBody] MapCreateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _mapService.CreateMapAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetMap), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MapResponse>>> GetMaps(CancellationToken cancellationToken)
    {
        var maps = await _mapService.GetMapsAsync(cancellationToken);
        return Ok(maps);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MapResponse>> GetMap(Guid id, CancellationToken cancellationToken)
    {
        var map = await _mapService.GetMapAsync(id, cancellationToken);
        if (map is null) return NotFound();
        return Ok(map);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<MapResponse>> UpdateMap(Guid id, [FromBody] MapUpdateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var map = await _mapService.UpdateMapAsync(id, request, cancellationToken);
            if (map is null) return NotFound();
            return Ok(map);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteMap(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _mapService.DeleteMapAsync(id, cancellationToken);
        if (!deleted) return NotFound();
        return NoContent();
    }
}

