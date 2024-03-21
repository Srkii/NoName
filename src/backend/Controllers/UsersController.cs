using System.Linq;
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

namespace backend.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly DataContext context;
        private ITokenService tokenService;

        private readonly IPhotoService photoService;
        public UsersController(DataContext context,ITokenService ts,IPhotoService photoService){
            this.photoService = photoService;
            this.context = context;
            this.tokenService = ts;
        }

        // [AllowAnonymous] //skloni ovo ako hoces da radi samo ako ima token
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers()
        {
            var users = await context.Users.ToListAsync();
            return users;
        }
        //[AllowAnonymous] 
        [HttpGet("{id}")] // /api/users/2
        public async Task<ActionResult<AppUser>> GetUser(int id){
            return await context.Users.FindAsync(id);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("updateUser/{id}")]
        public async Task<ActionResult<UserDto>> UpdateUser(int id,[FromBody] ChangePasswordDto data){
          var user = await context.Users.FindAsync(id);
          if(data.FirstName!=null && data.FirstName!= "") user.FirstName=data.FirstName;
          if(data.LastName!=null && data.LastName != "") user.LastName=data.LastName;
          if(data.Email!=null && data.Email != "") user.Email=data.Email;
          await context.SaveChangesAsync();
          return new UserDto{
            Id=user.Id,
            Email = user.Email,
            Token = tokenService.CreateToken(user)
          };
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("setAsArchived/{id}")]   //api/users/setAsArchived/1
        public async Task<ActionResult<UserDto>> ArchiveUser(int id){            
          var user = await context.Users.FindAsync(id);

          if(user!=null)
          {
            user.Archived = true;
            await context.SaveChangesAsync();
          }
          else{return BadRequest("User doesn't exists");}
          
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
        public async Task<ActionResult<UserDto>> ChangeUserRole(RoleChangeDTO dto){            
          var user = await context.Users.FindAsync(dto.Id);
          
          if(user!=null)
          {
            user.Role = dto.Role;
            await context.SaveChangesAsync();
          }
          else{return BadRequest("User doesn't exists");}
          
          var responseData = new 
          {
              UserId = user.Id,
              Deleted = true,
              Message = "User role is set to " + dto.Role
          };

          return Ok(responseData);
        }

        [AllowAnonymous]
        [HttpGet("token/{token}")] // /api/users/token
        public async Task<ActionResult<InvitationDto>> GetEmail(string token)
        {
            var invitation = await context.Invitations.FirstOrDefaultAsync(i => i.Token == token);

            if (invitation == null)
            {
                return NotFound();
            }

            return new InvitationDto { Email = invitation.Email, Token = invitation.Token };
        }
        [HttpPost("add-photo/{id}")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(int id,IFormFile image)
        {   
          var user = await context.Users.FindAsync(id);
          
          var oldphoto = await context.Photos.FirstOrDefaultAsync(x => x.AppUserId == id);

          var result = await photoService.AddPhotoAsync(image);
          var photo = new Photo{
            url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId,
            AppUserId=user.Id
          };
          
          
          if(oldphoto != null){
            await photoService.DeletePhotoAsync(oldphoto.PublicId);
            context.Photos.Remove(oldphoto);
          }
          
          context.Photos.Add(photo);
          await context.SaveChangesAsync();
          return new PhotoDto
          {
            Id=photo.Id,
            Url = photo.url,
          };
        }
        [HttpDelete("remove-photo/{id}")]
        public async Task<ActionResult> RemovePhoto(int id){
          var image = await context.Photos.FirstOrDefaultAsync(x => x.AppUserId == id);
          var response = await photoService.DeletePhotoAsync(image.PublicId);
          context.Photos.Remove(image);
          return Ok(response);
        }

        [HttpGet("profilePic/{id}")]
        public async Task<ActionResult<PhotoDto>> GetPhotoByUserId(int id){
            var result = await context.Photos.FirstOrDefaultAsync(x => x.AppUserId == id);
            return new PhotoDto{
              Id = result.Id,
              Url= result.url
            };
        }
    }
}