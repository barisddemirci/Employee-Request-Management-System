namespace ERMS.Application.DTOs.Requests;

public class RequestResponseDto
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
    public string RequesterName { get; set; } = string.Empty;  // "Ahmet Yılmaz" gibi okunabilir isim
}