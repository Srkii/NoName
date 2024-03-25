using System.ComponentModel.DataAnnotations;

namespace backend.DTO.UserDTOs
{
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }
        
        [StringLength(7, ErrorMessage = "Password must have at least 7 characters", MinimumLength = 7)]
        public string NewPassword { get; set; }
    }
}