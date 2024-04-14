using backend.Entities;

namespace backend.Interfaces
{
    public interface INotificationsHub
    {
        Task Notify();//ova je glavna, ova pusta notifikaciju korisnicima....
        Task newNotifications();
        Task recieveNotifications(List<Notification> notifications);
        Task InvokeGetNotifications();
        Task InvokeGetAllNotifications();
        Task recieveAllNotifications(List<Notification> notifications);
    }
}
