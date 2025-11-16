using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SCIS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MinimizeHospitalRegRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactPersonEmail",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "ContactPersonName",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "ContactPersonPhone",
                table: "Hospitals");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactPersonEmail",
                table: "Hospitals",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPersonName",
                table: "Hospitals",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPersonPhone",
                table: "Hospitals",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }
    }
}
