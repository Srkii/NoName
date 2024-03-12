namespace backend.Entities
{
    public enum ProjectStatus
    {
        Proposed,
        InProgress,
        Completed,
        Archived
    }
    public enum Priority
    {
        Low,
        Medium,
        High
    }

    public class Project
    {
        public int Id { get; set; }
        public int? ParentId { get; set; }
        public string ProjectName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectStatus ProjectStatus { get; set; }
        public Priority Priority { get; set; }
    }
}


