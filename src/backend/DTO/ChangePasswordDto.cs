using System.ComponentModel.DataAnnotations;
namespace backend.DTO
{
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}