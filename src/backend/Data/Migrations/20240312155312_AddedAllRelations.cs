using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedAllRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "EndDate_GreaterThanOrEqual_StartDate",
                table: "ProjectTasks");

            migrationBuilder.DropCheckConstraint(
                name: "EndDate_GreaterThanOrEqual_StartDate",
                table: "Projects");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "EndDate_GreaterThanOrEqual_StartDate",
                table: "ProjectTasks",
                sql: "EndDate >= StartDate");

            migrationBuilder.AddCheckConstraint(
                name: "EndDate_GreaterThanOrEqual_StartDate",
                table: "Projects",
                sql: "EndDate >= StartDate");
        }
    }
}
