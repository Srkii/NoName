using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class TaskScheduleDto
    {
        [Required]
        public int Id { get; set; }
        public DateTime? StartDate { get; set; } //zasto je nullable?
        public DateTime? EndDate { get; set; }
        public int AppUserId { get; set; }
        public int ProjectId { get; set; }
    }
}
