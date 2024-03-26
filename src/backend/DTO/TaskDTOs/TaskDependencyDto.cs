namespace backend.DTO.TaskDTOs
{
    public class TaskDependencyDto
    {
        public int TaskId { get; set; }
        public int DependencyTaskId  { get; set; }
        public int AppUserId { get; set;}
        public int ProjectId { get; set;}
    }
}
