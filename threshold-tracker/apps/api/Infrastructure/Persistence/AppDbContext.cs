using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Identity;

namespace ThresholdTracker.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
    }

    public DbSet<AimTask> AimTasks => Set<AimTask>();
    public DbSet<UserTaskStat> UserTaskStats => Set<UserTaskStat>();
    public DbSet<PlayAttempt> PlayAttempts => Set<PlayAttempt>();
    public DbSet<UserThreshold> UserThresholds => Set<UserThreshold>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AimTask>(entity =>
        {
            entity.ToTable("aim_tasks");
            entity.HasKey(e => e.AimlabsTaskId);
            entity.Property(e => e.AimlabsTaskId).HasColumnName("aimlabs_task_id");
            entity.Property(e => e.TaskName).HasColumnName("task_name").IsRequired();
            entity.Property(e => e.Category).HasColumnName("category").IsRequired();
            entity.Property(e => e.FirstSeenAt).HasColumnName("first_seen_at");
        });

        modelBuilder.Entity<UserTaskStat>(entity =>
        {
            entity.ToTable("user_task_stats");
            entity.HasKey(e => new { e.AimlabsUsername, e.AimlabsTaskId });
            entity.Property(e => e.AimlabsUsername).HasColumnName("aimlabs_username");
            entity.Property(e => e.AimlabsTaskId).HasColumnName("aimlabs_task_id");
            entity.Property(e => e.TaskName).HasColumnName("task_name").IsRequired();
            entity.Property(e => e.Category).HasColumnName("category").IsRequired();
            entity.Property(e => e.PersonalBest).HasColumnName("personal_best");
            entity.Property(e => e.PlayCount).HasColumnName("play_count");
            entity.Property(e => e.AvgScore).HasColumnName("avg_score");
            entity.Property(e => e.LastPlayedAt).HasColumnName("last_played_at");
            entity.Property(e => e.SyncedAt).HasColumnName("synced_at");
            entity.HasIndex(e => new { e.AimlabsTaskId, e.PersonalBest })
                .HasDatabaseName("idx_user_task_stats_task_pb");
        });

        modelBuilder.Entity<PlayAttempt>(entity =>
        {
            entity.ToTable("play_attempts");
            entity.HasKey(e => new { e.AimlabsUsername, e.AimlabsTaskId, e.PlayedAt });
            entity.Property(e => e.AimlabsUsername).HasColumnName("aimlabs_username");
            entity.Property(e => e.AimlabsTaskId).HasColumnName("aimlabs_task_id");
            entity.Property(e => e.Score).HasColumnName("score");
            entity.Property(e => e.PlayedAt).HasColumnName("played_at");
            entity.HasIndex(e => new { e.AimlabsUsername, e.AimlabsTaskId })
                .HasDatabaseName("idx_play_attempts_user_task");
        });

        modelBuilder.Entity<UserThreshold>(entity =>
        {
            entity.ToTable("user_thresholds");
            entity.HasKey(e => new { e.UserId, e.AimlabsTaskId });
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.AimlabsTaskId).HasColumnName("aimlabs_task_id");
            entity.Property(e => e.ThresholdValue).HasColumnName("threshold_value");
            entity.Property(e => e.AutosyncEnabled).HasColumnName("autosync_enabled").HasDefaultValue(false);
            entity.Property(e => e.LastCalculatedAt).HasColumnName("last_calculated_at");
            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
