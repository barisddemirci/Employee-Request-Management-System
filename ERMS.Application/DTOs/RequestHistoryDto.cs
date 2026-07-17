namespace ERMS.Application.DTOs.Requests;

public class RequestHistoryDto
{
    public int Id { get; set; }
    public string ChangedByName { get; set; } = string.Empty;
    public string? OldStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
}