using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Application;

public static class ApplicationExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IUserTaskStatService, UserTaskStatService>();
        services.AddScoped<ISyncService, SyncService>();

        return services;
    }
}
