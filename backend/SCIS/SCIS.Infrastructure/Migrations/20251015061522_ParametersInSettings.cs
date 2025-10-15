using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SCIS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ParametersInSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AllergyIntoleranceEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ConditionEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DataRequestEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiagnosticReportEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EncounterEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImmunizationEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MedicationEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ObservationEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProcedureEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllergyIntoleranceEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "ConditionEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "DataRequestEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "DiagnosticReportEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "EncounterEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "ImmunizationEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "MedicationEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "ObservationEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "PatientEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "ProcedureEndpointParameters",
                table: "HospitalSettings");
        }
    }
}
