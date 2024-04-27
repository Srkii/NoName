using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using backend.Entities;
using backend.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.DTO;

namespace backend.SignalR
{
    [Authorize]
    public class NotificationsHub : Hub<INotificationsHub>
    {
        public readonly IDictionary<string, HashSet<string>> _userConnections = new Dictionary<string, HashSet<string>>();
        private readonly DataContext _context;
        public NotificationsHub(DataContext context){
            _context = context;
        }
        public override async Task OnConnectedAsync()
        {
            var userIdClaim = Context.User.FindFirst(ClaimTypes.NameIdentifier);
            var httpContext = Context.GetHttpContext();
            int userId = Convert.ToInt32(userIdClaim.Value);
            await Groups.AddToGroupAsync(Context.ConnectionId,Context.UserIdentifier);
            
            var notifications = await _context.Notifications.Where(x=>x.reciever_id==userId && x.read==false).ToListAsync();

            if (!_userConnections.ContainsKey(userId.ToString()))
            {
                _userConnections[userId.ToString()] = new HashSet<string>();
            }

            _userConnections[userId.ToString()].Add(Context.ConnectionId);
            if(notifications.Count>0) await Clients.Group(userId.ToString()).newNotifications();
            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.UserIdentifier;
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                connections.Remove(Context.ConnectionId);
                if (connections.Count == 0)
                {
                    _userConnections.Remove(userId.ToString());
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task invokeGetNotifications(){
            var userId = Context.UserIdentifier;

            var notifications = await _context.Notifications
            .Where(x=>x.reciever_id.ToString()==userId && x.read==false)
            .OrderByDescending(x=>x.dateTime)
            .Select(notification => new NotificationDto
            {
                Id = notification.Id,
                task_id = notification.task_id,
                Task = notification.Task,
                project_id = notification.project_id,
                Project = notification.Project,
                reciever_id = notification.reciever_id,
                Reciever = notification.Reciever,
                sender_id = notification.sender_id,
                Sender = notification.Sender,
                dateTime = notification.dateTime,
                Type = notification.Type,
                read = notification.read

            })
            .Take(10)
            .ToListAsync();
            await Clients.Caller.recieveNotifications(notifications);
        }
        public async Task invokeGetAllNotifications(){
            var userId = Context.UserIdentifier;

            var notifications = await _context.Notifications
            .Where(x=>x.reciever_id.ToString()==userId)
            .OrderByDescending(x=>x.dateTime)
            .Select(notification => new NotificationDto{
                Id = notification.Id,
                task_id = notification.task_id,
                Task = notification.Task,
                project_id = notification.project_id,
                Project = notification.Project,
                reciever_id = notification.reciever_id,
                Reciever = notification.Reciever,
                sender_id = notification.sender_id,
                Sender = notification.Sender,
                dateTime = notification.dateTime,
                Type = notification.Type,
                read = notification.read
            })
            .ToListAsync();

            await Clients.Caller.recieveAllNotifications(notifications);
        }

        public async Task readNotifications(List<int> notifications){
            foreach(int i in notifications){
                var _notif = await _context.Notifications.FirstOrDefaultAsync(x=>x.Id == i);
                _notif.read=true;
            }
            await _context.SaveChangesAsync();
        }
    }

}
