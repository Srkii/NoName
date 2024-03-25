using backend.Entities;

namespace backend.DTO.UserDTOs
{
    public class RoleChangeDTO
    {
        public int Id { get; set; }
        public UserRole Role { get; set; }
    }
}
