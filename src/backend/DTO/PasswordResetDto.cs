using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class PasswordResetDto
    {
        [EmailAddress]
        public string Email { get; set; }
        public string Token { get; set; }
        
        // [StringLength(7, ErrorMessage = "Password must have at least 7 characters", MinimumLength = 7)]
        public string NewPassword{get;set;}
    }
}
