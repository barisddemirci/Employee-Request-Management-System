namespace ERMS.Application.DTOs.Requests;

public class CreateRequestDto
{
    public int RequestTypeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? Amount { get; set; }
    public string Priority { get; set; } = "Normal";
    public bool SaveAsDraft { get; set; }
}