using ThresholdTracker.Application.DTOs;

namespace ThresholdTracker.Application.Services;

public interface IProfileService
{
    Task<ProfileResponse> GetProfileAsync(string userId, CancellationToken ct = default);
    Task<ProfileResponse> UpdateProfileAsync(string userId, ProfileUpdateRequest request, CancellationToken ct = default);
}
