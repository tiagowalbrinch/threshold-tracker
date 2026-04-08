using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThresholdTracker.Migrations
{
    /// <inheritdoc />
    public partial class RenameThresholdAtPlayColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ThresholdAtPlay",
                table: "play_attempts",
                newName: "threshold_at_play");

            migrationBuilder.RenameColumn(
                name: "AboveThreshold",
                table: "play_attempts",
                newName: "above_threshold");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "threshold_at_play",
                table: "play_attempts",
                newName: "ThresholdAtPlay");

            migrationBuilder.RenameColumn(
                name: "above_threshold",
                table: "play_attempts",
                newName: "AboveThreshold");
        }
    }
}
