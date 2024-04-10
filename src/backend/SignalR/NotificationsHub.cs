using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using backend.Entities;
using backend.Data;
using System.IdentityModel.Tokens.Jwt;

namespace backend.SignalR
{
    [Authorize]
    public class NotificationsHub : Hub<INotificationsHub>
    {
        private readonly IDictionary<string, HashSet<string>> _userConnections = new Dictionary<string, HashSet<string>>();
        private readonly DataContext _context;
        public NotificationsHub(DataContext context){
            _context = context;
         }
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            var httpContext = Context.GetHttpContext();
            await Groups.AddToGroupAsync(Context.ConnectionId,Context.UserIdentifier);//pravimo grupu za LIVE komunikaciju
            var notifications = await _context.Notifications.Where(x=>x.UserId.ToString()==userId && x.read==false).ToListAsync();
            if (!_userConnections.ContainsKey(userId))
            {
                _userConnections[userId] = new HashSet<string>();//ovo ce da proverava da li su useri online, moguce slati notifikacije iz baze
            }
            _userConnections[userId].Add(Context.ConnectionId);
            if(notifications.Count>0) await Clients.Group(userId).newNotifications();//salje sve nove notifikacije korisniku na front ukoliko ih ima
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
                    _userConnections.Remove(userId);//izbacuje iz liste LIVE usera
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task invokeGetNotifications(){
            var userId = Context.UserIdentifier;
            var httpContext = Context.GetHttpContext();
            var notifications = await _context.Notifications.Where(x=>x.UserId.ToString()==userId && x.read==false).ToListAsync();
            await Clients.Caller.sendNotifications(notifications);
        }
    }

}
