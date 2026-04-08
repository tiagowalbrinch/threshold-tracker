using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThresholdTracker.Migrations
{
    /// <inheritdoc />
    public partial class ThresholdAtPlay : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AboveThreshold",
                table: "play_attempts",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ThresholdAtPlay",
                table: "play_attempts",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AboveThreshold",
                table: "play_attempts");

            migrationBuilder.DropColumn(
                name: "ThresholdAtPlay",
                table: "play_attempts");
        }
    }
}
