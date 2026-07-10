namespace ERMS.Domain.Entities;

public class Approval
{
    public int ApprovalId { get; set; }              

    public int RequestId { get; set; }               
    public Request Request { get; set; } = null!;

    public int ApproverId { get; set; }              
    public User Approver { get; set; } = null!;

    public string Decision { get; set; } = string.Empty;  
    public string? Comment { get; set; }             

    public DateTime DecidedAt { get; set; }
}