namespace ERMS.Application.DTOs.RequestType;

public class CreateRequestTypeDto
{
    public string Name { get; set; } = string.Empty;
    public bool RequiresApproval { get; set; }
}