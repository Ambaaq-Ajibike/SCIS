using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SCIS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Onboarding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Hospitals",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedByUserId",
                table: "Hospitals",
                type: "uuid",
                nullable: true);

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

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "Hospitals",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "VerificationDocuments",
                table: "Hospitals",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationNotes",
                table: "Hospitals",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "ApprovedByUserId",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "ContactPersonEmail",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "ContactPersonName",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "ContactPersonPhone",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "VerificationDocuments",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "VerificationNotes",
                table: "Hospitals");
        }
    }
}
