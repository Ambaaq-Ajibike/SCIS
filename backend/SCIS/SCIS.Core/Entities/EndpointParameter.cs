using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class EndpointParameter
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "string", "number", "boolean", "date"
    public string Location { get; set; } = string.Empty; // "query", "path", "body", "header"
    public bool Required { get; set; } = false;
    public string? DefaultValue { get; set; }
    public string? Description { get; set; }
    public string? Example { get; set; }
}
