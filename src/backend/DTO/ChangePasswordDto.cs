using System.ComponentModel.DataAnnotations;
namespace backend.DTO
{
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
        public string NewPasswordConfirm { get; set; }
        public string FirstName { get; internal set; }
        public string LastName { get; internal set; }
        public string Email { get; internal set; }
    }
}