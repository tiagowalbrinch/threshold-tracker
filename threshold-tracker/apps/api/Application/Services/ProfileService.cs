using Microsoft.AspNetCore.Identity;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Domain.Identity;

namespace ThresholdTracker.Application.Services;

public class ProfileService(UserManager<ApplicationUser> userManager) : IProfileService
{
    public async Task<ProfileResponse> GetProfileAsync(string userId, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");
        return ToResponse(user);
    }

    public async Task<ProfileResponse> UpdateProfileAsync(string userId, ProfileUpdateRequest request, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (request.DisplayName is not null) user.DisplayName = request.DisplayName;
        if (request.DefaultSensitivity is not null) user.DefaultSensitivity = request.DefaultSensitivity;
        if (request.DefaultFov is not null) user.DefaultFov = request.DefaultFov;
        if (request.DefaultDpi is not null) user.DefaultDpi = request.DefaultDpi;

        await userManager.UpdateAsync(user);
        return ToResponse(user);
    }

    private static ProfileResponse ToResponse(ApplicationUser user) =>
        new(user.Id, user.DisplayName, user.Email!, user.DefaultSensitivity, user.DefaultFov, user.DefaultDpi);
}
