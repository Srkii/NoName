using System.ComponentModel.DataAnnotations;
using backend.Entities;

namespace backend.DTO
{
    public class ProjectDto
    {
        public int AppUserId { get; set; }
        public int ProjectId { get; set;}

        [StringLength(1, ErrorMessage = "Project name must be at least 1 characters long", MinimumLength = 1)]
        public string ProjectName { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectStatus ProjectStatus { get; set; }
    }
}
