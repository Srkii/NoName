using System.ComponentModel.DataAnnotations;

namespace backend.DTO.AccountDTOs
{
    public class LoginDto
    {
        [Required]
        public string Password{get; set;}
        
        [Required]
        public string Email{get; set;}
    }
}