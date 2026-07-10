namespace ERMS.Domain.Entities;

public class RequestComment
{
    public int RequestCommentId { get; set; }              

    public int RequestId { get; set; }              
    public Request Request { get; set; } = null!;

    public int AuthorId { get; set; }                 
    public User Author { get; set; } = null!;

    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}