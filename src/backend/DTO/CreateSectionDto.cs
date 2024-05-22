using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class CreateSectionDto
    {
        [StringLength(1, ErrorMessage = "Section name must be at least 1 characters long", MinimumLength = 1)]
        public string SectionName { get; set; }
        public int ProjectId { get; set; }
    }
}
