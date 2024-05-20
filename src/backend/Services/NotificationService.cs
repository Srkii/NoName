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

        public async Task TriggerNotification(int task_id,int sender_id,int comment_id,NotificationType type){//ova je za task-ove , tj komentare i attachmente, poraditi na semantici...
            
            var Users = await GetUsersForTaskNotification(task_id, sender_id);
            var sender = await _context.Users.FirstOrDefaultAsync(x => x.Id == sender_id);
            var task = await _context.ProjectTasks.FirstOrDefaultAsync(x=>x.Id == task_id);
            Users.Remove(sender_id);
            for(int i=0;i<Users.Count;i++){
                Notification notification = new Notification{
                    reciever_id = Users[i],
                    sender_id = sender_id,
                    comment_id = comment_id,
                    task_id=task_id,
                    Type = type,//1 attachment, 2 comment, 3 novi task, 4 novi projekat
                    dateTime = DateTime.Now,
                    read=false,
                    originArchived = false
                };
                await _context.Notifications.AddAsync(notification);
                await _context.SaveChangesAsync();
                await _hubContext.Clients.Group(Users[i].ToString())
                    .Notify(
                         new NotificationDto{
                            Task = notification.Task,
                            Comment = notification.Comment,
                            Project = notification.Project,
                            Sender = notification.Sender,
                            dateTime = notification.dateTime,
                            Type = notification.Type,
                            read = notification.read
                         });
            }
        }

        public async Task TriggerTaskNotification(int task_id,int creator_id){
            //zadatak ove funkcije jeste da posalje notifikaciju korisniku kojem je dodeljen zadatak ili projekat
            var task = await _context.ProjectTasks.FirstOrDefaultAsync(x=>x.Id == task_id);
            var reciever = await _context.Users.FirstOrDefaultAsync(x=>x.Id == task.AppUserId);
            if(reciever==null) throw new Exception("THIS BITCH EMPTY");
            Notification notification = new Notification{
                reciever_id = reciever.Id,
                task_id=task.Id,
                Type = NotificationType.TaskAssignment,//1 attachment, 2 comment, 3 novi task, 4 novi projekat
                dateTime = DateTime.Now,
                read=false,
                originArchived = false
            };
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.Group(reciever.Id.ToString())
                    .Notify(
                         new NotificationDto{
                            Comment = notification.Comment,
                            Task = notification.Task,
                            Project = notification.Project,
                            Sender = notification.Sender,
                            dateTime = notification.dateTime,
                            Type = notification.Type,
                            read = notification.read
                         });
        }
        public async Task TriggerProjectNotification(int project_id,int reciever_id){
            var project = await _context.Projects.FirstOrDefaultAsync(x => x.Id == project_id);
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == reciever_id);
            if (project == null || user == null)
            {
                throw new Exception("Project or User not found");
            }
            Notification notification = new Notification{
                reciever_id = user.Id,
                project_id = project.Id,
                Type=NotificationType.ProjectAssignment,
                dateTime = DateTime.Now,
                read=false,
                originArchived = false
            };
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.Group(reciever_id.ToString())
                    .Notify(
                         new NotificationDto{
                            Comment = notification.Comment,
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
                .Union(_context.Comments.Where(a => a.TaskId == taskId).Select(a => a.SenderId))
                .ToListAsync();
            users.AddRange(commentersAndUploaders);

            // Exclude the initiator and remove duplicates
            users = users.Where(u => u != initiatorId).Distinct().ToList();

            return users;
        }
        public async void ArchiveRelatedTaskNotifications(int id){
            var notifications = await  _context.Notifications.Where(x => x.task_id == id).ToListAsync();
            foreach(Notification n in notifications){
                n.originArchived = true;
            }
            await _context.SaveChangesAsync();
        }
        public async void ArchiveRelatedProjectNotifications(int id){
            var notifications = await  _context.Notifications.Where(x => x.project_id == id || x.Task.ProjectId == id).ToListAsync();
            foreach(Notification n in notifications){
                n.originArchived = true;
            }
            await _context.SaveChangesAsync();
        }
        public async void DeArchiveRelatedTaskNotifications(int id){
            var notifications = await  _context.Notifications.Where(x => x.task_id == id).ToListAsync();
            foreach(Notification n in notifications){
                n.originArchived = false;
            }
            await _context.SaveChangesAsync();
        }
        public async void DeArchiveRelatedProjectNotifications(int id){
            var notifications = await  _context.Notifications.Where(x => x.project_id == id || x.Task.ProjectId == id).ToListAsync();
            foreach(Notification n in notifications){
                n.originArchived = false;
            }
            await _context.SaveChangesAsync();
        }

    }
}
