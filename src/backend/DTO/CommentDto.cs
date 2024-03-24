namespace backend.DTO;

public class CommentDto
{
    public int TaskId {get; set;}
    public string Content {get; set;}
    public int SenderId;
    public string SenderFirstName {get; set;}
    public string SenderLastName {get; set;}
}
