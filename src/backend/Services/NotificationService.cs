
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

        public async Task TriggerNotification(int task_id,int sender_id,int type){
            
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
                };
                await _context.Notifications.AddAsync(notification);
                await _hubContext.Clients.Group(Users[i].ToString()).Notify();
                await _context.SaveChangesAsync();
            }
        }
        public async Task<List<int>> GetUsersForTaskNotification(int taskId)
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
/*
    u sustini ovo ti javi da imas notifikaciju i pojavi ti se crvena tackica na zvoncetu
    ti kliknes zvonce i ono invoke-uje sa fronta getter za notifikacije
    koje onda disoplay-uje u onom malom prozorcetu
    ->to prozorce posle moze da se prosiri u novi ceo component da listas kroz sve redom notifikacije
    ->a u njemu ce da stoje samo neprocitane
*/