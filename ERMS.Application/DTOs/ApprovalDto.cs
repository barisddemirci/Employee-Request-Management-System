namespace ERMS.Application.DTOs.Requests;

public class ApprovalDto
{
    public int Id { get; set; }
    public string DecidedByName { get; set; } = string.Empty;
    public string Decision { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime DecidedAt { get; set; }
}