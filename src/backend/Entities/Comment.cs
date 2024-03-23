﻿namespace backend.Entities;

public class Comment
{
    public int Id {get; set;}
    public int TaskId {get; set;}
    public string Content {get; set;}
    public DateTime MessageSent {get; set;} = DateTime.UtcNow;
    public string SenderFirstName {get; set;}
    public string SenderLastName {get; set;}
}
