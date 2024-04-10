using backend.Entities;

namespace backend.Interfaces
{
    public interface INotificationsHub
    {
        Task newNotifications();
        Task NotifyAttachment();
        Task sendNotifications(List<Notification> notifications);
    }
}
