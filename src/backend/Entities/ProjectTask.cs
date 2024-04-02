namespace backend.Entities
{
    public class ProjectTask
    {
        public int Id { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TskStatusId { get; set; } // foreign key
        public TskStatus TskStatus { get; set; } // navigation
        public int ProjectId { get; set; } // foreign key
        public Project Project { get; set; } // navigation
        public int? ProjectSectionId { get; set; } // foreign key to ProjectSection (nullable)
        public ProjectSection ProjectSection { get; set; } // navigation property
        public int? AppUserId { get; set; } // Added line
        public AppUser AppUser { get; set; } 
    }
}