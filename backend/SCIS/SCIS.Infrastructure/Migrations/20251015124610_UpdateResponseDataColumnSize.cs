using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SCIS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateResponseDataColumnSize : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Change ResponseData column from varchar(1000) to text to support larger FHIR responses
            migrationBuilder.AlterColumn<string>(
                name: "ResponseData",
                table: "DataRequests",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert ResponseData column back to varchar(1000)
            migrationBuilder.AlterColumn<string>(
                name: "ResponseData",
                table: "DataRequests",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
