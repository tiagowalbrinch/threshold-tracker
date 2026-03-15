using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ThresholdTracker.Infrastructure.Persistence;

#nullable disable

namespace ThresholdTracker.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.0");

            modelBuilder.Entity("ThresholdTracker.Domain.Entities.Map", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("created_at");

                    b.Property<int?>("CurrentScore")
                        .HasColumnType("integer")
                        .HasColumnName("current_score");

                    b.Property<DateTime>("LastUpdated")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("last_updated");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("Record")
                        .HasColumnType("integer")
                        .HasColumnName("record");

                    b.Property<int>("Threshold")
                        .HasColumnType("integer")
                        .HasColumnName("threshold");

                    b.HasKey("Id");

                    b.ToTable("maps", (string)null);
                });

            modelBuilder.Entity("ThresholdTracker.Domain.Entities.ScoreEntry", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("created_at");

                    b.Property<Guid>("MapId")
                        .HasColumnType("uuid");

                    b.Property<int>("Score")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("MapId", "CreatedAt")
                        .HasDatabaseName("idx_score_entries_map_id_created_at");

                    b.ToTable("score_entries", (string)null);
                });

            modelBuilder.Entity("ThresholdTracker.Domain.Entities.ScoreEntry", b =>
                {
                    b.HasOne("ThresholdTracker.Domain.Entities.Map", "Map")
                        .WithMany("Scores")
                        .HasForeignKey("MapId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Map");
                });

            modelBuilder.Entity("ThresholdTracker.Domain.Entities.Map", b =>
                {
                    b.Navigation("Scores");
                });
#pragma warning restore 612, 618
        }
    }
}

