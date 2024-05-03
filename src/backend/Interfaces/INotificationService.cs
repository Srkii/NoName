using backend.Entities;
namespace backend.Interfaces
{
    public interface INotificationService
    {
        public Task TriggerNotification(int task_id, int sender_id,NotificationType type);//comment/attachment notifications
        //public Task TriggerProjectNotification(int project_id,int reciever_id);//project notifications
        public Task TriggerTaskNotification(int task_id,int sender_id);//task notifications
    }
}

