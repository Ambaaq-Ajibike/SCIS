using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SCIS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DataRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovalDate",
                table: "DataRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovingUserId",
                table: "DataRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCrossHospitalRequest",
                table: "DataRequests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "PatientHospitalId",
                table: "DataRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DataRequests_ApprovingUserId",
                table: "DataRequests",
                column: "ApprovingUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DataRequests_PatientHospitalId",
                table: "DataRequests",
                column: "PatientHospitalId");

            migrationBuilder.AddForeignKey(
                name: "FK_DataRequests_Hospitals_PatientHospitalId",
                table: "DataRequests",
                column: "PatientHospitalId",
                principalTable: "Hospitals",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DataRequests_Users_ApprovingUserId",
                table: "DataRequests",
                column: "ApprovingUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DataRequests_Hospitals_PatientHospitalId",
                table: "DataRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_DataRequests_Users_ApprovingUserId",
                table: "DataRequests");

            migrationBuilder.DropIndex(
                name: "IX_DataRequests_ApprovingUserId",
                table: "DataRequests");

            migrationBuilder.DropIndex(
                name: "IX_DataRequests_PatientHospitalId",
                table: "DataRequests");

            migrationBuilder.DropColumn(
                name: "ApprovalDate",
                table: "DataRequests");

            migrationBuilder.DropColumn(
                name: "ApprovingUserId",
                table: "DataRequests");

            migrationBuilder.DropColumn(
                name: "IsCrossHospitalRequest",
                table: "DataRequests");

            migrationBuilder.DropColumn(
                name: "PatientHospitalId",
                table: "DataRequests");
        }
    }
}
