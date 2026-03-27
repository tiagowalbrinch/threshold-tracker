using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThresholdTracker.Migrations
{
    /// <inheritdoc />
    public partial class AimlabsKeyedStats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_play_attempts_AspNetUsers_user_id",
                table: "play_attempts");

            migrationBuilder.DropForeignKey(
                name: "FK_user_task_stats_AspNetUsers_user_id",
                table: "user_task_stats");

            // Create user_thresholds BEFORE dropping threshold_value so we can migrate the data
            migrationBuilder.CreateTable(
                name: "user_thresholds",
                columns: table => new
                {
                    user_id = table.Column<string>(type: "text", nullable: false),
                    aimlabs_task_id = table.Column<string>(type: "text", nullable: false),
                    threshold_value = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_thresholds", x => new { x.user_id, x.aimlabs_task_id });
                    table.ForeignKey(
                        name: "FK_user_thresholds_AspNetUsers_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Migrate existing threshold values before dropping the column
            migrationBuilder.Sql(@"
                INSERT INTO user_thresholds (user_id, aimlabs_task_id, threshold_value)
                SELECT user_id, aimlabs_task_id, threshold_value
                FROM user_task_stats
                WHERE threshold_value IS NOT NULL
            ");

            migrationBuilder.DropColumn(
                name: "threshold_value",
                table: "user_task_stats");

            // Rename user_id → aimlabs_username (column still holds user IDs at this point)
            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "user_task_stats",
                newName: "aimlabs_username");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "play_attempts",
                newName: "aimlabs_username");

            // --- Backfill user_task_stats ---
            // Drop PK before updating values to avoid duplicate key violations during backfill
            migrationBuilder.Sql(@"ALTER TABLE user_task_stats DROP CONSTRAINT ""PK_user_task_stats""");

            // Replace user IDs with actual Aimlabs usernames
            migrationBuilder.Sql(@"
                UPDATE user_task_stats
                SET aimlabs_username = u.""AimlabsUsername""
                FROM ""AspNetUsers"" u
                WHERE u.""Id"" = user_task_stats.aimlabs_username
                  AND u.""AimlabsUsername"" IS NOT NULL
            ");

            // Delete rows where no Aimlabs username was resolved (user never linked account)
            migrationBuilder.Sql(@"
                DELETE FROM user_task_stats
                WHERE aimlabs_username IN (SELECT ""Id"" FROM ""AspNetUsers"")
            ");

            // Deduplicate: if multiple users had the same Aimlabs username, keep the one with highest play_count
            migrationBuilder.Sql(@"
                DELETE FROM user_task_stats a
                USING user_task_stats b
                WHERE a.aimlabs_username = b.aimlabs_username
                  AND a.aimlabs_task_id = b.aimlabs_task_id
                  AND a.play_count < b.play_count
            ");
            // Handle exact ties on play_count: keep arbitrary row by ctid
            migrationBuilder.Sql(@"
                DELETE FROM user_task_stats a
                USING user_task_stats b
                WHERE a.aimlabs_username = b.aimlabs_username
                  AND a.aimlabs_task_id = b.aimlabs_task_id
                  AND a.ctid < b.ctid
            ");

            // Restore PK with new column
            migrationBuilder.Sql(@"ALTER TABLE user_task_stats ADD CONSTRAINT ""PK_user_task_stats"" PRIMARY KEY (aimlabs_username, aimlabs_task_id)");

            // --- Backfill play_attempts ---
            migrationBuilder.Sql(@"ALTER TABLE play_attempts DROP CONSTRAINT ""PK_play_attempts""");

            migrationBuilder.Sql(@"
                UPDATE play_attempts
                SET aimlabs_username = u.""AimlabsUsername""
                FROM ""AspNetUsers"" u
                WHERE u.""Id"" = play_attempts.aimlabs_username
                  AND u.""AimlabsUsername"" IS NOT NULL
            ");

            migrationBuilder.Sql(@"
                DELETE FROM play_attempts
                WHERE aimlabs_username IN (SELECT ""Id"" FROM ""AspNetUsers"")
            ");

            // Deduplicate play_attempts (same logic)
            migrationBuilder.Sql(@"
                DELETE FROM play_attempts a
                USING play_attempts b
                WHERE a.aimlabs_username = b.aimlabs_username
                  AND a.aimlabs_task_id = b.aimlabs_task_id
                  AND a.played_at = b.played_at
                  AND a.ctid < b.ctid
            ");

            migrationBuilder.Sql(@"ALTER TABLE play_attempts ADD CONSTRAINT ""PK_play_attempts"" PRIMARY KEY (aimlabs_username, aimlabs_task_id, played_at)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_thresholds");

            migrationBuilder.RenameColumn(
                name: "aimlabs_username",
                table: "user_task_stats",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "aimlabs_username",
                table: "play_attempts",
                newName: "user_id");

            migrationBuilder.AddColumn<int>(
                name: "threshold_value",
                table: "user_task_stats",
                type: "integer",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_play_attempts_AspNetUsers_user_id",
                table: "play_attempts",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_task_stats_AspNetUsers_user_id",
                table: "user_task_stats",
                column: "user_id",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
