﻿using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.DTO;
using backend.Entities;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    public class AccountController:BaseApiController
    {
        private readonly DataContext context;
        private readonly ITokenService tokenService;

        public AccountController(DataContext context,ITokenService tokenService)
        {
            this.context = context;
            this.tokenService = tokenService;
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

            context.Users.Add(user);
            await context.SaveChangesAsync();
            await MarkTokenAsUsedAsync(registerDto.Token);

            return new UserDto
            {
                Email = user.Email,
                Token = tokenService.CreateToken(user)
            };
        }

        [HttpPost("login")] // POST: api/account/login
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await context.Users.SingleOrDefaultAsync(x => x.Email == loginDto.Email);

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
                Token = tokenService.CreateToken(user)
            };
        }

        [AllowAnonymous]
        [HttpPost("changePassword")] // /api/account/changePassword
        public async Task<ActionResult<InvitationDto>> ChangePassword(PasswordResetDto PassDto)
        {
            var request = await context.UserRequests.FirstOrDefaultAsync(i => i.Token == PassDto.Token);

            if (request == null)
            {
                return NotFound("Request not found");
            }

            var user = await context.Users.FirstOrDefaultAsync(i => i.Email == PassDto.Email);

            var hmac = new HMACSHA512();
            user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(PassDto.NewPassword));
            user.PasswordSalt = hmac.Key;

            await context.SaveChangesAsync();
            await MarkTokenAsUsedAsync(PassDto.Token);

            return Ok();
        }

        private async Task<bool> EmailExists(string email)
        {
            return await context.Users.AnyAsync(x => x.Email == email); //ako bude problema ovo email.ToLower() treba da se prepravi
        }

        public async Task<bool> IsValidTokenAsync(string token)
        {
            var invitation = await context.Invitations.FirstOrDefaultAsync(i => i.Token == token && !i.IsUsed && i.ExpirationDate > DateTime.UtcNow);
            return invitation != null;
        }

        public async Task MarkTokenAsUsedAsync(string token)
        {
            var invitation = await context.Invitations.FirstOrDefaultAsync(i => i.Token == token);
            if (invitation != null)
            {
                invitation.IsUsed = true;
                await context.SaveChangesAsync();
            }
        }
    }
}