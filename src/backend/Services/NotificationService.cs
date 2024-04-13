
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
            
            var Users = await GetUsersForTaskNotification(task_id);
            var sender = await _context.Users.FindAsync(sender_id);
            Users.Remove(sender_id);
            for(int i=0;i<Users.Count;i++){
                Notification notification = new Notification{
                    reciever_id = Users[i],
                    sender_id = sender_id,
                    Type = type,//1 attachment, 2 comment, 3 novi task, 4 novi projekat, 5 interakcija sa taskom
                    dateTime = DateTime.Now,
                    read=false,
                    sender_first_name = sender.FirstName,
                    sender_last_name = sender.LastName,
                    task_project_id = task_id
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
                var users = await _context.Users.FirstOrDefaultAsync(x=>x.Id == tsk.AppUserId);
                users_list.Add(users.Id);
            }else if(type == NotificationType.ProjectAssignment){
                var users = await _context.ProjectMembers.Where(x=> x.ProjectId == task_project_id).Select(x=>x.AppUserId).ToListAsync();
                users_list.AddRange(users);
            }
            users_list.Remove(sender_Id);
            foreach(int i in users_list){
                Notification notification = new Notification{
                    reciever_id = i,
                    sender_id = sender_Id,
                    Type = type,
                    dateTime = DateTime.Now,
                    read=false,
                    sender_first_name = sender.FirstName,
                    sender_last_name = sender.LastName,
                    task_project_id = task_project_id,//ovo bi kao trebalo da radi idfk..
                };
                await _context.Notifications.AddAsync(notification);
                await _hubContext.Clients.Group(i.ToString()).Notify();
                await _context.SaveChangesAsync();
            }

        }
        public async Task<List<int>> GetUsersForTaskNotification(int taskId)//query za izvlacenje ljudi zainteresovanih za neki task...
        {
            var users = new List<int>();

            // Get assignee (if any)
            var assignee = await _context.Users.FirstOrDefaultAsync(u => u.Id == taskId);
            if (assignee != null)
            {
                users.Add(assignee.Id);
            }

            // Get project owner(s)
            var project = await _context.ProjectTasks.Where(t => t.Id == taskId).Select(t => t.Project).FirstOrDefaultAsync();
            if (project != null)
            {
                var owners = await _context.ProjectMembers.Where(x=>x.ProjectId == project.Id && x.ProjectRole==ProjectRole.ProjectOwner).Select(x=>x.AppUserId).ToListAsync();
                users.AddRange(owners);
            }

            // Get commenters
            var commenters = await _context.Comments.Where(c => c.TaskId == taskId).Select(c => c.SenderId).ToListAsync();
            users.AddRange(commenters.Distinct());

            // Get attachment uploaders
            var uploaders = await _context.Attachments.Where(a => a.task_id == taskId).Select(a => a.sender_id).ToListAsync();
            users.AddRange(uploaders.Distinct());

            // Remove duplicates and return
            return users.Distinct().ToList();
        }
    }
}