using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SCIS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class HospSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HospitalSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataRequestEndpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PatientEndpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ObservationEndpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ConditionEndpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MedicationEndpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DiagnosticReportEndpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ProcedureEndpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EncounterEndpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AllergyIntoleranceEndpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ImmunizationEndpoint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ApiKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AuthToken = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDataRequestEndpointValid = table.Column<bool>(type: "boolean", nullable: false),
                    IsPatientEndpointValid = table.Column<bool>(type: "boolean", nullable: false),
                    IsObservationEndpointValid = table.Column<bool>(type: "boolean", nullable: false),
                    IsConditionEndpointValid = table.Column<bool>(type: "boolean", nullable: false),
                    IsMedicationEndpointValid = table.Column<bool>(type: "boolean", nullable: false),
                    IsDiagnosticReportEndpointValid = table.Column<bool>(type: "boolean", nullable: false),
                    IsProcedureEndpointValid = table.Column<bool>(type: "boolean", nullable: false),
                    IsEncounterEndpointValid = table.Column<bool>(type: "boolean", nullable: false),
                    IsAllergyIntoleranceEndpointValid = table.Column<bool>(type: "boolean", nullable: false),
                    IsImmunizationEndpointValid = table.Column<bool>(type: "boolean", nullable: false),
                    LastValidationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastValidationError = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HospitalSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HospitalSettings_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HospitalSettings_HospitalId",
                table: "HospitalSettings",
                column: "HospitalId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HospitalSettings");
        }
    }
}
