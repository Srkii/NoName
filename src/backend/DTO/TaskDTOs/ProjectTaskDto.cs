using backend.Entities;
using TaskStatus = backend.Entities.TaskStatus;

namespace backend.DTO.TaskDTOs
{
    public class ProjectTaskDto
    {
        public int Id { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TaskStatus TaskStatus { get; set; }
        public int AppUserId { get; set; }
        public int ProjectId { get; set; }
    }
}
