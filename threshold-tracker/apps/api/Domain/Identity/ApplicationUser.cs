using Microsoft.AspNetCore.Identity;

namespace ThresholdTracker.Domain.Identity;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
    public string? DefaultSensitivity { get; set; }
    public float? DefaultFov { get; set; }
    public int? DefaultDpi { get; set; }
}
