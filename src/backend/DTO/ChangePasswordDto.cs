using System.ComponentModel.DataAnnotations;
#nullable enable
namespace backend.DTO
{
    public class ChangePasswordDto
    {
        [Required]
        public string? CurrentPassword{get;set;}
        public string? NewPassword{get;set;}
        public string? NewPasswordConfirm{get;set;}

    }
}