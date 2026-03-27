using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThresholdTracker.Migrations
{
    /// <inheritdoc />
    public partial class GlobalTaskCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "aim_tasks",
                columns: table => new
                {
                    aimlabs_task_id = table.Column<string>(type: "text", nullable: false),
                    task_name = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    first_seen_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_aim_tasks", x => x.aimlabs_task_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS aim_tasks");
        }
    }
}
