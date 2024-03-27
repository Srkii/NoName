namespace backend.Entities
{
    public enum TaskStatus
    {
        Proposed,
        InProgress,
        Completed,
        Archived
    }
    public class ProjectTask
    {
        public int Id { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TaskStatus TaskStatus { get; set; }
        public int ProjectId { get; set; } // foreign key
        public Project Project { get; set; } // navigation
    }
}