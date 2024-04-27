using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class ChangeTaskInfoDto
    {
       [Required]
        public int Id { get; set; }

        public string TaskName { get; set; }

        public string Description { get; set; }
        public int? AppUserId { get; set; }

        public DateTime? DueDate { get; set; }

        public int ProjectId { get; set; }
        public int SectionId { get; set; }
    }
}
