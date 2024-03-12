using System.Linq;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.DTO;
using backend.Entities;
using backend.Interfaces;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Authorize]
    public class UsersController:BaseApiController
    {
        private readonly DataContext context;
        private ITokenService tokenService;
        public UsersController(DataContext context,ITokenService ts){
            this.context = context;
            this.tokenService = ts;
        }

        // [AllowAnonymous] //skloni ovo ako hoces da radi samo ako ima token
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers(){
            var users = await context.Users.ToListAsync();
            return users;
        }
        //[AllowAnonymous] 
        [HttpGet("{id}")] // /api/users/2
        public async Task<ActionResult<AppUser>> GetUser(int id){
            AppUser user = await context.Users.FindAsync(id);
            if(user!=null) return user;
            return null;
        }
        [HttpPut("updateUser/{id}")]
        public async Task<ActionResult<UserDto>> UpdateUser(int id,[FromBody] UpdateInfoDto data){            
          var user = await context.Users.FindAsync(id);
          var hmac = new HMACSHA512(user.PasswordSalt);
          var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data.CurrentPassword));
          if(computedHash.SequenceEqual(user.PasswordHash)){
            if(data.FirstName!=null && data.FirstName!= "") user.FirstName=data.FirstName;
            if(data.LastName!=null && data.LastName != "") user.LastName=data.LastName;
            if(data.Email!=null && data.Email != "") user.Email=data.Email;
            if(data.NewPassword!=null && data.NewPassword != ""){
              var hmac2 = new HMACSHA512(user.PasswordSalt);
              user.PasswordHash = hmac2.ComputeHash(Encoding.UTF8.GetBytes(data.NewPassword));
              user.PasswordSalt = hmac2.Key;
            }
            await context.SaveChangesAsync();
          }
          return new UserDto{
            Email = user.Email,
            Token = tokenService.CreateToken(user)
          };
        }
    }
}