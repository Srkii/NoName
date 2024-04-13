using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using backend.Interfaces;
using Microsoft.EntityFrameworkCore;
using backend.Entities;
using backend.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

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
            await Groups.AddToGroupAsync(Context.ConnectionId,Context.UserIdentifier);//pravimo grupu za LIVE komunikaciju
            
            var notifications = await _context.Notifications.Where(x=>x.reciever_id==userId && x.read==false).ToListAsync();//kako sam ja mogao ovo da uradim wtf

            if (!_userConnections.ContainsKey(userId.ToString()))
            {
                _userConnections[userId.ToString()] = new HashSet<string>();
            }

            _userConnections[userId.ToString()].Add(Context.ConnectionId);
            if(notifications.Count>0) await Clients.Group(userId.ToString()).newNotifications();//salje sve nove notifikacije korisniku na front ukoliko ih ima
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
                    _userConnections.Remove(userId.ToString());//izbacuje iz liste LIVE usera
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task invokeGetNotifications(){
            var userId = Context.UserIdentifier;//i dalje nzm kako je ovo isto sa id-em u bazi
            var httpContext = Context.GetHttpContext();
            var notifications = await _context.Notifications.Where(x=>x.reciever_id.ToString()==userId && x.read==false).ToListAsync();//po id-u primaoca izvlacimo kome ide notif.
            await Clients.Caller.recieveNotifications(notifications);
        }
    }

}
