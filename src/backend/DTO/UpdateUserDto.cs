using System.ComponentModel.DataAnnotations;

namespace backend.DTO
{
    public class UpdateUserDto
    {
        [StringLength(30, ErrorMessage = "First name is too long", MinimumLength = 2)]
        [RegularExpression(@"^[A-Za-zĀ-ž]{2,}$", ErrorMessage = "First name must contain only letters and be at least two characters long.")]
        public string FirstName { get; set; }

        [StringLength(30, ErrorMessage = "Last name is too long", MinimumLength = 2)]
        [RegularExpression(@"^[A-Za-zĀ-ž]{2,}$", ErrorMessage = "Last name must contain only letters and be at least two characters long.")]
        public string LastName { get; set; }
        
        [EmailAddress]
        public string Email { get; set; }
    }
}
