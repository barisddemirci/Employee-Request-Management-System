namespace ERMS.Application.DTOs.Requests;

public class RequestDetailDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? Amount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string RequesterName { get; set; } = string.Empty;

    public List<RequestCommentDto> Comments { get; set; } = new();
    public List<RequestHistoryDto> History { get; set; } = new();
}