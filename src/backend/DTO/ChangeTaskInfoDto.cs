using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class ChangeTaskInfoDto
    {
        [Required]
        public int Id { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public int? TaskStatusId { get; set; } //nece raditi mora da se menja
        public int AppUserId { get; set; }
        public int ProjectId { get; set; }
    }
}
