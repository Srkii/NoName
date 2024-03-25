using System.ComponentModel.DataAnnotations;

namespace backend.DTO.UserDTOs
{
    public class UpdateUserDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        [EmailAddress]
        public string Email { get; set; }
    }
}
