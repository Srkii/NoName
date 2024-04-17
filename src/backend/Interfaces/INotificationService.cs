using backend.Entities;
namespace backend.Interfaces
{
    public interface INotificationService
    {
        public Task TriggerNotification(int task_id, int sender_id, NotificationType type);
        public Task TriggerAssignmentNotification(int task_project_id,int sender_id,NotificationType type);
    }
}