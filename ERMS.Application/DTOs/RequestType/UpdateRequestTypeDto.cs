namespace ERMS.Application.DTOs.RequestType;

public class UpdateRequestTypeDto
{
    public string Name { get; set; } = string.Empty;
    public bool RequiresApproval { get; set; }
    public bool IsActive { get; set; }
}