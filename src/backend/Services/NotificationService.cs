using backend.Data;
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
            var sender = await _context.Users.FindAsync(sender_id);
            var task = await _context.ProjectTasks.FindAsync(task_id);
            Users.Remove(sender_id);
            for(int i=0;i<Users.Count;i++){
                Notification notification = new Notification{
                    reciever_id = Users[i],
                    sender_id = sender_id,
                    task_id=task_id,
                    Task = task,
                    Type = type,//1 attachment, 2 comment, 3 novi task, 4 novi projekat, 5 interakcija sa taskom
                    Sender=sender,
                    dateTime = DateTime.Now,
                    read=false,
                };
                await _context.Notifications.AddAsync(notification);
                await _hubContext.Clients.Group(Users[i].ToString()).Notify();
                await _context.SaveChangesAsync();
            }
        }
        public async Task TriggerAssignmentNotification(int task_project_id,int sender_Id,NotificationType type){//ovo ce useru da javlja da je assign-ovan na neki task ili projekat
            //na osnovu tipa assignment-a znacemo da li je projekat ili task
            //tako ce frontend komponenta znati na koji tab da ide i sta da otvara.
            List<int> users_list = new List<int>();
            var sender = await _context.Users.FindAsync(sender_Id);
            if(type == NotificationType.TaskAssignment){//novi task kreiran
                var tsk = await _context.ProjectTasks.FindAsync(task_project_id);
                var user = await _context.Users.FirstOrDefaultAsync(x=>x.Id == tsk.AppUserId);
                users_list.Add(user.Id);//task assignee
                users_list.Remove(sender_Id);
                var task = await _context.ProjectTasks.FirstOrDefaultAsync(x=>x.Id == task_project_id);//nadji task
                foreach(int i in users_list){
                    Notification notification = new Notification{
                        reciever_id = i,
                        sender_id = sender_Id,
                        Sender=sender,
                        Type = type,
                        dateTime = DateTime.Now,
                        read=false,
                    };
                    await _context.Notifications.AddAsync(notification);
                    await _hubContext.Clients.Group(i.ToString()).Notify();
                }
            }else if(type == NotificationType.ProjectAssignment){//novi projekat
                var users = await _context.ProjectMembers.Where(x=> x.ProjectId == task_project_id).Select(x=>x.AppUserId).ToListAsync();
                users_list.AddRange(users);//project members
                users_list.Remove(sender_Id);
                var project = await _context.Projects.FirstOrDefaultAsync(x => x.Id == task_project_id);
                foreach(int i in users_list){
                Notification notification = new Notification{
                    reciever_id = i,
                    sender_id = sender_Id,
                    project_id=task_project_id,
                    Project = project,
                    Sender=sender,
                    Type = type,
                    dateTime = DateTime.Now,
                    read=false,
                };
                await _context.Notifications.AddAsync(notification);
                await _hubContext.Clients.Group(i.ToString()).Notify();
            }
            }
            foreach(int i in users_list){
                Notification notification = new Notification{
                    reciever_id = i,
                    sender_id = sender_Id,
                    Sender=sender,
                    Type = type,
                    dateTime = DateTime.Now,
                    read=false,
                };
                await _context.Notifications.AddAsync(notification);
                await _hubContext.Clients.Group(i.ToString()).Notify();
            }
            await _context.SaveChangesAsync();

        }
        public async Task<List<int>> GetUsersForTaskNotification(int taskId, int initiatorId)
        {
            var users = new List<int>();

            // Get the project ID from the task
            var projectId = await _context.ProjectTasks.Where(t => t.Id == taskId).Select(t => t.ProjectId).FirstOrDefaultAsync();

            // Include all project owners
            var projectOwners = await _context.ProjectMembers
                .Where(x => x.ProjectId == projectId && x.ProjectRole == ProjectRole.ProjectOwner)
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
