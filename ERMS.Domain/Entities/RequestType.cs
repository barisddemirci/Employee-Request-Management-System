namespace ERMS.Domain.Entities;

public class RequestType
{
    public int RequestTypeId { get; set; }          

    public string Name { get; set; } = string.Empty;
    public bool RequiresApproval { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Request> Requests { get; set; } = new List<Request>();
}