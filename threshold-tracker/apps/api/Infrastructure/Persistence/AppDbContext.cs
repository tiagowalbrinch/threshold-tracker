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

    public DbSet<AimTask> Tasks => Set<AimTask>();
    public DbSet<ScoreAttempt> ScoreAttempts => Set<ScoreAttempt>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AimTask>(entity =>
        {
            entity.ToTable("aim_tasks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.CreatedDate).HasColumnName("created_date");
            entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
            entity.Property(e => e.Category)
                .HasConversion<string>()
                .HasColumnName("category");
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasMany(e => e.Scores)
                  .WithOne(e => e.Task)
                  .HasForeignKey(e => e.TaskId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ScoreAttempt>(entity =>
        {
            entity.ToTable("score_attempts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Value).IsRequired();
            entity.Property(e => e.CreatedDate).HasColumnName("created_date");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.HasIndex(e => new { e.TaskId, e.CreatedDate })
                .HasDatabaseName("idx_score_attempts_task_id_created_date");
        });
    }
}
