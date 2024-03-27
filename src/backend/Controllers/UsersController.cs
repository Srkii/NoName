using System.Security.Cryptography;
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
  [Authorize]
  public class UsersController : BaseApiController
  {
    private readonly DataContext _context;
    private ITokenService _tokenService;
    
    private readonly IPhotoService _photoService;
    public UsersController(DataContext context, ITokenService ts, IPhotoService photoService)
    {
      _photoService = photoService;
      _context = context;
      _tokenService = ts;
    }

    //[AllowAnonymous] //skloni ovo ako hoces da radi samo ako ima token
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers()
    {
      var users = await _context.Users.ToListAsync();
      return users;
    }
    //[AllowAnonymous] 
    [HttpGet("{id}")] // /api/users/2
    public async Task<ActionResult<AppUser>> GetUser(int id)
    {
      return await _context.Users.FindAsync(id);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("updateUser/{id}")] // /api/users/updateUser
    public async Task<ActionResult<UserDto>> UpdateUser(int id, [FromBody] UpdateUserDto data)
    {
      var user = await _context.Users.FindAsync(id);
      if (data.FirstName != null && data.FirstName != "") user.FirstName = data.FirstName;
      if (data.LastName != null && data.LastName != "") user.LastName = data.LastName;
      if (data.Email != null && data.Email != "") user.Email = data.Email;
      await _context.SaveChangesAsync();
      var responseData = new
      {
        UserId = user.Id,
        Updated = true,
        Message = "User data has been updated"
      };

      return Ok(responseData);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("setAsArchived/{id}")]   //api/users/setAsArchived/1
    public async Task<ActionResult<UserDto>> ArchiveUser(int id)
    {
      var user = await _context.Users.FindAsync(id);

      if (user != null)
      {
        user.Archived = true;
        await _context.SaveChangesAsync();
      }
      else { return BadRequest("User doesn't exists"); }

      var responseData = new
      {
        UserId = user.Id,
        Archived = true,
        Message = "User is successfully archived"
      };

      return Ok(responseData);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("changeUserRole")]   //api/users/changeUserRole
    public async Task<ActionResult<UserDto>> ChangeUserRole(RoleChangeDTO dto)
    {
      var user = await _context.Users.FindAsync(dto.Id);

      if (user != null)
      {
        user.Role = dto.Role;
        await _context.SaveChangesAsync();
      }
      else { return BadRequest("User doesn't exists"); }

      var responseData = new
      {
        UserId = user.Id,
        Deleted = true,
        Message = "User role is set to " + dto.Role
      };

      return Ok(responseData);
    }

    [HttpPut("changePassword/{id}")] // /api/users/changePassword
    public async Task<ActionResult<UserDto>> ChangePassword(int id, [FromBody] ChangePasswordDto data)
    {
      var user = await _context.Users.FindAsync(id);
      
      if(!VerifyPassword(user,data.CurrentPassword))
      {
        return Unauthorized("Password is unvalid");
      }

      var hmac = new HMACSHA512();
      user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data.NewPassword));
      user.PasswordSalt = hmac.Key;
      await _context.SaveChangesAsync();

      var responseData = new
      {
        UserId = user.Id,
        Updated = true,
        Message = "Password has been updated"
      };
      return Ok(responseData);
    }

    private bool VerifyPassword(AppUser user, string password)
    {
      using var hmac = new HMACSHA512(user.PasswordSalt);
      var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

      return computedHash.SequenceEqual(user.PasswordHash);
    }

    [AllowAnonymous]
    [HttpGet("token/{token}")] // /api/users/token
    public async Task<ActionResult<InvitationDto>> GetEmail(string token)
    {
      var invitation = await _context.Invitations.FirstOrDefaultAsync(i => i.Token == token);

      if (invitation == null)
      {
        return NotFound();
      }

      return new InvitationDto { Email = invitation.Email, Token = invitation.Token };
    }
  }
}