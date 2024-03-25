using System.ComponentModel.DataAnnotations;

namespace backend.DTO.AccountDTOs
{
    public class RegisterDto
    {
        [Required]
        public string FirstName {get; set;}

        [Required]
        public string LastName {get; set;}

        [Required]
        [EmailAddress]
        public string Email{get; set;}

        [Required]
        [StringLength(7, ErrorMessage = "Password must have at least 7 characters", MinimumLength = 7)]
        public string Password{get; set;}
        
        public string Token{get; set;}
    }
}
