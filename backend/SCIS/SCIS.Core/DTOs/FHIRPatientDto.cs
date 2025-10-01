namespace SCIS.Core.DTOs;

public class FHIRPatientDto
{
    public string ResourceType { get; set; } = "Patient";
    public string Id { get; set; } = string.Empty;
    public List<FHIRIdentifier> Identifier { get; set; } = new();
    public bool Active { get; set; } = true;
    public List<FHIRName> Name { get; set; } = new();
    public string? Gender { get; set; }
    public string? BirthDate { get; set; }
    public List<FHIRContactPoint>? Telecom { get; set; }
    public List<FHIRAddress>? Address { get; set; }
}

public class FHIRIdentifier
{
    public string Use { get; set; } = "usual";
    public string Type { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class FHIRName
{
    public string Use { get; set; } = "official";
    public List<string> Given { get; set; } = new();
    public string Family { get; set; } = string.Empty;
}

public class FHIRContactPoint
{
    public string System { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Use { get; set; } = string.Empty;
}

public class FHIRAddress
{
    public List<string> Line { get; set; } = new();
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
}
