using System.ComponentModel.DataAnnotations;

namespace backend.DTO.EmailDTOs
{
    public class InvitationDto
    {
        [EmailAddress]
        public string Email { get; set; }
        public string Token { get; set; }
    }

}

