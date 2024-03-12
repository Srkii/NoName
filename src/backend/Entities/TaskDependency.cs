namespace backend.Entities
{
    public class TaskDependency
    { //set composite key
        public int TaskId { get; set; } // task koji "gledam"
        public int DependencyTaskId  { get; set; } // task od kog zavisti TaskId (kojeg "gledam")
    }
}