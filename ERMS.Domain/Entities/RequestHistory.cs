using ERMS.Domain.Enums;

namespace ERMS.Domain.Entities;

public class RequestHistory
{
    public int RequestHistoryId { get; set; }               

    public int RequestId { get; set; }                 
    public Request Request { get; set; } = null!;

    public int ChangedById { get; set; }                
    public User ChangedBy { get; set; } = null!;

    public RequestStatus? OldStatus { get; set; }      
    public RequestStatus NewStatus { get; set; }        

    public DateTime ChangedAt { get; set; }
}