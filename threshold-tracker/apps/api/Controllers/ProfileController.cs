using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Api.Controllers;

[ApiController]
[Route("profile")]
[Authorize]
public class ProfileController(IProfileService profileService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var profile = await profileService.GetProfileAsync(userId, ct);
        return Ok(profile);
    }

    [HttpPatch]
    public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request, CancellationToken ct)
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)!;
        var profile = await profileService.UpdateProfileAsync(userId, request, ct);
        return Ok(profile);
    }
}
