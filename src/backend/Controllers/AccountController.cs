using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.DTO;
using backend.Entities;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SixLabors.ImageSharp;

namespace backend.Controllers
{
    public class AccountController:BaseApiController
    {
        private readonly DataContext _context;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _configuration;

        public AccountController(DataContext context,ITokenService tokenService,IConfiguration configuration)
        {
            _context = context;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        [HttpPost("register")] // POST: api/account/register
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {   
            if(!await IsValidTokenAsync(registerDto.Token))
                return BadRequest("Token is not valid");

            if(await EmailExists(registerDto.Email))
                return BadRequest("E-mail is already in use.");

            var hmac = new HMACSHA512();

            var user = new AppUser{
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
                PasswordSalt = hmac.Key,
                Role = UserRole.Member //default vrednost novo registrovanog korisnika je Member
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            await MarkTokenAsUsedAsync(registerDto.Token);

            return new UserDto
            {
                Id = user.Id,
                Role = user.Role,
                Email = user.Email,
                Token = _tokenService.CreateToken(user)
            };
        }

        [HttpPost("login")] // POST: api/account/login
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _context.Users.SingleOrDefaultAsync(x => x.Email == loginDto.Email);

            if(user == null) return Unauthorized("Account with this e-mail doesn't exists.");

            var hmac = new HMACSHA512(user.PasswordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for(int i=0;i<computedHash.Length;i++)
            {
                if(computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid password");
            }

            return new UserDto
            {
                Id = user.Id,
                Role = user.Role,
                Email = user.Email,
                Token = _tokenService.CreateToken(user)
            };
        }

        // [AllowAnonymous]
        [HttpPost("resetPassword")] // /api/account/resetPassword
        public async Task<ActionResult<InvitationDto>> ResetPassword(PasswordResetDto PassDto)
        {
            var request = await _context.UserRequests.FirstOrDefaultAsync(i => i.Token == PassDto.Token);

            if (request == null)
            {
                return NotFound("Request not found");
            }

            request.IsUsed = true;

            var user = await _context.Users.FirstOrDefaultAsync(i => i.Email == PassDto.Email);

            var hmac = new HMACSHA512();
            user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(PassDto.NewPassword));
            user.PasswordSalt = hmac.Key;

            await _context.SaveChangesAsync();
            
            return Ok();
        }

        // [AllowAnonymous] //vraca mi mail na osnovu tokena koji je potreban za reset passworda
        [HttpGet("token/{token}")] // /api/account/token
        public async Task<ActionResult<UserRequestDto>> GetEmail(string token)
        {
            var userrequest = await _context.UserRequests.FirstOrDefaultAsync(i => i.Token == token);

            if (userrequest == null)
            {
                return NotFound();
            }

            return new UserRequestDto { Email = userrequest.Email, Token = userrequest.Token };
        }

        private async Task<bool> EmailExists(string email)
        {
            return await _context.Users.AnyAsync(x => x.Email == email); //ako bude problema ovo email.ToLower() treba da se prepravi
        }

        public async Task<bool> IsValidTokenAsync(string token)
        {
            var invitation = await _context.Invitations.FirstOrDefaultAsync(i => i.Token == token && !i.IsUsed && i.ExpirationDate > DateTime.UtcNow);
            return invitation != null;
        }

        public async Task MarkTokenAsUsedAsync(string token)
        {
            var entity = await _context.Invitations.FirstOrDefaultAsync(i => i.Token == token);
            
            if (entity != null)
            {
                entity.IsUsed = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<ActionResult<bool>> ValidateTokenAsync(string token)
        {
            var secretKey = _configuration["TokenKey"];
            var key = Encoding.UTF8.GetBytes(secretKey);

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);

                var userEmailClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
                var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == userEmailClaim);

                if(user != null) return true;
                return false;
            }
            catch (Exception)
            {
                return false; 
            }
        }
    }
}