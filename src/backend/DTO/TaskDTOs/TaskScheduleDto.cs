using System.ComponentModel.DataAnnotations;

namespace backend.DTO.TaskDTOs
{
    public class TaskScheduleDto
    {
        [Required]
        public int Id { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
