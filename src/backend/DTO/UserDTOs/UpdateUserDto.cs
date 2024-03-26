using System.ComponentModel.DataAnnotations;

namespace backend.DTO.UserDTOs
{
    public class UpdateUserDto
    {
        [RegularExpression("^(?=[A-Z])[A-Za-z]{2,}$")]
        public string FirstName { get; set; }

        [RegularExpression("^(?=[A-Z])[A-Za-z]{2,}$")]
        public string LastName { get; set; }
        
        [EmailAddress]
        public string Email { get; set; }
    }
}
