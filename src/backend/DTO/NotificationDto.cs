using backend.Entities;
#nullable enable
namespace backend.DTO
{
    public class NotificationDto
    {
        //doraditi, ne salji celog usera ovako ...~maksim
        public int Id{get;set;}
        public Comment? Comment{get;set;}
        public ProjectTask? Task{get;set;}
        public Project? Project{get;set;}
        public AppUser? Sender{get;set;}
        public AppUser? Reciever{get;set;}
        public DateTime dateTime{get;set;}
        public NotificationType Type{get;set;}
        public bool read{get;set;} 
    }
}