using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Entities;
#nullable enable
namespace backend.DTO
{
    public class NotificationDto
    {
        public int Id{get;set;}
        public int? task_id{get;set;}
        public ProjectTask? Task{get;set;}
        public int? project_id{get;set;}
        public Project? Project{get;set;}
        public int sender_id{get;set;}
        public AppUser? Sender{get;set;}
        public int reciever_id{get;set;}
        public AppUser? Reciever{get;set;}
        public DateTime dateTime{get;set;}
        public NotificationType Type{get;set;}
        public bool read{get;set;} 
    }
}