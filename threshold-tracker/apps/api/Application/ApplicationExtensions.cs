using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Application;

public static class ApplicationExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IAimTaskService, AimTaskService>();
        services.AddScoped<IScoreAttemptService, ScoreAttemptService>();

        return services;
    }
}
