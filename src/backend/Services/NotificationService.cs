using backend.Data;
using backend.DTO;
using backend.Entities;
using backend.Interfaces;
using backend.SignalR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class NotificationService:INotificationService
    {
        private readonly IHubContext<NotificationsHub,INotificationsHub> _hubContext;
        private readonly DataContext _context;
        public NotificationService(IHubContext<NotificationsHub,INotificationsHub> hubContext,DataContext context){
            _hubContext = hubContext;
            _context = context;
        }

        public async Task TriggerNotification(int task_id,int sender_id,NotificationType type){//ova je za task-ove , tj komentare i attachmente, poraditi na semantici...
            
            var Users = await GetUsersForTaskNotification(task_id, sender_id);
            var sender = await _context.Users.FirstOrDefaultAsync(x => x.Id == sender_id);
            var task = await _context.ProjectTasks.FirstOrDefaultAsync(x=>x.Id == task_id);
            Users.Remove(sender_id);
            for(int i=0;i<Users.Count;i++){
                Notification notification = new Notification{
                    reciever_id = Users[i],
                    sender_id = sender_id,
                    task_id=task_id,
                    Type = type,//1 attachment, 2 comment, 3 novi task, 4 novi projekat
                    dateTime = DateTime.Now,
                    read=false,
                };
                await _context.Notifications.AddAsync(notification);
                await _context.SaveChangesAsync();
                await _hubContext.Clients.Group(Users[i].ToString())
                    .Notify(
                         new NotificationDto{
                            Task = notification.Task,
                            Project = notification.Project,
                            Sender = notification.Sender,
                            dateTime = notification.dateTime,
                            Type = notification.Type,
                            read = notification.read
                         });
            }
        }

        public async Task TriggerTaskNotification(int task_id,int sender_Id){
            //zadatak ove funkcije jeste da posalje notifikaciju korisniku kojem je dodeljen zadatak ili projekat
            var task = await _context.ProjectTasks.FirstOrDefaultAsync(x=>x.Id == task_id);
            var sender = await _context.Users.FirstOrDefaultAsync(x=>x.Id == sender_Id);
            var reciever = await _context.Users.FirstOrDefaultAsync(x=>x.Id == task.AppUserId);
            Notification notification = new Notification{
                reciever_id = reciever.Id,
                sender_id = sender.Id,
                task_id=task_id,
                Type = NotificationType.TaskAssignment,//1 attachment, 2 comment, 3 novi task, 4 novi projekat
                dateTime = DateTime.Now,
                read=false,
            };
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.Group(reciever.Id.ToString())
                    .Notify(
                         new NotificationDto{
                            Task = notification.Task,
                            Project = notification.Project,
                            Sender = notification.Sender,
                            dateTime = notification.dateTime,
                            Type = notification.Type,
                            read = notification.read
                         });
        }
        public async Task<List<int>> GetUsersForTaskNotification(int taskId, int initiatorId)
        {
            var users = new List<int>();

            // Get the project ID from the task
            var projectId = await _context.ProjectTasks.Where(t => t.Id == taskId).Select(t => t.ProjectId).FirstOrDefaultAsync();

            // Include all project owners
            var projectOwners = await _context.ProjectMembers
                .Where(x => x.ProjectId == projectId && (x.ProjectRole == ProjectRole.ProjectOwner || x.ProjectRole == ProjectRole.ProjectManager))
                .Select(x => x.AppUserId)
                .ToListAsync();
            users.AddRange(projectOwners);

            // Include all project managers
            var projectManagers = await _context.ProjectMembers
                .Where(x => x.ProjectId == projectId && x.ProjectRole == ProjectRole.Manager)
                .Select(x => x.AppUserId)
                .ToListAsync();
            users.AddRange(projectManagers);

            // Get assignee
            var assignee = await _context.ProjectTasks.Where(t => t.Id == taskId).Select(t => t.AppUserId).FirstOrDefaultAsync();
            if (assignee != null) users.Add(assignee.Value);

            // Get commenters and attachment uploaders
            var commentersAndUploaders = await _context.Comments.Where(c => c.TaskId == taskId).Select(c => c.SenderId)
                .Union(_context.Attachments.Where(a => a.task_id == taskId).Select(a => a.sender_id))
                .ToListAsync();
            users.AddRange(commentersAndUploaders);

            // Exclude the initiator and remove duplicates
            users = users.Where(u => u != initiatorId).Distinct().ToList();

            return users;
        }

    }
}
