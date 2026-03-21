namespace ThresholdTracker.Application.DTOs;

public record ProfileResponse(string UserId, string DisplayName, string Email, string? DefaultSensitivity, float? DefaultFov, int? DefaultDpi);
public record ProfileUpdateRequest(string? DisplayName, string? DefaultSensitivity, float? DefaultFov, int? DefaultDpi);
