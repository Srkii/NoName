using backend.Entities;

namespace backend.DTO
{
    public class ProjectDto
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
