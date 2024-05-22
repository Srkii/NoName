using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class ProjectTaskDto
    {
        public int Id { get; set; }
        public int CreatorId{get;set;}

        [StringLength(100, ErrorMessage = "Task name must be at least 1 characters long", MinimumLength = 1)]
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
