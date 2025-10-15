using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SCIS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnusedParametersInSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllergyIntoleranceEndpoint",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "AllergyIntoleranceEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "ConditionEndpoint",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "ConditionEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "DataRequestEndpoint",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "DataRequestEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "DiagnosticReportEndpoint",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "DiagnosticReportEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "EncounterEndpoint",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "EncounterEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "ImmunizationEndpoint",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "ImmunizationEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "IsAllergyIntoleranceEndpointValid",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "IsConditionEndpointValid",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "IsDataRequestEndpointValid",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "IsDiagnosticReportEndpointValid",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "IsEncounterEndpointValid",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "IsImmunizationEndpointValid",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "IsMedicationEndpointValid",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "IsObservationEndpointValid",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "IsPatientEndpointValid",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "MedicationEndpoint",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "MedicationEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "ObservationEndpoint",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "ObservationEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "PatientEndpoint",
                table: "HospitalSettings");

            migrationBuilder.DropColumn(
                name: "PatientEndpointParameters",
                table: "HospitalSettings");

            migrationBuilder.RenameColumn(
                name: "ProcedureEndpointParameters",
                table: "HospitalSettings",
                newName: "PatientEverythingEndpointParameters");

            migrationBuilder.RenameColumn(
                name: "ProcedureEndpoint",
                table: "HospitalSettings",
                newName: "PatientEverythingEndpoint");

            migrationBuilder.RenameColumn(
                name: "IsProcedureEndpointValid",
                table: "HospitalSettings",
                newName: "IsPatientEverythingEndpointValid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PatientEverythingEndpointParameters",
                table: "HospitalSettings",
                newName: "ProcedureEndpointParameters");

            migrationBuilder.RenameColumn(
                name: "PatientEverythingEndpoint",
                table: "HospitalSettings",
                newName: "ProcedureEndpoint");

            migrationBuilder.RenameColumn(
                name: "IsPatientEverythingEndpointValid",
                table: "HospitalSettings",
                newName: "IsProcedureEndpointValid");

            migrationBuilder.AddColumn<string>(
                name: "AllergyIntoleranceEndpoint",
                table: "HospitalSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AllergyIntoleranceEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ConditionEndpoint",
                table: "HospitalSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ConditionEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DataRequestEndpoint",
                table: "HospitalSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DataRequestEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiagnosticReportEndpoint",
                table: "HospitalSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiagnosticReportEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EncounterEndpoint",
                table: "HospitalSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EncounterEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImmunizationEndpoint",
                table: "HospitalSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImmunizationEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAllergyIntoleranceEndpointValid",
                table: "HospitalSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsConditionEndpointValid",
                table: "HospitalSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDataRequestEndpointValid",
                table: "HospitalSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDiagnosticReportEndpointValid",
                table: "HospitalSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsEncounterEndpointValid",
                table: "HospitalSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsImmunizationEndpointValid",
                table: "HospitalSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMedicationEndpointValid",
                table: "HospitalSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsObservationEndpointValid",
                table: "HospitalSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPatientEndpointValid",
                table: "HospitalSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MedicationEndpoint",
                table: "HospitalSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MedicationEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ObservationEndpoint",
                table: "HospitalSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ObservationEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientEndpoint",
                table: "HospitalSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientEndpointParameters",
                table: "HospitalSettings",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);
        }
    }
}
