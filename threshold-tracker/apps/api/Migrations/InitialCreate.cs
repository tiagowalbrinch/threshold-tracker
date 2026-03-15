using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThresholdTracker.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "maps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    record = table.Column<int>(type: "integer", nullable: true),
                    threshold = table.Column<int>(type: "integer", nullable: false),
                    current_score = table.Column<int>(type: "integer", nullable: true),
                    last_updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_maps", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "score_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MapId = table.Column<Guid>(type: "uuid", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_score_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_score_entries_maps_MapId",
                        column: x => x.MapId,
                        principalTable: "maps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_score_entries_map_id_created_at",
                table: "score_entries",
                columns: new[] { "MapId", "created_at" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "score_entries");

            migrationBuilder.DropTable(
                name: "maps");
        }
    }
}

