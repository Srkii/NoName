using backend.Entities;

namespace backend.DTO
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Email{get; set;}
        public string Token{get; set;}
        public UserRole Role { get; set; }
    }
}
