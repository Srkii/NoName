using System.Runtime.CompilerServices;
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

    [AllowAnonymous] //skloni ovo ako hoces da radi samo ako ima token
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

    [AllowAnonymous]
    [HttpGet("availableUsers/{projectCreatorId}")]
    public async Task<ActionResult<AppUser>> GetAvailableUsers(int projectCreatorId)
    {
      var availableUsers = await _context.Users.Where(user => user.Id != projectCreatorId && user.Role != UserRole.Admin).ToListAsync();
      return  Ok(availableUsers);
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

    //[Authorize(Roles = "Admin")]
    [AllowAnonymous]
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

    [AllowAnonymous]
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

    [AllowAnonymous]
    [HttpGet("all")]
    public async Task<ActionResult<int>> GetAllUsers()
    {
        var query=_context.Users.AsQueryable();
        query = query.Where(u => u.Archived == false);

        var Users=await query.ToListAsync();

        return Users.Count;
    }

    [AllowAnonymous]
    [HttpGet("filtered")]
    public async Task<ActionResult<IEnumerable<AppUser>>> GetUsersFP(int pageSize=0, int currentPage = 0, UserRole? role=null, string searchTerm="")
    {
        var query = _context.Users.AsQueryable();
        query = query.Where(u => u.Archived == false);

        if(role!=null)
        {
          query = query.Where(u => u.Role == role);
        }


        if(!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(u => EF.Functions.Like(u.FirstName.ToLower(), $"%{searchTerm.ToLower()}%") || EF.Functions.Like(u.LastName.ToLower(), $"%{searchTerm.ToLower()}%"));
        }


        var filteredUsers=await query.Skip((currentPage-1)*pageSize).Take(pageSize).ToListAsync();

        return filteredUsers;
    }
    [AllowAnonymous]
    [HttpGet("filteredCount")]
    public async Task<ActionResult<int>> CountFilteredUsers(UserRole? role=null)
    {
      var query=_context.Users.AsQueryable();
      query = query.Where(u => u.Archived == false);

      if(role!=null)
      {
        query=query.Where(u=>u.Role==role);
      }
      

      var filteredUsers=await query.ToListAsync();

      return filteredUsers.Count;
    }
    [AllowAnonymous]
    [HttpGet("getByRole")]
    public async Task<ActionResult<IEnumerable<AppUser>>> GetUserByRole(UserRole? role=null)
    {
      var query=_context.Users.AsQueryable();
      query = query.Where(u => u.Archived == false);

      if(role!=null)
      {
        query=query.Where(u=>u.Role==role);
      }
      var filteredUsers=await query.ToListAsync();

      return filteredUsers;
    }

    [AllowAnonymous]
    [HttpGet("getArchived")]
    public async Task<ActionResult<IEnumerable<AppUser>>> GetArchivedUsers()
    {
      var query = _context.Users.AsQueryable();
      query = query.Where(u => u.Archived == true);

      var archUsers=await query.ToListAsync();
      return archUsers;

    }

    [AllowAnonymous]
    [HttpPut("removeFromArch")]   //api/users/setAsArchived/1
    public async Task<IActionResult> RemoveArch([FromBody] List<int> userIds)
    { 
      var usersToUpdate=await _context.Users.Where(u=> userIds.Contains(u.Id))
        .ToListAsync();

      foreach (var user in usersToUpdate)
      {
        user.Archived=false;
      }

      await _context.SaveChangesAsync();

      return Ok(new { message = "Tasks updated to Completed status." });
    }

  }
}