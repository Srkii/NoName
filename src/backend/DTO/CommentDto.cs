using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class CommentDto
    {
        public int Id {get; set;}
        public int TaskId {get; set;}
        [StringLength(1024, ErrorMessage = "Comment is too short or too long", MinimumLength = 1)]
        public string Content {get; set;}
        public int SenderId{get;set;}
        public DateTime MessageSent { get; set; } = DateTime.UtcNow.AddHours(2);
        public string SenderFirstName {get; set;}
        public string SenderLastName {get; set;}
         public string FileUrl {get; set;}
        public string AppUserPicUrl {get; set;}
        public bool Edited { get; set; }
    }
}
