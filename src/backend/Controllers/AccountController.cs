using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.DTO;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers{

    public class AccountController:BaseApiController
    {
        private readonly DataContext context;

        private readonly ITokenService tokenService;

        public AccountController(DataContext context,ITokenService tokenService)
        {
            this.context = context;
            this.tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {   
            if(await EmailExists(registerDto.Email))
                return BadRequest("Email is already in use");

            var sha = new HMACSHA512();

            var user = new AppUser{
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                PasswordHash = sha.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
                PasswordSalt = sha.Key
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return new UserDto
            {
                Email = user.Email,
                Token = tokenService.CreateToken(user)
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await context.Users.SingleOrDefaultAsync(x => x.Email == loginDto.Email);

            if(user == null) return Unauthorized("Account with this email doesn't exists");

            var sha = new HMACSHA512(user.PasswordSalt);

            var computedHash = sha.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for(int i=0;i<computedHash.Length;i++)
            {
                if(computedHash[i] != user.PasswordHash[i]) return Unauthorized("invalid password");
            }

            return new UserDto
            {
                Email = user.Email,
                Token = tokenService.CreateToken(user)
            };
        }

        private async Task<bool> EmailExists(string email)
        {
            return await context.Users.AnyAsync(x => x.Email == email);
        }

    }

}
