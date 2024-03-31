using backend.Entities;

namespace backend.DTO
{
    public class ProjectTaskDto
    {
        public int Id { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TaskStatusId { get; set; }
        public int AppUserId { get; set; }
        public int ProjectId { get; set; }
        public int? ProjectSectionId { get; set; }
    }
}
