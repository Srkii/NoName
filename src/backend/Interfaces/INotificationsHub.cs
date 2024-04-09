using backend.Entities;

namespace backend.Interfaces
{
    public interface INotificationsHub
    {
        Task newNotifications(List<Notification> notifications);
        Task NotifyAttachment();
    }
}
