using Microsoft.EntityFrameworkCore;
using ThresholdTracker.Domain.Entities;

namespace ThresholdTracker.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Map> Maps => Set<Map>();
    public DbSet<ScoreEntry> ScoreEntries => Set<ScoreEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Map>(entity =>
        {
            entity.ToTable("maps");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.Record).HasColumnName("record");
            entity.Property(e => e.Threshold).HasColumnName("threshold");
            entity.Property(e => e.CurrentScore).HasColumnName("current_score");
            entity.Property(e => e.LastUpdated).HasColumnName("last_updated");

            entity.HasMany(e => e.Scores)
                  .WithOne(e => e.Map)
                  .HasForeignKey(e => e.MapId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ScoreEntry>(entity =>
        {
            entity.ToTable("score_entries");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Score).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.HasIndex(e => new { e.MapId, e.CreatedAt }).HasDatabaseName("idx_score_entries_map_id_created_at");
        });
    }
}

