using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThresholdTracker.Migrations
{
    /// <inheritdoc />
    public partial class PlayAttemptsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "play_attempts",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "text", nullable: false),
                    aimlabs_task_id = table.Column<string>(type: "text", nullable: false),
                    played_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    score = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_play_attempts", x => new { x.user_id, x.aimlabs_task_id, x.played_at });
                    table.ForeignKey(
                        name: "FK_play_attempts_AspNetUsers_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_play_attempts_user_task",
                table: "play_attempts",
                columns: new[] { "user_id", "aimlabs_task_id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "play_attempts");
        }
    }
}
