using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
#nullable enable
namespace backend.DTO
{
    public class UpdateInfoDto
    {
        public string? FirstName{get;set;}
        public string? LastName{get;set;}
        public string? Email{get;set;}
    }
}