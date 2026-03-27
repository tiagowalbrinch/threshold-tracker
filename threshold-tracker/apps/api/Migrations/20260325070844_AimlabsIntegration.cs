using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThresholdTracker.Migrations
{
    /// <inheritdoc />
    public partial class AimlabsIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "score_attempts");

            migrationBuilder.DropTable(
                name: "aim_tasks");

            migrationBuilder.AddColumn<string>(
                name: "AimlabsUserId",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AimlabsUsername",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "user_task_stats",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "text", nullable: false),
                    aimlabs_task_id = table.Column<string>(type: "text", nullable: false),
                    task_name = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    personal_best = table.Column<int>(type: "integer", nullable: true),
                    play_count = table.Column<int>(type: "integer", nullable: false),
                    avg_score = table.Column<double>(type: "double precision", nullable: true),
                    last_played_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    threshold_value = table.Column<int>(type: "integer", nullable: true),
                    synced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_task_stats", x => new { x.user_id, x.aimlabs_task_id });
                    table.ForeignKey(
                        name: "FK_user_task_stats_AspNetUsers_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_user_task_stats_task_pb",
                table: "user_task_stats",
                columns: new[] { "aimlabs_task_id", "personal_best" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_task_stats");

            migrationBuilder.DropColumn(
                name: "AimlabsUserId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "AimlabsUsername",
                table: "AspNetUsers");

            migrationBuilder.CreateTable(
                name: "aim_tasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    created_by_user_id = table.Column<string>(type: "text", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    PersonalBest = table.Column<int>(type: "integer", nullable: true),
                    Threshold = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_aim_tasks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "score_attempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskId = table.Column<Guid>(type: "uuid", nullable: false),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Dpi = table.Column<int>(type: "integer", nullable: true),
                    Fov = table.Column<float>(type: "real", nullable: true),
                    IsPb = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Sensitivity = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_score_attempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_score_attempts_aim_tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "aim_tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_aim_tasks_Name",
                table: "aim_tasks",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_score_attempts_task_id_created_date",
                table: "score_attempts",
                columns: new[] { "TaskId", "created_date" });
        }
    }
}
