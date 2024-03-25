using System.ComponentModel.DataAnnotations;

namespace backend.DTO.EmailDTOs
{
    public class EmailDto
    {
        [EmailAddress]
        public string Receiver{get; set;}
    }
}
