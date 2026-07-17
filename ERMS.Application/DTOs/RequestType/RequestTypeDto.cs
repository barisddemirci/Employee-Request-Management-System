namespace ERMS.Application.DTOs.RequestType;

public class RequestTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool RequiresApproval { get; set; }
    public bool IsActive { get; set; }
}