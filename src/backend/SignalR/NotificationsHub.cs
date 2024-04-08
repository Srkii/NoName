using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using backend.Data;
namespace backend.SignalR
{
    [Authorize]
    public class NotificationsHub : Hub
    {   
        // Add methods to send notifications to clients
        public async Task NotifyAttachmentUploaded(string userId, string message)
        {
            await Clients.User(userId).SendAsync("AttachmentUploaded", message);
        }

        // Similarly, add methods for other notifications
        // Example: Notify for new comment, ovo za sad i ne mora jer nemamo komentare implementirane..
        public async Task NotifyNewComment(string userId, string message)
        {
            await Clients.User(userId).SendAsync("NewComment", message);
        }
    }
}