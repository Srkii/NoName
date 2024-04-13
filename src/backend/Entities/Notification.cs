#nullable enable
namespace backend.Entities
{
    public enum NotificationType{
        Attachment,//attachment i comment samo na taskovima postoje
        Comment,
        TaskAssignment,
        ProjectAssignment,
    }
    public class Notification
    {
        public int Id{get;set;}
        public int? task_project_id{get;set;}
        public int reciever_id{get;set;}
        public int sender_id{get;set;}
        public DateTime dateTime{get;set;}
        public NotificationType Type{get;set;}
        public bool read{get;set;}//na osnovu ovoga izvlacimo notifikacije, ako je procitana onda ne treba da se pojavljuje...ili mozda dodatni kriterijum vreme...
        public string? sender_first_name{get;set;}
        public string? sender_last_name{get;set;}

    }
}